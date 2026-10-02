import type { Metadata } from "next";
import { Inter, Instrument_Serif, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-Find & Soft Solutions | Precision Craft & Live Logistics",
  description: "Enterprise delivery management, laser metal engraving, custom embroidery, corporate branding, and real-time GPS tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, instrumentSerif.variable, "font-sans", geist.variable)}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="min-h-screen antialiased bg-[#F7F7F5] text-[#111111] selection:bg-[#087FEF] selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
