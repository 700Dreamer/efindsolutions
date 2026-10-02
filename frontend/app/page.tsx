"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { fetchApi } from "./lib/api";
import { getServiceImageUrl } from "./lib/media";
import { 
  Package, 
  ArrowRight, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  Truck, 
  Star,
  ExternalLink,
  ShieldCheck,
  Zap,
  SlidersHorizontal
} from "lucide-react";
import heroImage from "../public/woman-hero-image.png";
import GlowCursor from "@/components/GlowCursor";

export default function HomePage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [orderQuery, setOrderQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) - 0.5;
    const y = (clientY / window.innerHeight) - 0.5;
    setMousePosition({ x, y });
  };


  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, reviewsData] = await Promise.all([
          fetchApi("/services"),
          fetchApi("/reviews/public").catch(() => []),
        ]);
        setServices(servicesData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderQuery.trim()) {
      router.push(`/track?order=${encodeURIComponent(orderQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. CINEMATIC HERO (Matching the reference design)                        */}
        {/* ========================================================================= */}
        <section 
          className="relative pt-32 sm:pt-40 pb-20 overflow-hidden bg-gradient-to-b from-[#030A1D] via-[#081B4B] via-65% to-[#F7F7F5]"
          onMouseMove={handleMouseMove}
        >
          <GlowCursor
            color="#67E8F9"
            secondaryColor="#A78BFA"
            trailLength={40}
            trailWidth={8}
            trailTaper={0.8}
            followSpeed={0.16}
            glowIntensity={1.9}
            glowSpread={1.2}
            hotspot={0.65}
            brightness={1.25}
            opacity={1}
            pulseSpeed={1.1}
            noiseStrength={0.035}
            idleFade
            idleTimeout={700}
            fadeDuration={900}
            blendMode="screen"
          >
            {/* Subtle atmospheric glow effects in background */}
            <div 
              className="absolute top-1/4 left-1/2 w-[800px] h-[500px] bg-radial from-[#123EDA]/40 via-[#087FEF]/20 to-transparent blur-3xl pointer-events-none -z-0 transition-transform duration-200 ease-out"
              style={{
                transform: `translate(calc(-50% + ${mousePosition.x * 80}px), ${mousePosition.y * 80}px)`
              }}
            ></div>

            <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 text-center">
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-medium tracking-tight text-white max-w-[980px] mx-auto leading-[1.04] mb-6">
                Move craft & live dispatch without friction
              </h1>

              {/* Subtitle */}
              <p className="max-w-[640px] mx-auto text-white/75 text-sm sm:text-base leading-relaxed mb-8">
                Precision laser metal engraving, custom embroidery, and corporate branding with real-time GPS telemetry from Kampala directly to your doorstep.
              </p>

              {/* Dual CTA Button Row */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
                <Link
                  href="/services"
                  className="px-6 py-3 rounded-full bg-[#182848]/80 hover:bg-[#1f335c] text-white/90 text-xs font-mono tracking-wider uppercase border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                >
                  SEE IN ACTION
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF512F] to-[#F09819] hover:from-[#ff411a] hover:to-[#e0890a] text-white text-xs font-semibold tracking-wide flex items-center space-x-2 shadow-lg shadow-orange-500/25 transition-all active:scale-95"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>REQUEST A QUOTE</span>
                </Link>
              </div>

              {/* Centered Hero Image (Enlarged & Cinematic) */}
              <div 
                className="relative max-w-[1040px] mx-auto -mb-6 sm:-mb-10 transition-transform duration-300 ease-out"
                style={{
                  transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`
                }}
              >
                <div className="relative w-full h-[460px] sm:h-[620px] md:h-[720px] lg:h-[800px]">
                  <Image
                    src={heroImage}
                    alt="Precision Craft & Live Dispatch"
                    fill
                    priority
                    className="object-contain object-bottom drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </div>

              {/* Order Tracker Input (Layered directly below the hero visual) */}
              <div className="relative z-20 max-w-[620px] mx-auto mb-20 -mt-6 sm:-mt-10">
                <form
                  onSubmit={handleTrackSubmit}
                  className="relative flex items-center p-2.5 rounded-full bg-white/95 backdrop-blur-2xl border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] focus-within:ring-2 focus-within:ring-[#087FEF]/50 transition-all"
                >
                  <Search className="w-5 h-5 text-zinc-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter tracking number (e.g. EF-20260513-C2A193)"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-transparent outline-none text-[#111111] placeholder:text-zinc-400 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-7 py-3 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition-transform active:scale-95 shrink-0 flex items-center space-x-2"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* 3 Metric Highlight Pillars (Matching the reference layout) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[960px] mx-auto pt-6 border-t border-black/5">
                <div className="text-center">
                  <span className="text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight block">99.8%</span>
                  <p className="text-xs text-zinc-600 mt-2 max-w-[220px] mx-auto leading-relaxed">
                    Laser precision accuracy & micron-level tolerances on all craft
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight block">10x</span>
                  <p className="text-xs text-zinc-600 mt-2 max-w-[220px] mx-auto leading-relaxed">
                    Faster delivery dispatch turnaround with live Mapbox satellite tracking
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight block">100%</span>
                  <p className="text-xs text-zinc-600 mt-2 max-w-[220px] mx-auto leading-relaxed">
                    Pesapal verified escrow protection across all mobile money & card orders
                  </p>
                </div>
              </div>

            </div>
          </GlowCursor>
        </section>

        {/* ========================================================================= */}
        {/* 2. STACKING CRAFT SERVICES (Matching the reference design)               */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Catalog & Craft</span>
              <h2 className="section-title text-[#111111] mt-2">
                Engineered for quality. <br />
                <span className="hero-accent text-zinc-500">Delivered with certainty.</span>
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center text-sm font-semibold text-[#087FEF] hover:text-[#123EDA] transition-colors"
            >
              Browse Full Services Catalog <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Stacking Cards Container */}
          <div className="relative space-y-10 pb-16">
            {services.map((service, idx) => {
              // Dynamic service image from database with graceful category fallback
              const serviceImg = getServiceImageUrl(service.image_path || service.image, service.category);

              const telemetryMap: Record<string, { label: string; m1: string; v1: string; m2: string; v2: string; m3: string; v3: string }> = {
                engraving: {
                  label: "LASER CALIBRATION: OPTIMAL",
                  m1: "TOLERANCE", v1: "0.05mm",
                  m2: "VECTOR", v2: "DXF/AI",
                  m3: "DEPTH", v3: "1.2mm",
                },
                embroidery: {
                  label: "THREAD TENSION: OPTIMAL",
                  m1: "DENSITY", v1: "4.5 pt",
                  m2: "MAX COLORS", v2: "15-HD",
                  m3: "SPEED", v3: "900 RPM",
                },
                tracking: {
                  label: "SATELLITE TELEMETRY: ACTIVE",
                  m1: "3D FIX", v1: "ONLINE",
                  m2: "ACCURACY", v2: "<2.5m",
                  m3: "PING", v3: "10s",
                },
                branding: {
                  label: "FINISH QUALITY: VERIFIED",
                  m1: "COATING", v1: "MATTE",
                  m2: "FOILING", v2: "METALLIC",
                  m3: "QC SCORE", v3: "99.8%",
                },
              };

              const tel = telemetryMap[service.category?.toLowerCase()] || telemetryMap.engraving;

              let featuresList: string[] = [];
              try {
                featuresList = JSON.parse(service.features || "[]");
              } catch {
                featuresList = [];
              }

              const spec1Title = featuresList[0] || "Precision Engineering";
              const spec1Desc = "Industrial grade execution tailored to bespoke dimensions and vector requirements.";
              const spec2Title = featuresList[1] || "Live Doorstep Telemetry";
              const spec2Desc = "Track live dispatch from central workshop directly to your address.";

              return (
                <div
                  key={service.id}
                  className="sticky rounded-[36px] sm:rounded-[44px] bg-[#EFECE6] border border-black/8 p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300 backdrop-blur-sm"
                  style={{
                    top: `calc(100px + ${idx * 28}px)`,
                    zIndex: idx + 10,
                  }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* Left: Visual with Glassmorphism HUD (Matching Screenshot) */}
                    <div className="lg:col-span-5 relative w-full aspect-[4/3] lg:aspect-[1/1] rounded-[28px] overflow-hidden bg-black/5 shadow-md">
                      <Image
                        src={serviceImg}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        unoptimized={serviceImg.includes("localhost") || serviceImg.includes("127.0.0.1")}
                      />

                      {/* Glass HUD Overlay Badge */}
                      <div className="absolute bottom-4 left-4 right-4 sm:right-auto p-4 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 text-white shadow-xl max-w-[280px]">
                        <span className="text-[10px] font-mono tracking-widest text-white/80 block uppercase mb-2">
                          {tel.label}
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-left font-mono">
                          <div>
                            <span className="text-[9px] text-white/60 block">{tel.m1}</span>
                            <span className="text-xs font-bold text-white">{tel.v1}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-white/60 block">{tel.m2}</span>
                            <span className="text-xs font-bold text-white">{tel.v2}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-white/60 block">{tel.m3}</span>
                            <span className="text-xs font-bold text-white">{tel.v3}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Editorial Content & Modern Spec Cards */}
                    <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#087FEF] bg-white/90 px-3 py-1 rounded-md border border-[#087FEF]/20 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#087FEF]"></span>
                            {service.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-700">
                            Starting from UGX {Number(service.base_price).toLocaleString()}
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-900 mt-2 mb-3">
                          {service.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed line-clamp-3">
                          {service.description}
                        </p>
                      </div>

                      {/* 2 Refined Specification Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 sm:p-5 rounded-xl bg-white/80 border border-black/6 shadow-xs hover:border-[#087FEF]/25 hover:shadow-sm transition-all backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-sm bg-[#087FEF]" />
                            <h4 className="text-xs font-bold text-zinc-900 tracking-tight">{spec1Title}</h4>
                          </div>
                          <p className="text-[11px] text-zinc-600 leading-relaxed pl-3.5">{spec1Desc}</p>
                        </div>

                        <div className="p-4 sm:p-5 rounded-xl bg-white/80 border border-black/6 shadow-xs hover:border-[#087FEF]/25 hover:shadow-sm transition-all backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-sm bg-[#087FEF]" />
                            <h4 className="text-xs font-bold text-zinc-900 tracking-tight">{spec2Title}</h4>
                          </div>
                          <p className="text-[11px] text-zinc-600 leading-relaxed pl-3.5">{spec2Desc}</p>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-4 flex items-center justify-between gap-4">
                        <Link
                          href={`/order/${service.slug}`}
                          className="group px-6 py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.98] inline-flex items-center space-x-2.5 border border-white/10"
                        >
                          <span>Configure Order</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                          href={`/services`}
                          className="inline-flex items-center text-xs font-semibold text-zinc-700 hover:text-black hover:bg-black/5 px-3.5 py-2.5 rounded-lg transition-colors"
                        >
                          <span>View Specifications</span>
                          <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
                        </Link>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. OPERATIONAL WORKFLOW                                                  */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#0A0A0A] text-white">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
            <div className="max-w-[640px] mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#39B8FF]">The Fulfillment Loop</span>
              <h2 className="section-title text-white mt-2">
                Order custom. <br />
                <span className="hero-accent text-white/50">Follow every coordinate.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl">
                <span className="text-xs font-mono text-[#39B8FF] font-bold">01</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">Configure & Upload Design</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Specify quantity, upload artwork or vectors, and choose doorstep delivery or warehouse pickup.
                </p>
              </div>

              <div className="p-8 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl">
                <span className="text-xs font-mono text-[#39B8FF] font-bold">02</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">Instant Pesapal Checkout</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Pay securely with Mobile Money (MTN/Airtel), debit/credit card, or choose Cash on Delivery.
                </p>
              </div>

              <div className="p-8 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl">
                <span className="text-xs font-mono text-[#39B8FF] font-bold">03</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">Live Mapbox Satellite Tracking</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Watch your assigned rider move live on the map with calculated ETA down to the minute.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. VERIFIED CLIENT REVIEWS                                               */}
        {/* ========================================================================= */}
        {reviews.length > 0 && (
          <section className="py-24 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
            <div className="text-center max-w-[620px] mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Customer Trust</span>
              <h2 className="section-title text-zinc-900 mt-2">Verified Feedback</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-6 rounded-[22px] bg-white border border-black/8 shadow-sm">
                  <div className="flex items-center space-x-1 text-amber-400 mb-3">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed mb-4">"{rev.comment}"</p>
                  <p className="text-xs font-bold text-zinc-900">{rev.user_name || "Customer"}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
