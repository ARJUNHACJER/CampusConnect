import React from "react";
import { MapPin } from "lucide-react";
import { formatTimeLabel } from "../scheduleUtils";

export default function ScheduleEvent({ event, onOpenEvent, dense = false }) {
  return (
    <div
      className={`rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] ${
        dense ? "p-2.5" : "p-3.5"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{event.title}</p>

          <p className="mt-0.5 text-xs text-slate-400">
            {formatTimeLabel(event.startTime)} – {formatTimeLabel(event.endTime)}
          </p>

          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} /> {event.venue}
          </p>

          {onOpenEvent && (
            <button
              type="button"
              onClick={() => onOpenEvent(event.id)}
              className="mt-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View Event →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
