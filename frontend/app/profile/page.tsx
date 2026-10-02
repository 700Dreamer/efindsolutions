"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../lib/auth-context";
import { fetchApi } from "../lib/api";
import { User as UserIcon, Phone, MapPin, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "");
    }
  }, [user, isLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload: any = {
        name,
        phone,
        address,
        city,
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      await fetchApi("/users/profile", {
        method: "PUT",
        data: payload,
      });

      await refreshUser();
      setMessage("Profile successfully updated!");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[640px] mx-auto px-5 sm:px-8 w-full">
        <div className="bg-white rounded-[28px] border border-black/8 p-8 sm:p-10 shadow-sm">
          
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-black/5">
            <div className="w-14 h-14 rounded-full bg-[#087FEF] text-white flex items-center justify-center text-xl font-bold uppercase">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">{user?.name}</h1>
              <p className="text-xs text-zinc-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#EAF9FF] text-[#087FEF] text-[10px] font-bold uppercase">
                Role: {user?.role}
              </span>
            </div>
          </div>

          {message && (
            <div className="p-4 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
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
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
              />
            </div>

            <div className="pt-4 border-t border-black/5">
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                Update Password (leave blank to keep current)
              </label>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition-transform active:scale-98"
            >
              {saving ? "Saving Changes..." : "Save Profile Settings"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
