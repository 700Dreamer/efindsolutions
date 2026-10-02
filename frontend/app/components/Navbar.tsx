"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { 
  Package, 
  Compass, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Bike, 
  ChevronDown, 
  Menu, 
  X 
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isRider } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide standard navbar in admin/rider views if desired, or show consistently
  const isPortal = pathname.startsWith("/admin") || pathname.startsWith("/rider");

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Track Order", href: "/track" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between w-full max-w-[840px] h-[54px] px-3.5 sm:px-4 rounded-full glass-nav transition-all duration-300">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#087FEF] to-[#123EDA] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white flex items-center">
            E-Find <span className="text-[#39B8FF] font-light ml-1">& Soft</span>
          </span>
        </Link>

        {/* Center Desktop Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right CTA / User Dropdown */}
        <div className="flex items-center space-x-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 text-xs font-medium transition-colors border border-white/10"
              >
                <div className="w-5 h-5 rounded-full bg-[#087FEF] flex items-center justify-center text-[10px] text-white uppercase font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/60" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-white/10 text-white/50">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <p className="text-[11px] truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/my-orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Package className="w-4 h-4 mr-2 text-[#39B8FF]" /> My Orders
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 mr-2 text-[#39B8FF]" /> Profile & Address
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-[#39B8FF] hover:bg-white/10 transition-colors font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                    </Link>
                  )}

                  {isRider && (
                    <Link
                      href="/rider"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-emerald-400 hover:bg-white/10 transition-colors font-medium"
                    >
                      <Bike className="w-4 h-4 mr-2" /> Rider Portal
                    </Link>
                  )}

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-rose-400 hover:bg-white/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex px-3 py-1 text-xs font-medium text-white/80 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-full bg-white text-[#0A0A0A] hover:bg-white/90 text-xs font-semibold shadow-sm transition-transform active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-white/80 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-16 left-4 right-4 bg-[#111111]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col space-y-2 text-sm md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl transition-colors ${
                pathname === link.href ? "bg-white/15 text-white font-medium" : "text-white/70 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <div className="pt-2 border-t border-white/10 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-center text-white/80 rounded-xl hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-center bg-white text-black font-semibold rounded-xl"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
