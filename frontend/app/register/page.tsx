"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../lib/auth-context";
import { Package, Lock, Mail, User as UserIcon, Phone, MapPin, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kampala");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({
        name,
        email,
        password,
        phone,
        address,
        city,
        role: "customer",
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your information.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[520px] mx-auto px-5 sm:px-8 w-full">
        <div className="bg-white rounded-[28px] border border-black/8 p-8 sm:p-10 shadow-lg">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#087FEF] to-[#123EDA] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create Customer Account</h1>
            <p className="text-xs text-zinc-500 mt-1">Join to track bespoke orders and manage fast checkout</p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Bosco"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0700000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Kampala"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                Default Delivery Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Street / Plot / Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-lg transition-transform active:scale-98 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-zinc-500">
            Already registered?{" "}
            <Link href="/login" className="text-[#087FEF] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
