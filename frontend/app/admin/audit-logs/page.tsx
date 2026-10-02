"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../../components/AdminSidebar";
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { ShieldAlert, Clock, User, Shield } from "lucide-react";

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login");
      return;
    }

    async function loadLogs() {
      try {
        const data = await fetchApi("/admin/audit-logs");
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setLoading(false);
      }
    }

    if (user && isAdmin) {
      loadLogs();
    }
  }, [user, isAdmin, isLoading, router]);

  return (
    <div className="min-h-screen flex bg-[#F7F7F5]">
      <AdminSidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-[1440px]">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Security & Compliance</span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">System Audit Trail</h1>
        </div>

        <div className="bg-white rounded-[28px] border border-black/8 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F5] border-b border-black/5 text-zinc-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-zinc-500">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-900">
                    {log.user_name || "System"} ({log.user_role || "automated"})
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-mono font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
