"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "../components/AdminSidebar";
import { fetchApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { 
  Package, 
  DollarSign, 
  CheckCircle2, 
  Users, 
  Mail, 
  Truck,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
  Bike,
  Navigation,
  Clock,
  Calendar,
  X,
  FileText
} from "lucide-react";

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals for instant actions directly from overview
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<number | "">("");
  const [targetStatus, setTargetStatus] = useState("confirmed");
  const [statusNotes, setStatusNotes] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, ordersData, ridersData] = await Promise.all([
        fetchApi("/admin/stats"),
        fetchApi("/admin/orders"),
        fetchApi("/admin/users?role=delivery").catch(() => []),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 8)); // Top 8 recent orders
      setRiders(ridersData);
    } catch (err) {
      console.error("Failed to load admin dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/admin");
      return;
    }
    if (!isLoading && user && !isAdmin) {
      router.push("/");
      return;
    }

    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, isLoading, router]);

  const handleAssignRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedRiderId) return;
    setSubmitting(true);
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
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#F7F7F5]">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F7F7F5]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto max-w-[1500px]">
        
        {/* Top Header & Fast Navigation */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Executive Command Center</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1 tracking-tight">Admin Operations Console</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Real-time dispatch, fleet telemetry, catalog management, and payment audits.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/services"
              className="px-4 py-2.5 rounded-full bg-white border border-black/10 text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#087FEF]" />
              <span>Add Craft Service</span>
            </Link>

            <Link
              href="/admin/orders"
              className="px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-zinc-800 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders Dispatch Table →</span>
            </Link>
          </div>
        </div>

        {/* 1. KPI Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-6 rounded-[24px] bg-white border border-black/8 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Orders</span>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stats?.total_orders || 0}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">{stats?.pending_orders || 0} awaiting dispatch</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#EAF9FF] text-[#087FEF] flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-black/8 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Gross Revenue</span>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">
                UGX {Number(stats?.total_revenue || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Pesapal v3 Secured</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-black/8 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Fulfillment Rate</span>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stats?.completion_rate || 0}%</h3>
              <p className="text-[11px] text-zinc-500 mt-1">{stats?.completed_orders || 0} delivered safely</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-black/8 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Customer Messages</span>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stats?.unread_messages || 0}</h3>
              <p className="text-[11px] text-zinc-500 mt-1">Pending inquiries</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2. ADMIN OPERATIONS QUICK-ACTION HUB */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Admin Operational Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Action 1: Dispatch & Assign */}
            <Link
              href="/admin/orders"
              className="p-5 rounded-[24px] bg-white border border-black/8 shadow-sm hover:shadow-md hover:border-[#087FEF]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF9FF] text-[#087FEF] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#087FEF] bg-[#EAF9FF] px-2 py-0.5 rounded-full">
                  DISPATCH
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#087FEF] transition-colors">
                  Assign Riders & Orders
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Assign active dispatch riders, set turnaround dates, and transition order stages.
                </p>
              </div>
            </Link>

            {/* Action 2: Manage Services Catalog */}
            <Link
              href="/admin/services"
              className="p-5 rounded-[24px] bg-white border border-black/8 shadow-sm hover:shadow-md hover:border-[#087FEF]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  CATALOG
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                  Craft Services & Pricing
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Create new services, update base prices in UGX, edit turnaround times, and upload craft photos.
                </p>
              </div>
            </Link>

            {/* Action 3: Users & Fleet Management */}
            <Link
              href="/admin/users"
              className="p-5 rounded-[24px] bg-white border border-black/8 shadow-sm hover:shadow-md hover:border-[#087FEF]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  FLEET
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-purple-600 transition-colors">
                  Riders & User Roles
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Register new dispatch riders, manage staff permissions, and review customer profiles.
                </p>
              </div>
            </Link>

            {/* Action 4: Audit Logs & Security */}
            <Link
              href="/admin/audit-logs"
              className="p-5 rounded-[24px] bg-white border border-black/8 shadow-sm hover:shadow-md hover:border-[#087FEF]/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full">
                  SECURITY
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                  System Audit Logs
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Inspect immutable logs of all staff logins, status modifications, and payment settlements.
                </p>
              </div>
            </Link>

          </div>
        </div>

        {/* 3. ACTIVE DISPATCH QUEUE (Actionable directly on the dashboard) */}
        <div className="p-8 rounded-[28px] bg-white border border-black/8 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Live Orders & Fast Dispatch Queue</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Click "Assign" or "Status" to take immediate operational action on any order.</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#087FEF] hover:underline flex items-center space-x-1"
            >
              <span>View All ({stats?.total_orders || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Order Ref</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Craft Service</th>
                  <th className="pb-3 font-semibold">Total Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Assigned Rider</th>
                  <th className="pb-3 font-semibold text-right">Instant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F7F5]/50 transition-colors">
                    <td className="py-4 font-mono font-bold text-zinc-900">
                      <Link href={`/track?order=${order.order_number}`} className="hover:text-[#087FEF] hover:underline">
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-zinc-900">{order.user?.name || "Customer"}</p>
                      <p className="text-[10px] text-zinc-400">{order.user?.phone || order.user?.email}</p>
                    </td>
                    <td className="py-4 font-medium text-zinc-700">
                      {order.service?.name}
                      <span className="text-[10px] text-zinc-400 ml-1">(x{order.quantity})</span>
                    </td>
                    <td className="py-4 font-bold text-[#087FEF]">
                      UGX {Number(order.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                        order.status === "in_transit" ? "bg-blue-100 text-blue-800" :
                        order.status === "confirmed" ? "bg-indigo-100 text-indigo-800" :
                        order.status === "processing" ? "bg-amber-100 text-amber-800" :
                        "bg-zinc-100 text-zinc-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {order.delivery?.rider?.name ? (
                        <span className="flex items-center text-zinc-800 font-medium">
                          <Bike className="w-3.5 h-3.5 mr-1 text-[#087FEF]" />
                          {order.delivery.rider.name}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Quick Assign Rider */}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setSelectedRiderId(order.delivery?.delivery_person_id || "");
                            setAssignModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-full bg-[#EAF9FF] text-[#087FEF] hover:bg-[#d8f4ff] font-semibold text-[11px] transition-colors"
                        >
                          {order.delivery?.rider?.name ? "Reassign" : "Assign Rider"}
                        </button>

                        {/* Quick Status Update */}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTargetStatus(order.status);
                            setStatusNotes("");
                            setEstimatedDelivery(order.estimated_delivery || "");
                            setStatusModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 hover:bg-zinc-200 font-semibold text-[11px] transition-colors"
                        >
                          Set Status
                        </button>

                        {/* Live Track */}
                        <Link
                          href={`/track?order=${order.order_number}`}
                          className="p-1 rounded-full text-zinc-400 hover:text-zinc-900"
                          title="Open Live Satellite Map"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 1. ASSIGN RIDER MODAL */}
      {/* ========================================================================= */}
      {assignModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAF9FF] text-[#087FEF] flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Assign Dispatch Rider</h3>
                <p className="text-[11px] text-zinc-500">Order #{selectedOrder.order_number}</p>
              </div>
            </div>

            <form onSubmit={handleAssignRider} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Select Active Fleet Rider
                </label>
                <select
                  required
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(Number(e.target.value))}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                >
                  <option value="">-- Choose a Rider --</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.phone || r.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Destination Address
                </label>
                <input
                  type="text"
                  defaultValue={selectedOrder.delivery_address || ""}
                  onChange={(e) => { selectedOrder.delivery_address = e.target.value; }}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-black/10 text-zinc-600 text-xs font-semibold hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-zinc-800 shadow transition-transform active:scale-95"
                >
                  {submitting ? "Assigning..." : "Confirm Rider Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. UPDATE STATUS MODAL */}
      {/* ========================================================================= */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Transition Order Status</h3>
                <p className="text-[11px] text-zinc-500">Order #{selectedOrder.order_number}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Milestone Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                >
                  <option value="pending">Pending (Awaiting Payment / Review)</option>
                  <option value="confirmed">Confirmed (Approved)</option>
                  <option value="processing">Processing (In Laser/Embroidery Production)</option>
                  <option value="ready">Ready (Packaged for Pickup/Dispatch)</option>
                  <option value="in_transit">In Transit (Rider Dispatched)</option>
                  <option value="delivered">Delivered (Completed)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Internal Operational Notes
                </label>
                <textarea
                  rows={2}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Laser engraving completed, dispatched via Plot 14."
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-[#087FEF]/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-black/10 text-zinc-600 text-xs font-semibold hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-zinc-800 shadow transition-transform active:scale-95"
                >
                  {submitting ? "Updating..." : "Apply Milestone Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
