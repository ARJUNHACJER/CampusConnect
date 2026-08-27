import React from "react";
import { Heart } from "lucide-react";

/**
 * SavedOpportunityButton
 * Controlled component — parent owns the saved-state so it can later
 * be backed by Supabase `saved_opportunities` (student_id, opportunity_id).
 */
export default function SavedOpportunityButton({ saved, onToggle, compact = false }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved opportunities" : "Save opportunity"}
      className={`inline-flex items-center gap-1.5 rounded-lg transition-colors ${
        compact
          ? "p-2 bg-white/5 hover:bg-white/10"
          : "px-3 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10"
      } ${saved ? "text-pink-400" : "text-slate-400 hover:text-white"}`}
    >
      <Heart size={16} fill={saved ? "currentColor" : "none"} />
      {!compact && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
