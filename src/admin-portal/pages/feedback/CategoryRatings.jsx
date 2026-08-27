import React from "react";
import { Star } from "lucide-react";
import { FEEDBACK_CATEGORIES } from "../../../data/mockFeedback";

/**
 * CategoryRatings
 * Shows the average rating per feedback category (Organization,
 * Content, Venue, Coordination, Overall).
 */
export default function CategoryRatings({ categoryAverages }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Category Ratings</h3>
      <div className="space-y-2">
        {FEEDBACK_CATEGORIES.map((cat) => {
          const avg = categoryAverages[cat.id] ?? 0;
          return (
            <div
              key={cat.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5"
            >
              <span className="text-sm text-slate-300">{cat.label}</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                {avg.toFixed(1)}
                <Star size={13} className="text-amber-400" fill="currentColor" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
