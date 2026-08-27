import React from "react";
import { CalendarClock } from "lucide-react";

export default function ScheduleHeader({ onToday }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">My Schedule</h1>
        <p className="mt-1 text-sm text-slate-400 max-w-xl">
          Keep track of your upcoming campus events and activities.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <CalendarClock size={15} /> Today
        </button>
      </div>
    </div>
  );
}
