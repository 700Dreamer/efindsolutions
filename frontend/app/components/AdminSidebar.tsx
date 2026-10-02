"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Users, 
  CreditCard, 
  ShieldAlert, 
  Mail, 
  LogOut, 
  ArrowLeft,
  Bike
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { name: "KPI Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Orders Dispatch", href: "/admin/orders", icon: Package },
    { name: "Services Catalog", href: "/admin/services", icon: Wrench },
    { name: "Users & Riders", href: "/admin/users", icon: Users },
    { name: "Contact Messages", href: "/admin/messages", icon: Mail },
    { name: "Audit Trail", href: "/admin/audit-logs", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col justify-between p-6 border-r border-white/10 shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#087FEF] to-[#123EDA] flex items-center justify-center text-white">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">E-Find Admin</span>
            <span className="text-[10px] text-white/50 block">Management Console</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                  active
                    ? "bg-white text-black font-semibold shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & exit */}
      <div className="pt-6 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center space-x-2 px-3 py-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Store</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full px-3 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
