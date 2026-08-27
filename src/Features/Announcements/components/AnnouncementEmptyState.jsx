import React from "react";
import { Megaphone, SearchX } from "lucide-react";

export default function AnnouncementEmptyState({ variant = "none", onClearFilters }) {
  const isSearch = variant === "search";

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        {isSearch ? (
          <SearchX size={22} className="text-slate-500" />
        ) : (
          <Megaphone size={22} className="text-slate-500" />
        )}
      </div>

      <h3 className="text-sm font-semibold text-white">
        {isSearch ? "No Announcements Found" : "No Announcements"}
      </h3>

      <p className="mt-1.5 max-w-xs text-sm text-slate-500">
        {isSearch
          ? "Try changing your search or filters."
          : "You're all caught up! New campus announcements will appear here."}
      </p>

      {isSearch && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
