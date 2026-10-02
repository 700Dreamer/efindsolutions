"use client";

import { CheckCircle2, Clock, Cog, Box, Truck, Home, Star, AlertCircle } from "lucide-react";

interface OrderTimelineProps {
  currentStatus: string;
  onTrackLive?: () => void;
}

export function OrderTimeline({ currentStatus, onTrackLive }: OrderTimelineProps) {
  const steps = [
    { id: "pending", label: "Order Placed", icon: Clock },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "processing", label: "Crafting", icon: Cog },
    { id: "ready", label: "Ready", icon: Box },
    { id: "in_transit", label: "In Transit", icon: Truck, isLiveTrack: true },
    { id: "delivered", label: "Delivered", icon: Home },
    { id: "completed", label: "Completed", icon: Star },
  ];

  const statusOrder = steps.map((s) => s.id);
  const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase());
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;
  const isCancelled = currentStatus.toLowerCase() === "cancelled";

  if (isCancelled) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Order Cancelled / Undelivered</h4>
          <p className="text-xs text-rose-700/80">This order was cancelled or could not be delivered. Please contact support if you need assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      {/* Step Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {steps.map((step, idx) => {
          const isCompleted = idx < effectiveIndex;
          const isCurrent = idx === effectiveIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (step.isLiveTrack && isCurrent && onTrackLive) {
                  onTrackLive();
                }
              }}
              className={`relative flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-300 ${
                isCurrent
                  ? "bg-[#0A0A0A] text-white border-black shadow-lg scale-102"
                  : isCompleted
                  ? "bg-white text-zinc-900 border-black/10"
                  : "bg-[#F7F7F5] text-zinc-400 border-black/5"
              } ${step.isLiveTrack && isCurrent ? "cursor-pointer hover:ring-2 hover:ring-[#087FEF]" : ""}`}
            >
              {/* Icon Circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center mb-2.5 transition-colors ${
                  isCurrent
                    ? "bg-[#087FEF] text-white"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-black/5 text-zinc-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Step Label */}
              <span className="text-xs font-semibold tracking-tight">{step.label}</span>

              {/* Status Badge */}
              {isCurrent && step.isLiveTrack && (
                <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wide uppercase">
                  Live
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
