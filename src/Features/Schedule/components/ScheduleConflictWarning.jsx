import React from "react";
import { AlertTriangle } from "lucide-react";
import { formatTimeLabel } from "../scheduleUtils";

export default function ScheduleConflictWarning({ conflicts, onOpenEvent }) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="space-y-3">
      {conflicts.map(([a, b], i) => (
        <div
          key={i}
          className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 sm:p-5"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <AlertTriangle size={16} />
            Schedule Conflict
          </div>

          <p className="mt-1 text-sm text-slate-400">
            You have two events scheduled at the same time.
          </p>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {[a, b].map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-sm font-medium text-white truncate">{event.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatTimeLabel(event.startTime)} – {formatTimeLabel(event.endTime)}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenEvent?.(event.id)}
                  className="mt-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View {event.title.length > 20 ? "Event" : event.title} →
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
