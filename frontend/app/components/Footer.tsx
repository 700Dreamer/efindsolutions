import Link from "next/link";
import {
  Package,
  Users,
  Bell,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import TextLoop from "../../components/TextLoop";

export function Footer() {
  return (
    <footer className="w-full px-3 sm:px-6 lg:px-8 pb-10 pt-8">
      {/* Expansive Massive Rounded Dark Capsule Container (Matching Reference Layout) */}
      <div className="w-full max-w-[1600px] mx-auto bg-[#030303] text-white rounded-[40px] sm:rounded-[56px] lg:rounded-[40px] p-8 sm:p-14 lg:p-20 xl:p-24 shadow-[0_30px_90px_rgba(0,0,0,0.45)] border border-white/8">

        {/* Top Grid: Brand, Socials & Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10">

          {/* Left Column: Brand Logo, Social Squircles & Operational Stats (md:col-span-5 lg:col-span-5) */}
          <div className="md:col-span-5 space-y-8">

            {/* Logo */}
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-md">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-bold text-2xl sm:text-3xl tracking-tight text-white">
                e-find <span className="text-white/60 font-light">& soft solutions</span>
              </span>
            </div>

            {/* Social Squircles (Instagram, LinkedIn, Facebook, YouTube) */}
            <div className="flex items-center space-x-3 pt-1">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>

            {/* Micro Operational Statistics (Scaled up) */}
            <div className="space-y-4 pt-2 text-xs sm:text-sm text-white/75">
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-white/50 shrink-0" />
                <span>Combined across all platforms: 14k followers</span>
              </div>
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 text-white/50 shrink-0" />
                <span>Daily: 50+ custom craft orders & dispatch requests</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-white/50 shrink-0" />
                <span>Growth: 99.8% precision delivery fulfillment rating</span>
              </div>
            </div>

          </div>

          {/* Middle Column: Core Navigation (md:col-span-3 lg:col-span-3) */}
          <div className="md:col-span-3 lg:col-span-3 lg:pl-6">
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/40 mb-6">Craft & Company</h4>
            <ul className="space-y-3.5 text-sm sm:text-base text-white/80">
              <li>
                <Link href="/services#metal-engraving" className="hover:text-white transition-colors">Laser Technology</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Company Story</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">Craft Catalog</Link>
              </li>
              <li>
                <Link href="/services#corporate-branding" className="hover:text-white transition-colors">Commercial & Bulk</Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">Live Telemetry</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Right Column: Support & Legal (md:col-span-4 lg:col-span-4) */}
          <div className="md:col-span-4 lg:col-span-4 lg:pl-6">
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/40 mb-6">Operations & Terms</h4>
            <ul className="space-y-3.5 text-sm sm:text-base text-white/80">
              <li>
                <Link href="/track" className="hover:text-white transition-colors">Shipping & Doorstep Delivery</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Revocation & Quality Guarantee</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/rider" className="hover:text-white transition-colors">Rider Dispatch Portal</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">Management Console</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Small Notice / Disclaimer */}
        <div className="pt-10 pb-6">
          <p className="text-xs sm:text-sm text-white/40 leading-relaxed max-w-5xl">
            E-Find & Soft Solutions executes industrial-grade laser metal engraving, custom garment embroidery, and corporate branding with real-time GPS telemetry from Kampala Road, Plot 14 to destinations across Uganda. All online card, mobile money (MTN & Airtel), and escrow settlements are protected and processed via the Pesapal v3 secure gateway.
          </p>
        </div>

        {/* Bottom Services TextLoop Showcase (Replacing payments row) */}
        <div className="pt-6 border-t border-white/10 my-4">
          <TextLoop
            text="Laser Metal Engraving ✦ Custom Garment Embroidery ✦ GPS Vehicle Telemetry ✦ Corporate Brand Packaging ✦ Garment Printing ✦ Rapid Doorstep Dispatch"
            speed={20}
            direction="forward"
            separator="✦"
            fontSize={16}
            fontWeight={800}
            letterSpacing={2}
            uppercase
            color="#ffffff"
            ribbon
            ribbonColor="#087FEF"
            pauseOnHover
          />
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-white/40 font-sans gap-4">
          <p>© {new Date().getFullYear()} E-Find & Soft Solutions. All rights reserved.</p>
          <p className="font-mono text-[11px] text-white/30">Kampala Central Dispatch • Plot 14</p>
        </div>

      </div>
    </footer>
  );
}
