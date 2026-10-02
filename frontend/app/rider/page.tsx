"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { fetchApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { 
  Bike, 
  MapPin, 
  CheckCircle2, 
  Radio, 
  AlertCircle, 
  Phone, 
  Navigation, 
  Package, 
  ArrowRight,
  XCircle,
  X
} from "lucide-react";

export default function RiderDashboardPage() {
  const router = useRouter();
  const { user, isRider, isAdmin, isLoading } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [activeDeliveryId, setActiveDeliveryId] = useState<number | null>(null);

  // Undelivered modal state
  const [undeliveredModalOpen, setUndeliveredModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [undeliveredReason, setUndeliveredReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/rider");
      return;
    }
    if (!isLoading && user && !isRider && !isAdmin) {
      router.push("/");
      return;
    }

    async function loadDeliveries() {
      try {
        const data = await fetchApi("/deliveries/rider/my-deliveries");
        setDeliveries(data);
        const active = data.find((d: any) => d.status === "in_transit" || d.status === "assigned" || d.status === "picked_up");
        if (active) {
          setActiveDeliveryId(active.id);
        }
      } catch (err) {
        console.error("Failed to load rider deliveries", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDeliveries();
    }
  }, [user, isRider, isAdmin, isLoading, router]);

  // Handle Live GPS broadcast
  const toggleBroadcasting = () => {
    if (broadcasting) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setBroadcasting(false);
    } else {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      setBroadcasting(true);
      const targetDelId = activeDeliveryId || (deliveries.length > 0 ? deliveries[0].id : 1);

      // Simulation / Watcher
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            await fetchApi("/tracking/ping", {
              method: "POST",
              data: {
                delivery_id: targetDelId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            });
          } catch (e) {
            console.error("Ping error", e);
          }
        },
        async (error) => {
          // Fallback simulation in Kampala coordinates
          console.warn("Using simulated coordinates", error);
          try {
            await fetchApi("/tracking/ping", {
              method: "POST",
              data: {
                delivery_id: targetDelId,
                latitude: 0.3476 + (Math.random() - 0.5) * 0.005,
                longitude: 32.5825 + (Math.random() - 0.5) * 0.005,
              },
            });
          } catch (e) {}
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const handleUpdateStatus = async (deliveryId: number, status: string, notes?: string) => {
    setUpdating(true);
    try {
      await fetchApi(`/deliveries/status/${deliveryId}`, {
        method: "POST",
        data: {
          status,
          delivery_notes: notes,
        },
      });

      // Reload
      const updated = await fetchApi("/deliveries/rider/my-deliveries");
      setDeliveries(updated);
      if (status === "delivered" || status === "undelivered") {
        setBroadcasting(false);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
      setUndeliveredModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[1120px] mx-auto px-5 sm:px-8 lg:px-10 w-full">
        {/* Top bar with Rider Telemetry status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-6 border-b border-black/5 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
              <Bike className="w-4 h-4" />
              <span>Rider Dispatch Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Welcome, {user?.name}</h1>
          </div>

          <button
            onClick={toggleBroadcasting}
            className={`px-5 py-3 rounded-full text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95 ${
              broadcasting
                ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                : "bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{broadcasting ? "Stop Live GPS Broadcast" : "Go Live (Broadcast GPS)"}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[28px] border border-black/5 p-8">
            <Bike className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">No active delivery assignments</h3>
            <p className="text-xs text-zinc-500 mt-1">Check back once dispatch assigns orders to your unit.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Assigned Delivery Queue</h2>

            <div className="grid grid-cols-1 gap-6">
              {deliveries.map((del) => {
                const order = del.order;
                const customer = order?.user;
                const status = del.status;

                return (
                  <div
                    key={del.id}
                    className="p-8 rounded-[28px] bg-white border border-black/8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm font-bold text-zinc-900">#{order?.order_number}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          status === "delivered"
                            ? "bg-emerald-50 text-emerald-700"
                            : status === "in_transit"
                            ? "bg-blue-50 text-blue-700"
                            : status === "undelivered" || status === "failed"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {status.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-zinc-900">{order?.service?.name}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-600">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-[#087FEF] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-zinc-800">Destination:</span>
                            <p className="text-zinc-600">{del.delivery_address}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Phone className="w-4 h-4 text-[#087FEF] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-zinc-800">Customer: {customer?.name}</span>
                            <p className="text-[#087FEF] font-medium">{customer?.phone || "No phone listed"}</p>
                          </div>
                        </div>
                      </div>

                      {del.delivery_notes && (
                        <p className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          Notes: {del.delivery_notes}
                        </p>
                      )}
                    </div>

                    {/* Action Controls for Status Progression */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-black/5">
                      {status === "assigned" && (
                        <button
                          onClick={() => handleUpdateStatus(del.id, "picked_up")}
                          disabled={updating}
                          className="px-4 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-sm"
                        >
                          Mark Picked Up
                        </button>
                      )}

                      {status === "picked_up" && (
                        <button
                          onClick={() => handleUpdateStatus(del.id, "in_transit")}
                          disabled={updating}
                          className="px-4 py-2.5 rounded-full bg-[#087FEF] hover:bg-[#123EDA] text-white text-xs font-semibold shadow-sm"
                        >
                          Start In Transit
                        </button>
                      )}

                      {status === "in_transit" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(del.id, "delivered")}
                            disabled={updating}
                            className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark Delivered
                          </button>

                          <button
                            onClick={() => {
                              setSelectedDelivery(del);
                              setUndeliveredReason("");
                              setUndeliveredModalOpen(true);
                            }}
                            disabled={updating}
                            className="px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Report Issue / Undelivered
                          </button>
                        </>
                      )}

                      {status === "delivered" && (
                        <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed Successfully
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Undelivered Reason Modal */}
      {undeliveredModalOpen && selectedDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setUndeliveredModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-2">Report Undelivered Order</h3>
            <p className="text-xs text-zinc-500 mb-6">Specify the reason for the failed delivery dispatch.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                  Failure Reason
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Client not at location / phone unreachable after multiple attempts..."
                  value={undeliveredReason}
                  onChange={(e) => setUndeliveredReason(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <button
                type="button"
                disabled={!undeliveredReason.trim() || updating}
                onClick={() => handleUpdateStatus(selectedDelivery.id, "undelivered", undeliveredReason)}
                className="w-full py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-transform active:scale-98"
              >
                {updating ? "Submitting..." : "Confirm Undelivered Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
