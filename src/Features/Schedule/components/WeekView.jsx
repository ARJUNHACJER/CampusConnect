import React from "react";
import ScheduleEvent from "./ScheduleEvent";

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

export default function WeekView({ selectedDate, events, onOpenEvent, today }) {
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const eventsByDate = {};
  events.forEach((e) => {
    eventsByDate[e.date] = eventsByDate[e.date] || [];
    eventsByDate[e.date].push(e);
  });

  const todayKey = toDateKey(today);

  return (
    <div className="space-y-4">
      {days.map((d) => {
        const key = toDateKey(d);
        const dayEvents = (eventsByDate[key] || []).sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        const isToday = key === todayKey;

        return (
          <div
            key={key}
            className={`rounded-2xl border p-4 ${
              isToday ? "border-indigo-500/30 bg-indigo-500/[0.03]" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-semibold text-white">
                {d.toLocaleDateString("en-US", { weekday: "long" })} —{" "}
                {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              {isToday && (
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
                  TODAY
                </span>
              )}
            </div>

            {dayEvents.length === 0 ? (
              <p className="text-xs text-slate-500">No events scheduled.</p>
            ) : (
              <div className="space-y-2.5">
                {dayEvents.map((e) => (
                  <ScheduleEvent key={e.id} event={e} onOpenEvent={onOpenEvent} dense />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
