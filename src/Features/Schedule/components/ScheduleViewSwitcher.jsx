import React from "react";

const VIEWS = ["Day", "Week", "Month"];

export default function ScheduleViewSwitcher({ view, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Schedule view"
      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
    >
      {VIEWS.map((v) => (
        <button
          key={v}
          role="tab"
          aria-selected={view === v}
          onClick={() => onChange(v)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            view === v
              ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
