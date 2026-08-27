import React from "react";
import { Search, X } from "lucide-react";

export default function AnnouncementSearch({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search announcements..."
        aria-label="Search announcements"
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-indigo-500/30"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
