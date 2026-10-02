"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../../components/AdminSidebar";
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { Mail, CheckCircle2, Clock } from "lucide-react";

export default function AdminMessagesPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const data = await fetchApi("/contact");
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login");
      return;
    }
    if (user && isAdmin) {
      loadMessages();
    }
  }, [user, isAdmin, isLoading, router]);

  const handleMarkRead = async (id: number) => {
    try {
      await fetchApi(`/contact/${id}/read`, { method: "PUT" });
      await loadMessages();
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7F7F5]">
      <AdminSidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-[1440px]">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Communications</span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">Customer Inquiries Inbox</h1>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[28px] border border-black/5 p-8">
            <Mail className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">Inbox is clear</h3>
            <p className="text-xs text-zinc-500 mt-1">No contact inquiries found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 rounded-[24px] border transition-all ${
                  msg.is_read
                    ? "bg-white border-black/5"
                    : "bg-[#EAF9FF]/50 border-[#087FEF]/20 shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 mr-3">{msg.name}</span>
                    <span className="text-xs text-zinc-500">{msg.email}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-900 mb-2">{msg.subject}</h4>
                <p className="text-xs text-zinc-700 leading-relaxed mb-4">{msg.message}</p>

                <div className="flex justify-end">
                  {!msg.is_read ? (
                    <button
                      onClick={() => handleMarkRead(msg.id)}
                      className="px-3.5 py-1.5 rounded-full bg-[#087FEF] hover:bg-[#123EDA] text-white text-[11px] font-semibold"
                    >
                      Mark as Read
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 flex items-center font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Read
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
