import React from "react";
import { Star } from "lucide-react";

/**
 * RatingBreakdown
 * Progress-bar style distribution of 5★–1★ responses, consistent
 * with the existing Admin Analytics visual language.
 */
export default function RatingBreakdown({ distribution }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Rating Breakdown</h3>
      <div className="space-y-3">
        {distribution.map(({ star, pct }) => (
          <div key={star} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-10 shrink-0 text-xs font-medium text-slate-400">
              {star} <Star size={11} className="text-amber-400" fill="currentColor" />
            </div>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-500 to-amber-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-400">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
