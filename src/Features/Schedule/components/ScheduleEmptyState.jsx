import React from "react";
import { CalendarX } from "lucide-react";

export default function ScheduleEmptyState({ onBrowseEvents }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <CalendarX size={22} className="text-slate-500" />
      </div>

      <h3 className="text-sm font-semibold text-white">Your Schedule is Empty</h3>

      <p className="mt-1.5 max-w-xs text-sm text-slate-500">
        Register for events to build your personalized campus schedule.
      </p>

      <button
        type="button"
        onClick={onBrowseEvents}
        className="mt-4 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
      >
        Browse Events
      </button>
    </div>
  );
}
