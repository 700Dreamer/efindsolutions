"use client";

import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { fetchApi } from "../lib/api";
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await fetchApi("/contact", {
        method: "POST",
        data: { name, email, subject, message },
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-[1120px] mx-auto px-5 sm:px-8 lg:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Direct Communications</span>
              <h1 className="section-title text-zinc-900 mt-2 mb-4">
                Reach out. <br />
                <span className="hero-accent text-zinc-500">We respond immediately.</span>
              </h1>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Connect with our technical team regarding industrial engraving specifications, bulk embroidery inquiries, or delivery route dispatching.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#087FEF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Headquarters Workshop</h4>
                  <p className="text-xs text-zinc-600 mt-0.5">Plot 14, Kampala Road, Central Division, Uganda</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#087FEF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Direct Telephone</h4>
                  <p className="text-xs text-zinc-600 mt-0.5">+256 700 000 000 / +256 757 156 578</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#087FEF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Electronic Mail</h4>
                  <p className="text-xs text-zinc-600 mt-0.5">support@efindsolutions.com</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#087FEF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Operational Hours</h4>
                  <p className="text-xs text-zinc-600 mt-0.5">Monday – Saturday: 08:00 AM – 07:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[28px] border border-black/8 p-8 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Send an Inquiry</h2>
              <p className="text-xs text-zinc-500 mb-6">Fill out the message form below and our coordinators will get in touch.</p>

              {success && (
                <div className="p-4 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                  <span>Thank you! Your message has been sent to our desk.</span>
                </div>
              )}

              {error && (
                <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
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
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Corporate Plaque Laser Engraving Quote"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide details about dimensions, quantities, timelines..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition-transform active:scale-98 flex items-center justify-center space-x-2"
                >
                  {submitting ? "Sending..." : "Submit Inquiry"}
                  <Send className="w-3.5 h-3.5 ml-2" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
