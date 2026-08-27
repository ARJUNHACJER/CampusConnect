import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * EmergencyNotice
 * ---------------------------------------------------------------------------
 * Two variants:
 *  - "banner": the top-of-page prominent notice ("for immediate danger...")
 *  - "footer": the shorter closing disclaimer
 * ---------------------------------------------------------------------------
 */
export default function EmergencyNotice({ variant = "banner" }) {
  if (variant === "footer") {
    return (
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 px-5 py-4 flex gap-3">
        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-300">Important</p>
          <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
            CampusConnect provides campus contact information. In a serious
            emergency, use the appropriate emergency service or seek
            immediate assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-red-500/10 border border-red-500/25 px-5 py-4 flex gap-3">
      <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
      <p className="text-sm text-red-200 leading-relaxed">
        <span className="font-semibold text-red-300">For immediate danger, </span>
        contact campus security or the appropriate emergency service immediately.
      </p>
    </div>
  );
}
