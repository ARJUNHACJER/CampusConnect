import React from "react";
import ScheduleEvent from "./ScheduleEvent";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

export default function MonthView({ selectedDate, activeDate, onSelectDate, events, onOpenEvent, today }) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = {};
  events.forEach((e) => {
    eventsByDate[e.date] = eventsByDate[e.date] || [];
    eventsByDate[e.date].push(e);
  });

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));

  const todayKey = toDateKey(today);
  const activeKey = toDateKey(activeDate);
  const activeDayEvents = (eventsByDate[activeKey] || []).sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold text-white">
          {firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAY_LABELS.map((w, i) => (
            <div key={i} className="text-[11px] font-medium text-slate-500 py-1">
              {w}
            </div>
          ))}

          {cells.map((d, i) => {
            if (!d) return <div key={i} />;

            const key = toDateKey(d);
            const dayEvents = eventsByDate[key] || [];
            const isToday = key === todayKey;
            const isActive = key === activeKey;

            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectDate(d)}
                className={`relative flex flex-col items-center rounded-lg py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
                    : isToday
                    ? "text-indigo-300 ring-1 ring-inset ring-indigo-500/20"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {d.getDate()}
                {dayEvents.length > 0 && (
                  <span className="mt-1 h-1 w-1 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold text-white">
          {activeDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          {activeDayEvents.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              {activeDayEvents.length} Event{activeDayEvents.length === 1 ? "" : "s"}
            </span>
          )}
        </p>

        {activeDayEvents.length === 0 ? (
          <p className="text-xs text-slate-500">No events scheduled.</p>
        ) : (
          <div className="space-y-2.5">
            {activeDayEvents.map((e) => (
              <ScheduleEvent key={e.id} event={e} onOpenEvent={onOpenEvent} dense />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
