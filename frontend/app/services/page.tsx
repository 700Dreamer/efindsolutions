"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { fetchApi } from "../lib/api";
import { getServiceImageUrl } from "../lib/media";
import { Package, Search, CheckCircle2, ArrowRight } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await fetchApi("/services");
        setServices(data);
        setFilteredServices(data);
      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  useEffect(() => {
    let result = services;
    if (selectedCategory !== "all") {
      result = result.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }
    setFilteredServices(result);
  }, [selectedCategory, searchQuery, services]);

  const categories = [
    { id: "all", name: "All Services" },
    { id: "engraving", name: "Laser Engraving" },
    { id: "embroidery", name: "Embroidery" },
    { id: "tracking", name: "GPS Tracking" },
    { id: "calligraphy", name: "Calligraphy" },
    { id: "branding", name: "Branding" },
    { id: "printing", name: "Garment Printing" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 w-full">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Craft Catalog</span>
          <h1 className="section-title text-[#111111] mt-2 mb-4">
            Industrial Services. <br />
            <span className="hero-accent text-zinc-500">Uncompromising precision.</span>
          </h1>
          <p className="text-zinc-600 text-sm leading-relaxed">
            Select a service to configure customizations, submit artwork attachments, and schedule doorstep delivery.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#0A0A0A] text-white shadow-sm"
                      : "bg-white text-zinc-600 hover:bg-zinc-100 border border-black/5"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-black/10 rounded-full outline-none focus:ring-2 focus:ring-[#087FEF]/30"
            />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5">
            <Package className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900">No matching services found</h3>
            <p className="text-xs text-zinc-500 mt-1">Try refining your search or selecting another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              let featuresList: string[] = [];
              try {
                featuresList = JSON.parse(service.features || "[]");
              } catch {
                featuresList = [];
              }

              const serviceImg = getServiceImageUrl(service.image_path || service.image, service.category);

              return (
                <div
                  key={service.id}
                  id={service.slug}
                  className="flex flex-col justify-between overflow-hidden rounded-[28px] bg-white border border-black/8 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div>
                    {/* Service Image Banner */}
                    <div className="relative w-full h-48 bg-zinc-100 overflow-hidden">
                      <Image
                        src={serviceImg}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={serviceImg.includes("localhost") || serviceImg.includes("127.0.0.1")}
                      />
                      <div className="absolute top-4 right-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#087FEF] shadow-xs">
                          {service.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-7">
                      <h3 className="text-lg font-bold text-zinc-900 mb-2">{service.name}</h3>
                      <p className="text-xs text-zinc-600 leading-relaxed mb-6 line-clamp-3">{service.description}</p>

                      {featuresList.length > 0 && (
                        <div className="space-y-2 mb-6 pt-4 border-t border-black/5">
                          {featuresList.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-start text-xs text-zinc-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 pt-0 border-t border-black/5 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Base Price</span>
                      <p className="text-base font-bold text-zinc-900">
                        UGX {Number(service.base_price).toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/order/${service.slug}`}
                      className="inline-flex items-center px-4 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
                    >
                      Order Craft <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
