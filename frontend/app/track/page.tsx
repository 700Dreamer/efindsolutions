"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { MapboxTracking } from "../components/MapboxTracking";
import { OrderTimeline } from "../components/OrderTimeline";
import { fetchApi } from "../lib/api";
import { 
  Search, 
  Package, 
  MapPin, 
  Truck, 
  Calendar, 
  Phone, 
  AlertCircle, 
  ArrowRight,
  Sparkles
} from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (numberToFetch: string) => {
    if (!numberToFetch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(`/tracking/order/${encodeURIComponent(numberToFetch.trim())}`);
      setTrackingData(data);
    } catch (err: any) {
      setError(err.message || "Order not found. Please verify the order number.");
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      fetchTracking(initialOrder);
    }
  }, [initialOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber);
  };

  return (
    <main className="flex-1 pt-36 pb-24 max-w-[1120px] mx-auto px-5 sm:px-8 lg:px-10 w-full">
      {/* Header */}
      <div className="text-center max-w-[620px] mx-auto mb-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Live Dispatch Telemetry</span>
        <h1 className="section-title text-zinc-900 mt-2 mb-3">Track Your Order</h1>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Enter your order reference to inspect real-time progress and live rider GPS coordinates.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-[580px] mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex items-center p-2 rounded-full bg-white border border-black/10 shadow-lg focus-within:ring-2 focus-within:ring-[#087FEF]/30 transition-all">
          <Search className="w-4 h-4 text-zinc-400 ml-3.5 shrink-0" />
          <input
            type="text"
            required
            placeholder="e.g. EF-20260513-C2A193"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-transparent outline-none text-[#111111] placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold transition-transform active:scale-95 shrink-0"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-[580px] mx-auto p-4 mb-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {trackingData && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* 1. Header Card with Order Info */}
          <div className="p-8 rounded-[28px] bg-white border border-black/8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF9FF] text-[#087FEF] flex items-center justify-center text-2xl font-bold">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 uppercase font-semibold">Order Reference</span>
                <h2 className="text-xl font-bold text-zinc-900">#{trackingData.order_number}</h2>
                <p className="text-xs text-zinc-600 mt-0.5">{trackingData.service_name}</p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] text-zinc-400 uppercase font-semibold">Total Amount</span>
              <p className="text-xl font-bold text-[#087FEF]">
                UGX {Number(trackingData.total_amount || 0).toLocaleString()}
              </p>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                {trackingData.order_status}
              </span>
            </div>
          </div>

          {/* 2. Visual Stage Progression Timeline */}
          <div className="p-8 rounded-[28px] bg-white border border-black/8 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 mb-4">Milestone Progress</h3>
            <OrderTimeline currentStatus={trackingData.order_status} />
          </div>

          {/* 3. Live Mapbox Tracker (Active when in_transit or rider assigned) */}
          {(trackingData.order_status === "in_transit" || trackingData.delivery_id) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-[#087FEF]" /> Live Rider Telemetry
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                  Active Mapbox Satellite
                </span>
              </div>

              <MapboxTracking
                deliveryId={trackingData.delivery_id}
                riderLat={trackingData.rider_lat}
                riderLng={trackingData.rider_lng}
                deliveryAddress={trackingData.delivery_address}
                riderName={trackingData.rider_name || "Assigned Dispatch Rider"}
                riderPhone={trackingData.rider_phone}
              />
            </div>
          )}

          {/* 4. Delivery Particulars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-[22px] bg-white border border-black/8 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#087FEF]" /> Delivery Address
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                {trackingData.delivery_address || "Customer Address on File"}
              </p>
            </div>

            <div className="p-6 rounded-[22px] bg-white border border-black/8 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-[#087FEF]" /> Dispatch Personnel
              </h4>
              <p className="text-xs text-zinc-900 font-semibold">{trackingData.rider_name || "Assigned Unit"}</p>
              {trackingData.rider_phone ? (
                <a href={`tel:${trackingData.rider_phone}`} className="text-xs text-[#087FEF] font-medium hover:underline mt-1 block">
                  {trackingData.rider_phone}
                </a>
              ) : (
                <p className="text-[11px] text-zinc-400 mt-1">Contact dispatch support for assistance</p>
              )}
            </div>
          </div>

          <div className="text-center pt-4">
            <Link href="/my-orders" className="text-xs text-zinc-600 hover:text-zinc-900 font-semibold underline">
              View all your previous orders →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center pt-36"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>}>
        <TrackContent />
      </Suspense>
      <Footer />
    </div>
  );
}
