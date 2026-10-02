"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { getServiceImageUrl } from "../../lib/media";
import { 
  Package, 
  UploadCloud, 
  Truck, 
  Building, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  CreditCard 
} from "lucide-react";

export default function OrderWizardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [quantity, setQuantity] = useState(1);
  const [customizationText, setCustomizationText] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("door_delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pesapal");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    async function loadService() {
      try {
        const data = await fetchApi(`/services/slug/${slug}`);
        setService(data);
      } catch (err: any) {
        setError(err.message || "Failed to load service");
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [slug]);

  useEffect(() => {
    if (user?.address) {
      setDeliveryAddress(user.address);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/order/${slug}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("service_id", service.id.toString());
      formData.append("quantity", quantity.toString());
      formData.append("customization_details", JSON.stringify({ details: customizationText }));
      formData.append("delivery_method", deliveryMethod);
      formData.append("delivery_address", deliveryAddress);
      formData.append("delivery_notes", deliveryNotes);
      formData.append("payment_method", paymentMethod);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const orderData = await fetchApi("/orders", {
        method: "POST",
        data: formData,
      });

      // Redirect to payment checkout page
      router.push(`/payment/${orderData.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
      setSubmitting(false);
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

  if (error && !service) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
          <h2 className="text-xl font-bold text-zinc-900">Service Not Found</h2>
          <p className="text-xs text-zinc-500 mt-1 mb-6">{error}</p>
          <Link href="/services" className="px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold">
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const basePrice = Number(service.base_price || 0);
  const totalAmount = basePrice * quantity;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[1120px] mx-auto px-5 sm:px-8 lg:px-10 w-full">
        {/* Breadcrumb Back */}
        <Link href="/services" className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Services Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form: Customization Details */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[28px] border border-black/8 p-8 shadow-sm mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">{service.category}</span>
              <h1 className="text-2xl font-bold text-zinc-900 mt-1 mb-2">{service.name}</h1>
              <p className="text-xs text-zinc-600 leading-relaxed mb-8">{service.description}</p>

              {error && (
                <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-6">
                
                {/* 1. Customization Text */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                    Customization Instructions / Inscriptions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Inscribe 'Orlins Global - Excellence in Innovation' in gold lettering, or specify color palettes..."
                    value={customizationText}
                    onChange={(e) => setCustomizationText(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                  />
                </div>

                {/* 2. File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                    Artwork / Vector / Document Attachments
                  </label>
                  <div className="border-2 border-dashed border-black/10 rounded-2xl p-6 text-center bg-[#F7F7F5] hover:bg-[#F0F0EE] transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-800">Drag & drop artwork files or click to browse</p>
                    <p className="text-[11px] text-zinc-500 mt-1">PDF, AI, PNG, SVG or high-res JPG (Max 25MB)</p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="flex items-center text-xs text-zinc-700 bg-white p-2 rounded-xl border border-black/5">
                          <FileText className="w-3.5 h-3.5 mr-2 text-[#087FEF]" />
                          <span className="truncate">{f.name}</span>
                          <span className="text-zinc-400 text-[10px] ml-auto">({(f.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-black/10 font-bold text-zinc-700 hover:bg-zinc-200"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-zinc-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-black/10 font-bold text-zinc-700 hover:bg-zinc-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 4. Delivery Method */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                    Fulfillment Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("door_delivery")}
                      className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                        deliveryMethod === "door_delivery"
                          ? "border-[#087FEF] bg-[#EAF9FF] text-zinc-900"
                          : "border-black/10 bg-white text-zinc-600 hover:bg-[#F7F7F5]"
                      }`}
                    >
                      <Truck className="w-5 h-5 text-[#087FEF] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">Doorstep Delivery</p>
                        <p className="text-[11px] text-zinc-500">Live GPS tracking by assigned rider</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                        deliveryMethod === "pickup"
                          ? "border-[#087FEF] bg-[#EAF9FF] text-zinc-900"
                          : "border-black/10 bg-white text-zinc-600 hover:bg-[#F7F7F5]"
                      }`}
                    >
                      <Building className="w-5 h-5 text-[#087FEF] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">Warehouse Pickup</p>
                        <p className="text-[11px] text-zinc-500">Plot 14 Kampala Road workshop</p>
                      </div>
                    </button>
                  </div>
                </div>

                {deliveryMethod === "door_delivery" && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                        Delivery Destination Address
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kampala Road, Plot 14 / Nakasero Hill"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                        Special Delivery Notes / Phone Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Call upon arrival at security gate"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-sm font-semibold shadow-lg transition-transform active:scale-98 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <CreditCard className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Summary: Order Ledger Cost */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[28px] border border-black/8 p-8 shadow-sm sticky top-28">
              <h3 className="text-base font-bold text-zinc-900 mb-4">Order Summary</h3>

              {/* Service Preview Badge */}
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-[#F7F7F5] border border-black/5 mb-6">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-200 border border-black/10 shrink-0">
                  <Image
                    src={getServiceImageUrl(service.image_path || service.image, service.category)}
                    alt={service.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 truncate">{service.name}</h4>
                  <span className="text-[10px] uppercase font-semibold text-[#087FEF]">{service.category}</span>
                </div>
              </div>
              
              <div className="space-y-3 pb-6 border-b border-black/5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Unit Base Price</span>
                  <span className="font-semibold text-zinc-900">UGX {basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span className="font-semibold text-zinc-900">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfillment</span>
                  <span className="font-semibold text-zinc-900">
                    {deliveryMethod === "door_delivery" ? "Doorstep Dispatch" : "Warehouse Pickup"}
                  </span>
                </div>
              </div>

              <div className="pt-6 mb-8 flex justify-between items-baseline">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Payable</span>
                <span className="text-2xl font-bold text-[#087FEF]">UGX {totalAmount.toLocaleString()}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-black/5 text-xs text-zinc-600 space-y-2">
                <div className="flex items-center space-x-2 text-zinc-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pesapal Secure Escrow Protection</span>
                </div>
                <p className="text-[11px] text-zinc-500 pl-6 leading-relaxed">
                  Funds are secured until order completion and verified delivery milestone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
