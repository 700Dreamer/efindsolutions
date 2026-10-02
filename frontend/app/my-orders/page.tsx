"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { fetchApi } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Star, 
  ExternalLink, 
  FileText,
  AlertCircle,
  X
} from "lucide-react";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/my-orders");
      return;
    }

    async function loadOrders() {
      try {
        const data = await fetchApi("/orders/my");
        setOrders(data);
      } catch (err) {
        console.error("Failed to load my orders", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadOrders();
    }
  }, [user, authLoading, router]);

  const handleOpenReview = (orderId: number) => {
    setActiveOrderId(orderId);
    setRating(5);
    setComment("");
    setReviewSuccess(false);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderId) return;
    setReviewSubmitting(true);
    try {
      await fetchApi("/reviews", {
        method: "POST",
        data: {
          order_id: activeOrderId,
          rating,
          comment,
        },
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[1120px] mx-auto px-5 sm:px-8 lg:px-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Customer History</span>
            <h1 className="section-title text-zinc-900 mt-1">My Orders Ledger</h1>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-sm transition-transform active:scale-95 self-start sm:self-auto"
          >
            Order New Service
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[28px] border border-black/5 p-8">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">No orders placed yet</h3>
            <p className="text-xs text-zinc-500 mt-1 mb-6">Explore our custom craft catalog to create your first order.</p>
            <Link
              href="/services"
              className="px-6 py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString() : "";
              const status = order.status;

              return (
                <div
                  key={order.id}
                  className="p-6 sm:p-8 rounded-[24px] bg-white border border-black/8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-black/20 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm font-bold text-zinc-900">#{order.order_number}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        status === "delivered" || status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : status === "in_transit"
                          ? "bg-blue-50 text-blue-700"
                          : status === "cancelled"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900">{order.service?.name}</h3>
                    <p className="text-xs text-zinc-500">
                      Placed on {dateStr} • Qty: {order.quantity} • {order.delivery_method === "door_delivery" ? "Doorstep Dispatch" : "Warehouse Pickup"}
                    </p>

                    {order.files?.length > 0 && (
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="text-[11px] text-zinc-400 font-medium">Attachments:</span>
                        {order.files.map((file: any) => (
                          <span key={file.id} className="text-[11px] text-[#087FEF] flex items-center bg-[#EAF9FF] px-2 py-0.5 rounded-md">
                            <FileText className="w-3 h-3 mr-1" /> {file.original_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-black/5">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Cost</span>
                      <p className="text-base font-bold text-zinc-900">
                        UGX {Number(order.total_amount || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <Link
                        href={`/track?order=${order.order_number}`}
                        className="px-4 py-2 rounded-full bg-[#F7F7F5] hover:bg-[#EAEAEA] text-zinc-900 text-xs font-semibold border border-black/5 transition-colors flex items-center justify-center flex-1 sm:flex-initial"
                      >
                        Track <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </Link>

                      {(status === "delivered" || status === "completed") && (
                        <button
                          onClick={() => handleOpenReview(order.id)}
                          className="px-4 py-2 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold transition-transform active:scale-95 flex items-center justify-center flex-1 sm:flex-initial"
                        >
                          Review <Star className="w-3.5 h-3.5 ml-1.5 fill-amber-400 text-amber-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-zinc-900">Thank You!</h3>
                <p className="text-xs text-zinc-500 mt-1">Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Leave a Verified Review</h3>
                <p className="text-xs text-zinc-500 mb-6">Rate your service quality and delivery fulfillment experience.</p>

                {/* Rating stars */}
                <div className="flex items-center space-x-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                    Review Comments
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share details about precision, quality, delivery speed..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition-transform active:scale-98"
                >
                  {reviewSubmitting ? "Submitting..." : "Post Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
