import React from "react";
import { MapPin } from "lucide-react";
import { toMinutes, formatTimeLabel } from "../scheduleUtils";

function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

// Builds a simple vertical timeline: an hour-marker row for every event
// boundary, with "Free" rows filling the gaps between them.
function buildTimeline(dayEvents) {
  if (dayEvents.length === 0) return [];

  const sorted = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const rows = [];
  const dayStart = toMinutes(sorted[0].startTime) - 60;
  let cursor = Math.max(dayStart, 0);

  sorted.forEach((event) => {
    const start = toMinutes(event.startTime);
    const end = toMinutes(event.endTime);

    if (start > cursor) {
      rows.push({ type: "free", from: cursor, to: start });
    }

    rows.push({ type: "event", from: start, to: end, event });
    cursor = end;
  });

  rows.push({ type: "end", from: cursor, to: cursor + 60 });

  return rows;
}

function minutesToLabel(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return formatTimeLabel(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}

export default function DayView({ selectedDate, events, onOpenEvent, today }) {
  const key = toDateKey(selectedDate);
  const dayEvents = events.filter((e) => e.date === key);
  const timeline = buildTimeline(dayEvents);
  const isToday = key === toDateKey(today);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-semibold text-white">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        {isToday && (
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
            TODAY
          </span>
        )}
      </div>

      {dayEvents.length === 0 ? (
        <p className="text-sm text-slate-500">No events scheduled for this day.</p>
      ) : (
        <div className="space-y-0">
          {timeline.map((row, i) => (
            <div key={i} className="flex gap-3 border-l border-white/10 pl-4 pb-5 last:pb-0 relative">
              <span className="absolute -left-[5px] top-0.5 h-2.5 w-2.5 rounded-full bg-white/20" />

              <div className="w-20 shrink-0 pt-0 text-xs text-slate-500">
                {minutesToLabel(row.from)}
              </div>

              {row.type === "event" ? (
                <div className="min-w-0 flex-1 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-3">
                  <p className="text-sm font-semibold text-white">{row.event.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatTimeLabel(row.event.startTime)} – {formatTimeLabel(row.event.endTime)}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} /> {row.event.venue}
                  </p>
                  {onOpenEvent && (
                    <button
                      type="button"
                      onClick={() => onOpenEvent(row.event.id)}
                      className="mt-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      View Event →
                    </button>
                  )}
                </div>
              ) : row.type === "end" ? (
                <p className="pt-0.5 text-xs text-slate-500">Nothing else scheduled today.</p>
              ) : (
                <p className="pt-0.5 text-xs text-slate-600">Free</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
