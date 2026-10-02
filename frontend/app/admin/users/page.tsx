"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../../components/AdminSidebar";
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { Users, Plus, UserPlus, X, Mail, Phone, MapPin, Trash2, Power } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("secret123");
  const [role, setRole] = useState("delivery");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Kampala");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await fetchApi("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
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
      loadUsers();
    }
  }, [user, isAdmin, isLoading, router]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchApi("/admin/users", {
        method: "POST",
        data: { name, email, password, role, phone, city },
      });
      await loadUsers();
      setCreateModalOpen(false);
      setName("");
      setEmail("");
    } catch (err: any) {
      alert(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await fetchApi(`/admin/users/${userId}`, { method: "DELETE" });
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await fetchApi(`/admin/users/${userId}/status?is_active=${!currentStatus}`, { method: "PUT" });
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "all") return true;
    if (roleFilter === "rider") return u.role === "delivery" || u.role === "rider";
    return u.role === roleFilter;
  });

  return (
    <div className="min-h-screen flex bg-[#F7F7F5]">
      <AdminSidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-[1440px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Identity & Access</span>
            <h1 className="text-2xl font-bold text-zinc-900 mt-1">Users & Dispatch Riders</h1>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm flex items-center space-x-2 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User / Rider</span>
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex items-center space-x-2 mb-8">
          {["all", "customer", "rider", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? "bg-[#0A0A0A] text-white shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-black/5"
              }`}
            >
              {r === "all" ? "All Accounts" : r}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[28px] border border-black/8 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F5] border-b border-black/5 text-zinc-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>

            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === "admin"
                        ? "bg-purple-50 text-purple-700"
                        : u.role === "delivery" || u.role === "rider"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}>
                      {u.role === "delivery" ? "rider" : u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{u.phone || "—"}</td>
                  <td className="px-6 py-4 text-zinc-600">{u.city || "—"}</td>
                  <td className="px-6 py-4">
                    {u.is_active !== false ? (
                      <span className="text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="text-red-600 font-semibold text-[11px] bg-red-50 px-2 py-1 rounded-full">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleToggleStatus(u.id, u.is_active !== false)} 
                      className={`p-1.5 rounded-md text-white transition-colors ${u.is_active !== false ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"}`} 
                      title={u.is_active !== false ? "Deactivate User" : "Activate User"}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id)} 
                      className="p-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors" 
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-1">Create Account</h3>
            <p className="text-xs text-zinc-500 mb-6">Add a customer, dispatch rider, or administrator</p>

            <form onSubmit={handleCreateUser} className="space-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                  >
                    <option value="delivery">Rider / Delivery</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

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
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition-transform active:scale-98"
              >
                {submitting ? "Creating..." : "Save Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
