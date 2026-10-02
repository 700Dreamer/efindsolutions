"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "../../components/AdminSidebar";
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { 
  Package, 
  Search, 
  CheckCircle2, 
  Bike, 
  ExternalLink, 
  X, 
  FileText,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<number | "">("");
  const [assigning, setAssigning] = useState(false);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("confirmed");
  const [statusNotes, setStatusNotes] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const loadData = async () => {
    try {
      const [ordersData, usersData] = await Promise.all([
        fetchApi("/admin/orders"),
        fetchApi("/admin/users?role=delivery").catch(() => []),
      ]);
      setOrders(ordersData);
      setRiders(usersData);
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login");
      return;
    }
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, isLoading, router]);

  const handleAssignRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedRiderId) return;
    setAssigning(true);
    try {
      const delId = selectedOrder.delivery?.id || selectedOrder.id;
      await fetchApi(`/deliveries/assign/${delId}`, {
        method: "POST",
        data: {
          delivery_person_id: Number(selectedRiderId),
          delivery_address: selectedOrder.delivery_address,
        },
      });
      await loadData();
      setAssignModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to assign rider");
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await fetchApi(`/admin/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        data: {
          status: targetStatus,
          notes: statusNotes,
          estimated_delivery: estimatedDelivery || null,
        },
      });
      await loadData();
      setStatusModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      !search.trim() ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen flex bg-[#F7F7F5]">
      <AdminSidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-[1440px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Fulfillment Operations</span>
            <h1 className="text-2xl font-bold text-zinc-900 mt-1">Orders & Dispatch Dispatcher</h1>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {["all", "pending", "confirmed", "processing", "in_transit", "delivered", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? "bg-[#0A0A0A] text-white shadow-sm"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 border border-black/5"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, client, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-black/10 rounded-full outline-none focus:ring-2 focus:ring-[#087FEF]/30"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[28px] border border-black/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b border-black/5 text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Order Ref</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned Rider</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900">{order.user?.name}</p>
                      <p className="text-[11px] text-zinc-400">{order.user?.phone || order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-800">{order.service?.name}</p>
                      <p className="text-[11px] text-zinc-400">Qty: {order.quantity}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#087FEF]">
                      UGX {Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "in_transit"
                          ? "bg-blue-50 text-blue-700"
                          : order.status === "cancelled"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.delivery?.rider ? (
                        <span className="text-zinc-800 font-medium flex items-center">
                          <Bike className="w-3.5 h-3.5 mr-1 text-[#087FEF]" /> {order.delivery.rider.name}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setSelectedRiderId(order.delivery?.delivery_person_id || "");
                          setAssignModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#EAF9FF] text-[#087FEF] font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Assign
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setTargetStatus(order.status);
                          setStatusNotes("");
                          setEstimatedDelivery("");
                          setStatusModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#0A0A0A] text-white font-semibold hover:bg-zinc-800 transition-colors"
                      >
                        Status
                      </button>

                      <Link
                        href={`/track?order=${order.order_number}`}
                        target="_blank"
                        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 inline-block align-middle"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Assign Rider Modal */}
      {assignModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-1">Dispatch Rider Assignment</h3>
            <p className="text-xs text-zinc-500 mb-6">Assign a delivery unit to Order #{selectedOrder.order_number}</p>

            <form onSubmit={handleAssignRider} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                  Select Dispatch Rider
                </label>
                <select
                  required
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(Number(e.target.value))}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                >
                  <option value="">Choose a rider...</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.phone || r.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                  Delivery Destination
                </label>
                <input
                  type="text"
                  defaultValue={selectedOrder.delivery_address}
                  readOnly
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl text-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={assigning}
                className="w-full py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition-transform active:scale-98"
              >
                {assigning ? "Assigning..." : "Confirm Assignment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Update Order Status Modal */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-1">Update Order Status</h3>
            <p className="text-xs text-zinc-500 mb-6">Order #{selectedOrder.order_number}</p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                  New Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30 capitalize"
                >
                  {["pending", "confirmed", "processing", "ready", "in_transit", "delivered", "completed", "cancelled"].map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                  Status Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. In laser queue / Quality check completed"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition-transform active:scale-98"
              >
                Save Status Change
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
