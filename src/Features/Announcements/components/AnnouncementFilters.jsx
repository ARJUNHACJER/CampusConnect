import React from "react";

const CATEGORIES = ["All", "Events", "Academic", "Exams", "Placements", "General", "Important"];
const PRIORITIES = ["All", "Normal", "Important", "Urgent"];

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
      }`}
    >
      {label}
    </button>
  );
}

export default function AnnouncementFilters({
  category,
  onCategoryChange,
  priority,
  onPriorityChange,
}) {
  return (
    <div className="space-y-3">
      {/* Category chips — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            active={category === c}
            onClick={() => onCategoryChange(c)}
          />
        ))}
      </div>

      {/* Priority filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-slate-500 mr-1">
          Priority
        </span>
        {PRIORITIES.map((p) => (
          <Chip
            key={p}
            label={p}
            active={priority === p}
            onClick={() => onPriorityChange(p)}
          />
        ))}
      </div>
    </div>
  );
}
