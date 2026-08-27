import React from "react";
import { MapPin } from "lucide-react";
import { formatTimeLabel } from "../scheduleUtils";

export default function UpcomingSchedule({ events, onOpenEvent }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">Upcoming</p>

      <div className="space-y-2.5">
        {events.map((e) => {
          const dateLabel = new Date(`${e.date}T00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{e.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {dateLabel} • {formatTimeLabel(e.startTime)} – {formatTimeLabel(e.endTime)}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} /> {e.venue}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenEvent?.(e.id)}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                View Event
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
