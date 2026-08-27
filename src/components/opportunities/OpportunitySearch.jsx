import React from "react";
import { Search, X } from "lucide-react";

/**
 * OpportunitySearch
 * Reuses the standard CampusConnect search-input styling
 * (dark input, rounded-xl, indigo focus ring).
 */
export default function OpportunitySearch({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search opportunities..."
        className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
