"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../lib/auth-context";
import { Package, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "delivery" || user.role === "rider") {
        router.push("/rider");
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (role: "admin" | "rider" | "customer") => {
    if (role === "admin") {
      setEmail("admin@efind.com");
      setPassword("admin123");
    } else if (role === "rider") {
      setEmail("rider@efind.com");
      setPassword("rider123");
    } else {
      setEmail("kuzijohnbosco@gmail.com");
      setPassword("customer123");
    }
  };

  return (
    <main className="flex-1 pt-36 pb-24 max-w-[480px] mx-auto px-5 sm:px-8 w-full">
      <div className="bg-white rounded-[28px] border border-black/8 p-8 sm:p-10 shadow-lg">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#087FEF] to-[#123EDA] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Sign In</h1>
          <p className="text-xs text-zinc-500 mt-1">Access your customer orders, dispatch queue, or management dashboard</p>
        </div>

        {/* Demo Quick Fills */}
        <div className="mb-6 p-3 rounded-2xl bg-[#F7F7F5] border border-black/5">
          <span className="block text-[10px] uppercase font-bold text-zinc-400 mb-2 text-center tracking-wider">
            Quick Fill Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => handleQuickFill("admin")}
              className="py-1.5 px-2 bg-white rounded-xl text-[11px] font-bold text-zinc-800 border border-black/5 hover:bg-[#EAF9FF] hover:text-[#087FEF] transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("rider")}
              className="py-1.5 px-2 bg-white rounded-xl text-[11px] font-bold text-zinc-800 border border-black/5 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              Rider
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("customer")}
              className="py-1.5 px-2 bg-white rounded-xl text-[11px] font-bold text-zinc-800 border border-black/5 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              Customer
            </button>
          </div>
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-lg transition-transform active:scale-98 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#087FEF] font-semibold hover:underline">
            Register as Customer
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center pt-36"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>}>
        <LoginContent />
      </Suspense>
      <Footer />
    </div>
  );
}
