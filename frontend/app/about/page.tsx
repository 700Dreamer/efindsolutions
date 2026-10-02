import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Package, ShieldCheck, Truck, Sparkles, CheckCircle2, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[1120px] mx-auto px-5 sm:px-8 lg:px-10 w-full">
        {/* Editorial Hero */}
        <div className="max-w-[760px] mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Company Narrative</span>
          <h1 className="hero-title text-zinc-900 mt-2 mb-6">
            Precision Craft. <br />
            <span className="hero-accent text-zinc-500">Unrivalled speed.</span>
          </h1>
          <p className="text-zinc-600 text-base md:text-lg leading-relaxed">
            E-Find & Soft Solutions merges industrial craft manufacturing—laser metal engraving, custom embroidery, and corporate branding—with real-time GPS telemetry and doorstep delivery fulfillment across Uganda.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-[28px] bg-white border border-black/8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF9FF] text-[#087FEF] flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Micron-Level Precision</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Industrial CNC laser systems and multi-needle embroidery units capable of 0.05mm tolerances on stainless steel, brass, acrylic, and textiles.
            </p>
          </div>

          <div className="p-8 rounded-[28px] bg-white border border-black/8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Live GPS Telemetry</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Every dispatched order is connected to active satellite Mapbox telemetry. Customers watch their rider approach in real-time with accurate ETAs.
            </p>
          </div>

          <div className="p-8 rounded-[28px] bg-white border border-black/8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Pesapal Trust & Security</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Fully integrated with Pesapal v3 gateway supporting instant Mobile Money (MTN MoMo & Airtel Money) and encrypted card settlements.
            </p>
          </div>
        </div>

        {/* Workshop Location */}
        <div className="p-10 rounded-[32px] bg-[#0A0A0A] text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#39B8FF]">Operational Base</span>
            <h2 className="text-2xl font-bold text-white mt-1 mb-2">Plot 14, Kampala Road Workshop</h2>
            <p className="text-xs text-white/70 max-w-md">
              Visit our central studio for prototype inspections, material swatch reviews, and instant order collections.
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/10">
              Open Mon – Sat: 8AM – 7PM
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
