"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { fetchApi } from "../../lib/api";
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderTrackingId = searchParams.get("OrderTrackingId") || searchParams.get("tracking_id");
  const orderNumber = searchParams.get("OrderMerchantReference") || searchParams.get("order");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!orderTrackingId && !orderNumber) {
        setError("Missing transaction verification references.");
        setLoading(false);
        return;
      }

      try {
        await fetchApi("/payments/verify", {
          method: "POST",
          data: {
            order_tracking_id: orderTrackingId || "",
            order_number: orderNumber || "",
          },
        });
        setSuccess(true);
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setError(err.message || "Could not automatically verify payment with Pesapal.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [orderTrackingId, orderNumber]);

  return (
    <main className="flex-1 pt-36 pb-24 max-w-[600px] mx-auto px-5 sm:px-8 w-full">
      <div className="bg-white rounded-[28px] border border-black/8 p-8 sm:p-12 shadow-xl text-center">
        {loading && (
          <div className="py-12 space-y-4">
            <div className="w-12 h-12 border-3 border-[#087FEF] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-bold text-zinc-900">Verifying Settlement...</h2>
            <p className="text-xs text-zinc-500">Contacting Pesapal v3 gateway to confirm transaction approval.</p>
          </div>
        )}

        {!loading && success && (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                Payment Verified
              </span>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mt-3">Order Confirmed!</h1>
              <p className="text-xs text-zinc-500 mt-1.5">
                Ref <span className="font-mono text-zinc-800 font-bold">{orderNumber || "EF-ORDER"}</span> is now in the workshop processing queue.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F7F5] text-left text-xs space-y-1 font-mono text-zinc-600">
              <p><strong className="text-zinc-900 font-sans">Pesapal Tracking ID:</strong> {orderTrackingId}</p>
              <p><strong className="text-zinc-900 font-sans">Status:</strong> COMPLETED & ESCROW LOCKED</p>
            </div>

            <Link
              href={`/track?order=${orderNumber}`}
              className="w-full py-4 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-sm font-semibold shadow-lg transition-transform active:scale-98 flex items-center justify-center space-x-2"
            >
              <span>Track Live Delivery on Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {!loading && !success && (
          <div className="py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Verification Notice</h1>
              <p className="text-xs text-zinc-500 mt-1.5">{error}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3.5 rounded-full border border-black/10 text-zinc-800 hover:bg-[#F7F7F5] text-xs font-semibold flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Verification</span>
              </button>
              
              <Link
                href={`/track?order=${orderNumber}`}
                className="flex-1 py-3.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold flex items-center justify-center space-x-1.5"
              >
                <span>View Order Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-center space-x-2 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pesapal v3 Protected Checkout</span>
        </div>
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
        </div>
      }>
        <CallbackContent />
      </Suspense>
      <Footer />
    </div>
  );
}
