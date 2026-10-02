"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { fetchApi } from "../../lib/api";
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  Lock,
  Calendar,
  Sparkles,
  X,
  ExternalLink,
  RefreshCw,
  Package,
  Zap,
  Radio,
  Clock,
  Info
} from "lucide-react";

export default function PaymentCheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Payment Options: 'mtn_momo' | 'pesapal' | 'cod'
  const [paymentType, setPaymentType] = useState<"mtn_momo" | "pesapal" | "cod">("mtn_momo");
  const [momoPhone, setMomoPhone] = useState("");

  // Pesapal Modal
  const [iframeModalOpen, setIframeModalOpen] = useState(false);
  const [pesapalIframeUrl, setPesapalIframeUrl] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  // MTN MoMo Direct USSD Push Modal & Polling State
  const [momoModalOpen, setMomoModalOpen] = useState(false);
  const [momoRefId, setMomoRefId] = useState<string | null>(null);
  const [momoStatus, setMomoStatus] = useState<"PENDING" | "SUCCESSFUL" | "FAILED">("PENDING");
  const [momoMessage, setMomoMessage] = useState<string>("");
  const [momoIsSim, setMomoIsSim] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await fetchApi(`/orders/${orderId}`);
        setOrder(data);
        if (data.user?.phone) {
          setMomoPhone(data.user.phone);
        } else {
          setMomoPhone("0770 000000");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  // MTN MoMo Real-time Status Polling Loop
  useEffect(() => {
    let interval: any = null;
    if (momoModalOpen && momoRefId && momoStatus === "PENDING") {
      interval = setInterval(async () => {
        setPollCount((prev) => prev + 1);
        try {
          const res = await fetchApi<{
            reference_id: string;
            status: string;
            financial_transaction_id?: string;
            is_simulation: boolean;
            message?: string;
          }>(`/payments/momo/status/${momoRefId}`);

          const currentStatus = (res.status || "PENDING").toUpperCase() as "PENDING" | "SUCCESSFUL" | "FAILED";
          if (currentStatus === "SUCCESSFUL") {
            setMomoStatus("SUCCESSFUL");
            setMomoMessage("Payment approved and verified successfully!");
            clearInterval(interval);
            setTimeout(() => {
              router.push(`/track?order=${order.order_number}`);
            }, 2000);
          } else if (currentStatus === "FAILED") {
            setMomoStatus("FAILED");
            setMomoMessage("Payment authorization was cancelled or timed out.");
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Momo poll error", e);
        }
      }, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [momoModalOpen, momoRefId, momoStatus, order?.order_number, router]);

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      if (paymentType === "cod") {
        await fetchApi("/payments/initiate", {
          method: "POST",
          data: {
            order_id: Number(orderId),
            payment_method: "cash_on_delivery",
          },
        });
        router.push(`/track?order=${order.order_number}`);
        return;
      }

      // Direct MTN Mobile Money Collections Push
      if (paymentType === "mtn_momo") {
        const cleanPhone = momoPhone.replace(/[\s\-\+]/g, "").trim();
        const ugandaPhone = cleanPhone.startsWith("0")
          ? "256" + cleanPhone.slice(1)
          : cleanPhone.startsWith("256")
          ? cleanPhone
          : "256" + cleanPhone;

        if (!/^2567\d{8}$/.test(ugandaPhone)) {
          setError("Please provide a valid Ugandan mobile number (e.g. 0770 123456, 0780 123456, 0760 123456).");
          setProcessing(false);
          return;
        }

        const res = await fetchApi<{
          payment_id: number;
          order_id: number;
          order_number: string;
          reference_id: string;
          phone_number: string;
          amount: number;
          status: string;
          message: string;
          is_simulation: boolean;
        }>("/payments/momo/request-to-pay", {
          method: "POST",
          data: {
            order_id: Number(orderId),
            phone_number: ugandaPhone,
            payer_message: `Order ${order.order_number}`,
          },
        });

        setMomoRefId(res.reference_id);
        setMomoStatus("PENDING");
        setMomoMessage(res.message || "USSD PIN prompt dispatched.");
        setMomoIsSim(res.is_simulation || false);
        setPollCount(0);
        setMomoModalOpen(true);

        setProcessing(false);
        return;
      }

      // Pesapal Gateway Flow
      const res = await fetchApi<{
        payment_id: number;
        redirect_url: string;
        order_number: string;
        is_simulation: boolean;
        transaction_id: string;
      }>("/payments/initiate", {
        method: "POST",
        data: {
          order_id: Number(orderId),
          payment_method: "pesapal",
        },
      });

      if (res.redirect_url) {
        setPesapalIframeUrl(res.redirect_url);
        setTrackingId(res.transaction_id || `PESA-${order.order_number}`);
        setIframeModalOpen(true);
        setProcessing(false);
      } else {
        throw new Error("Could not obtain payment gateway URL from Pesapal.");
      }

    } catch (err: any) {
      setError(err.message || "Payment initiation failed");
      setProcessing(false);
    }
  };

  const handleCheckIframeVerification = async () => {
    setProcessing(true);
    try {
      await fetchApi("/payments/verify", {
        method: "POST",
        data: {
          order_tracking_id: trackingId || "",
          order_number: order.order_number,
        },
      });
      router.push(`/track?order=${order.order_number}`);
    } catch (err: any) {
      setError(err.message || "Verification check failed. Please complete payment inside the frame first.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[680px] mx-auto px-5 sm:px-8 w-full">
        <div className="bg-white rounded-[28px] border border-black/8 p-8 sm:p-10 shadow-lg">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#FFCC00]/15 text-zinc-900 flex items-center justify-center mx-auto mb-3 border border-[#FFCC00]/30">
              <Smartphone className="w-6 h-6 text-[#D9A300]" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Checkout & Settlement</h1>
            <p className="text-xs text-zinc-500 mt-1">Order Ref #{order?.order_number}</p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Box */}
          <div className="p-6 rounded-2xl bg-[#F7F7F5] border border-black/5 flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Amount Payable</span>
              <p className="text-xs font-medium text-zinc-600 mt-0.5">{order?.service?.name} (Qty: {order?.quantity})</p>
            </div>
            <span className="text-2xl font-bold text-zinc-950">
              UGX {Number(order?.total_amount || 0).toLocaleString()}
            </span>
          </div>

          {/* Payment Method Selector */}
          <form onSubmit={handleInitiatePayment} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                Select Payment Channel
              </label>

              <div className="space-y-3">
                {/* 1. Direct MTN MoMo Collections */}
                <button
                  type="button"
                  onClick={() => setPaymentType("mtn_momo")}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentType === "mtn_momo"
                      ? "border-[#FFCC00] bg-[#FFFCF0] text-zinc-900 shadow-sm ring-1 ring-[#FFCC00]/60"
                      : "border-black/10 bg-white text-zinc-600 hover:bg-[#F7F7F5]"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#FFCC00] flex items-center justify-center font-black text-black text-xs shrink-0 shadow-sm border border-black/10">
                      MTN
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-zinc-900">MTN Mobile Money Direct</p>
                        <span className="text-[10px] font-bold bg-[#FFCC00] text-zinc-900 px-2 py-0.5 rounded-full">
                          Instant Push
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Prompt appears directly on your phone screen</p>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${paymentType === "mtn_momo" ? "text-amber-500" : "opacity-0"}`} />
                </button>

                {/* 2. Instant Online Payment via Pesapal Gateway */}
                <button
                  type="button"
                  onClick={() => setPaymentType("pesapal")}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentType === "pesapal"
                      ? "border-[#087FEF] bg-[#EAF9FF] text-zinc-900 shadow-sm ring-1 ring-[#087FEF]/50"
                      : "border-black/10 bg-white text-zinc-600 hover:bg-[#F7F7F5]"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#EAF9FF] flex items-center justify-center border border-[#087FEF]/20 text-[#087FEF] shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Multi-Channel Gateway (Pesapal)</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Airtel Money, Visa, Mastercard, Bank Transfer</p>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${paymentType === "pesapal" ? "text-[#087FEF]" : "opacity-0"}`} />
                </button>

                {/* 3. Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentType("cod")}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentType === "cod"
                      ? "border-emerald-500 bg-emerald-50/50 text-zinc-900 shadow-sm ring-1 ring-emerald-400"
                      : "border-black/10 bg-white text-zinc-600 hover:bg-[#F7F7F5]"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-200 text-emerald-600 shrink-0">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Cash on Delivery</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Pay rider upon physical delivery</p>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${paymentType === "cod" ? "text-emerald-600" : "opacity-0"}`} />
                </button>
              </div>
            </div>

            {/* MTN MoMo Phone Input Box */}
            {paymentType === "mtn_momo" && (
              <div className="p-5 rounded-2xl bg-[#FFFCF0] border border-[#FFCC00]/50 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-900">
                    MTN Mobile Money Number
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Uganda (256)</span>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="w-4 h-4 text-zinc-500" />
                  </div>
                  <input
                    type="tel"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder="0770 123456 / 0780..."
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-black/15 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent transition-all font-mono"
                  />
                </div>

                <div className="flex items-start space-x-2 text-[11px] text-zinc-600 pt-1">
                  <Zap className="w-3.5 h-3.5 text-[#D9A300] shrink-0 mt-0.5" />
                  <p>
                    When you click pay, MTN will prompt your phone screen to enter your Mobile Money PIN.
                  </p>
                </div>
              </div>
            )}

            {paymentType === "pesapal" && (
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-black/5 text-xs text-zinc-600 space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-zinc-900">
                  <ShieldCheck className="w-4 h-4 text-[#087FEF]" />
                  <span>Branded In-App Payment Gateway</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Pesapal v3 secure payment frame will open inside this page for Airtel Money, Visa, or Mastercard cards.
                </p>
              </div>
            )}

            {paymentType === "cod" && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <span className="font-bold block mb-1">Cash on Delivery Selected</span>
                <p>You will pay UGX {Number(order?.total_amount || 0).toLocaleString()} directly in cash to the rider upon arrival at your doorstep.</p>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={processing}
              className={`w-full py-4 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-98 flex items-center justify-center space-x-2 ${
                paymentType === "mtn_momo"
                  ? "bg-[#0A0A0A] hover:bg-zinc-800 text-[#FFCC00]"
                  : "bg-[#0A0A0A] hover:bg-zinc-800 text-white"
              }`}
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>
                    {paymentType === "cod"
                      ? "Confirm Cash Order"
                      : paymentType === "mtn_momo"
                      ? `Push Prompt to Phone (UGX ${Number(order?.total_amount || 0).toLocaleString()})`
                      : `Open Payment Gateway (UGX ${Number(order?.total_amount || 0).toLocaleString()})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted Mobile Money & Escrow Protected</span>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* DIRECT MTN MOMO USSD PIN PROMPT WAITING MODAL */}
      {/* ========================================================================= */}
      {momoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0D0D0D] text-white rounded-[32px] max-w-md w-full border border-white/10 shadow-2xl p-8 text-center relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FFCC00]/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Close Button */}
            {momoStatus !== "SUCCESSFUL" && (
              <button
                onClick={() => setMomoModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                title="Cancel / Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* State 1: PENDING (Waiting for User PIN) */}
            {momoStatus === "PENDING" && (
              <div className="space-y-6">
                {/* Animated Pulsing Phone Device */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#FFCC00]/20 animate-ping opacity-75"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-[#FFCC00] text-black flex items-center justify-center shadow-xl">
                    <Smartphone className="w-8 h-8 animate-bounce" />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFCC00]/20 text-[#FFCC00] text-xs font-mono font-bold border border-[#FFCC00]/30 mb-2">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>USSD PROMPT DISPATCHED</span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Enter Your MoMo PIN</h2>
                  <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
                    Check your phone <span className="font-mono text-[#FFCC00] font-bold">{momoPhone}</span> now and enter your Mobile Money PIN to approve the transaction.
                  </p>
                </div>

                {/* Amount & Status Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Amount:</span>
                    <span className="font-bold text-white font-mono">
                      UGX {Number(order?.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Order Ref:</span>
                    <span className="font-mono text-[#FFCC00] font-bold">#{order?.order_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Live Status:</span>
                    <span className="text-amber-400 font-semibold flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      Awaiting PIN approval
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-white/40 flex items-center justify-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Polling MTN Gateway ({pollCount}s)...</span>
                </div>
              </div>
            )}

            {/* State 2: SUCCESSFUL */}
            {momoStatus === "SUCCESSFUL" && (
              <div className="space-y-6 py-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    SETTLEMENT CONFIRMED
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-3">Payment Received!</h2>
                  <p className="text-xs text-white/60 mt-1">
                    Your MTN Mobile Money payment was verified by the MTN Gateway. Redirecting to live tracking...
                  </p>
                </div>

                <div className="w-6 h-6 border-2 border-[#FFCC00] border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}

            {/* State 3: FAILED */}
            {momoStatus === "FAILED" && (
              <div className="space-y-6 py-2 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                  <AlertCircle className="w-9 h-9" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Payment Cancelled / Timed Out</h2>
                  <p className="text-xs text-white/60 mt-1.5 max-w-xs mx-auto">
                    {momoMessage || "The PIN authorization failed or timed out on your phone."}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setMomoModalOpen(false)}
                    className="flex-1 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Change Method
                  </button>
                  <button
                    onClick={handleInitiatePayment}
                    className="flex-1 py-3 rounded-full bg-[#FFCC00] hover:bg-[#e6b800] text-black text-xs font-bold shadow"
                  >
                    Retry Prompt
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BRANDED PESAPAL EMBEDDED IFRAME MODAL */}
      {/* ========================================================================= */}
      {iframeModalOpen && pesapalIframeUrl && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] text-white rounded-[32px] max-w-2xl w-full border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Branded Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#030303] via-[#0A0A0A] to-[#030303]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm tracking-tight text-white">e-find</span>
                    <span className="text-[10px] font-mono bg-[#087FEF]/20 text-[#087FEF] border border-[#087FEF]/30 px-2 py-0.5 rounded-full">
                      SECURE CHECKOUT
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 font-mono">Order #{order?.order_number}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-[#087FEF] font-mono hidden sm:inline-block">
                  UGX {Number(order?.total_amount || 0).toLocaleString()}
                </span>
                <button
                  onClick={() => setIframeModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  title="Close frame"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe Container */}
            <div className="relative flex-1 bg-white min-h-[580px] sm:min-h-[620px] overflow-hidden">
              <iframe
                src={pesapalIframeUrl}
                title="Pesapal Secure Payment Gateway"
                className="w-full h-full min-h-[580px] sm:min-h-[620px] border-0"
                allow="payment"
              />
            </div>

            {/* Branded Footer Bar */}
            <div className="px-6 py-3.5 bg-[#030303] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-white/50 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pesapal v3 256-Bit Escrow Gateway</span>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={pesapalIframeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-white/60 hover:text-white flex items-center space-x-1 underline"
                >
                  <span>Open full window</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleCheckIframeVerification}
                  disabled={processing}
                  className="px-4 py-1.5 rounded-full bg-[#087FEF] hover:bg-[#0770d4] text-white text-xs font-semibold shadow flex items-center space-x-1.5 transition-transform active:scale-95"
                >
                  {processing ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>I've Completed Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
