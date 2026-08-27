import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { buildGoogleCalendarUrl } from "./Schedule/calendarExport";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  AlertTriangle,
  CalendarPlus,
  CalendarDays,
} from "lucide-react";

const VIEWS = ["Day", "Week", "Month"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* =========================================================
   DATE HELPERS
   All schedule events are derived from the student's
   registered events (status === "registered") rather than a
   separate duplicate event list, so this stays in sync with
   My Registrations automatically.
========================================================= */

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function fmtLongDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function fmtShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function startOfWeek(date) {
  const d = toDateOnly(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

/* =========================================================
   CONFLICT DETECTION
   Two scheduled events conflict when their [start, end)
   windows overlap on the same day.
========================================================= */

function findConflicts(scheduleEvents) {
  const conflicts = [];
  const byDay = {};

  scheduleEvents.forEach((ev) => {
    const key = dateKey(ev.start);
    byDay[key] = byDay[key] || [];
    byDay[key].push(ev);
  });

  Object.values(byDay).forEach((dayEvents) => {
    for (let i = 0; i < dayEvents.length; i++) {
      for (let j = i + 1; j < dayEvents.length; j++) {
        const a = dayEvents[i];
        const b = dayEvents[j];
        if (a.start < b.end && b.start < a.end) {
          conflicts.push([a, b]);
        }
      }
    }
  });

  return conflicts;
}

function ScheduleHeader({ onAddToCalendar }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-white">My Schedule</h1>
        <p className="mt-1 text-sm text-slate-400">
          Keep track of your upcoming campus events and activities.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-inset ring-white/10 text-sm text-slate-300">
          Today
        </span>
        <button
          onClick={onAddToCalendar}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 ring-1 ring-inset ring-indigo-500/30 text-indigo-300 text-sm font-medium transition-colors"
        >
          <CalendarPlus size={15} />
          Add to Google Calendar
        </button>
      </div>
    </div>
  );
}

/* =========================================================
  VIEW SWITCHER
========================================================= */

function ScheduleViewSwitcher({ view, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 p-1">
      {VIEWS.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === v
              ? "bg-indigo-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   SCHEDULE EVENT (shared pill used across views)
========================================================= */

function ScheduleEvent({ scheduleEvent, onClick, dense = false }) {
  return (
    <button
      onClick={() => onClick(scheduleEvent)}
      className={`w-full text-left rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 ring-1 ring-inset ring-indigo-500/25 transition-colors ${
        dense ? "px-3 py-2" : "px-4 py-3"
      }`}
    >
      <p className="text-sm font-semibold text-white truncate">
        {scheduleEvent.title}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin size={12} />
        {scheduleEvent.venue}
      </p>
    </button>
  );
}

/* =========================================================
   CONFLICT WARNING
========================================================= */

function ScheduleConflictWarning({ conflicts, onOpen }) {
  if (conflicts.length === 0) return null;

  return (
    <div className="rounded-xl bg-orange-500/10 ring-1 ring-inset ring-orange-500/30 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-300">
            Schedule Conflict
          </p>
          <p className="mt-0.5 text-sm text-slate-400">
            You have two events scheduled at the same time.
          </p>

          <div className="mt-3 space-y-2">
            {conflicts.map(([a, b], idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-2 sm:items-center"
              >
                {[a, b].map((ev) => (
                  <button
                    key={ev.registrationId}
                    onClick={() => onOpen(ev)}
                    className="flex-1 text-left rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-inset ring-white/10 px-3 py-2"
                  >
                    <p className="text-sm text-white truncate">{ev.title}</p>
                    <p className="text-xs text-slate-400">
                      {fmtShortDate(ev.start)} &bull; {fmtTime(ev.startTime)}
                    </p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WEEK VIEW
========================================================= */

function WeekView({ weekStart, scheduleEvents, today, onOpen }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const dayEvents = scheduleEvents
          .filter((ev) => isSameDay(ev.start, day))
          .sort((a, b) => a.start - b.start);

        if (dayEvents.length === 0) return null;

        const isToday = isSameDay(day, today);

        return (
          <div key={dateKey(day)}>
            <p
              className={`text-sm font-semibold mb-2 ${
                isToday ? "text-indigo-300" : "text-slate-300"
              }`}
            >
              {WEEKDAY_NAMES[day.getDay()]} &mdash; {fmtShortDate(day)}
              {isToday && (
                <span className="ml-2 text-[11px] font-medium text-indigo-400">
                  Today
                </span>
              )}
            </p>

            <div className="space-y-2">
              {dayEvents.map((ev) => (
                <div
                  key={ev.registrationId}
                  className="flex items-center gap-3"
                >
                  <span className="w-20 shrink-0 text-xs text-slate-500">
                    {fmtTime(ev.startTime)}
                  </span>
                  <div className="flex-1">
                    <ScheduleEvent scheduleEvent={ev} onClick={onOpen} dense />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {scheduleEvents.filter((ev) =>
        days.some((d) => isSameDay(d, ev.start))
      ).length === 0 && (
        <p className="text-sm text-slate-500 text-center py-10">
          No events scheduled this week.
        </p>
      )}
    </div>
  );
}

/* =========================================================
   DAY VIEW
========================================================= */

function DayView({ day, scheduleEvents, onOpen }) {
  const dayEvents = scheduleEvents
    .filter((ev) => isSameDay(ev.start, day))
    .sort((a, b) => a.start - b.start);

  // Build a simple hourly timeline from 8 AM to 8 PM, marking any
  // hour that overlaps a scheduled event.
  const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8..20

  return (
    <div>
      <p className="text-sm font-semibold text-slate-300 mb-4">
        {fmtLongDate(day)}
      </p>

      {dayEvents.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-10">
          No events scheduled for this day.
        </p>
      ) : (
        <div className="space-y-1">
          {hours.map((h) => {
            const hourDate = new Date(day);
            hourDate.setHours(h, 0, 0, 0);
            const nextHour = new Date(hourDate);
            nextHour.setHours(h + 1);

            const covering = dayEvents.filter(
              (ev) => ev.start < nextHour && ev.end > hourDate
            );

            const label = fmtTime(
              `${String(h).padStart(2, "0")}:00`
            );

            return (
              <div key={h} className="flex items-start gap-3">
                <span className="w-20 shrink-0 pt-2.5 text-xs text-slate-500">
                  {label}
                </span>
                <div className="flex-1 py-1">
                  {covering.length > 0 ? (
                    <div className="space-y-1.5">
                      {covering
                        .filter((ev) => isSameDay(ev.start, hourDate) && ev.start.getHours() === h)
                        .map((ev) => (
                          <ScheduleEvent
                            key={ev.registrationId}
                            scheduleEvent={ev}
                            onClick={onOpen}
                          />
                        ))}
                      {covering.some(
                        (ev) =>
                          !(ev.start.getHours() === h)
                      ) && (
                        <p className="px-1 text-xs text-slate-500 italic">
                          continues from earlier
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="px-1 text-xs text-slate-600">Free</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MONTH VIEW
========================================================= */

function MonthView({ monthAnchor, scheduleEvents, today, selectedDay, onSelectDay }) {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = startOfWeek(firstOfMonth);

  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const eventsByDay = useMemo(() => {
    const map = {};
    scheduleEvents.forEach((ev) => {
      const key = dateKey(ev.start);
      map[key] = map[key] || [];
      map[key].push(ev);
    });
    return map;
  }, [scheduleEvents]);

  const selectedDayEvents = selectedDay
    ? (eventsByDay[dateKey(selectedDay)] || []).sort(
        (a, b) => a.start - b.start
      )
    : [];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500 uppercase mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const inMonth = cell.getMonth() === month;
          const isToday = isSameDay(cell, today);
          const isSelected = selectedDay && isSameDay(cell, selectedDay);
          const dayEvents = eventsByDay[dateKey(cell)] || [];

          return (
            <button
              key={dateKey(cell)}
              onClick={() => onSelectDay(cell)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 text-sm transition-colors ${
                isSelected
                  ? "bg-indigo-500 text-white"
                  : isToday
                  ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/30"
                  : inMonth
                  ? "text-slate-300 hover:bg-white/5"
                  : "text-slate-600 hover:bg-white/5"
              }`}
            >
              <span>{cell.getDate()}</span>
              {dayEvents.length > 0 && (
                <span
                  className={`h-1 w-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-indigo-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Side panel: selected day's events */}
      {selectedDay && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-300 mb-2">
            {fmtLongDate(selectedDay)}
          </p>
          {selectedDayEvents.length === 0 ? (
            <p className="text-sm text-slate-500">
              No events scheduled for this day.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((ev) => (
                <ScheduleEvent
                  key={ev.registrationId}
                  scheduleEvent={ev}
                  onClick={() => {}}
                  dense
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   UPCOMING LIST
========================================================= */

function UpcomingList({ scheduleEvents, onOpen, onAddToGoogle }) {
  const upcoming = [...scheduleEvents]
    .sort((a, b) => a.start - b.start)
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Upcoming</h3>
      <div className="space-y-2">
        {upcoming.map((ev) => (
          <div
            key={ev.registrationId}
            className="flex items-center justify-between gap-3 rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {ev.title}
              </p>
              <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CalendarIcon size={12} />
                  {fmtShortDate(ev.start)} &bull; {fmtTime(ev.startTime)}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={12} />
                  {ev.venue}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => onAddToGoogle(ev)}
                title="Add to Google Calendar"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 ring-1 ring-inset ring-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
              >
                <CalendarPlus size={13} />
                Google
              </button>
              <button
                onClick={() => onOpen(ev)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-inset ring-white/10 text-slate-200 text-xs font-medium transition-colors"
              >
                View Event
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function ScheduleEmptyState({ onBrowseEvents }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
      <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center mb-4">
        <CalendarDays size={26} className="text-indigo-400" />
      </div>
      <h3 className="text-white font-semibold text-lg">
        Your Schedule is Empty
      </h3>
      <p className="mt-1.5 text-sm text-slate-400 max-w-sm">
        Register for events to build your personalized campus schedule.
      </p>
      <button
        onClick={onBrowseEvents}
        className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
      >
        Browse Events
      </button>
    </div>
  );
}

function ScheduleLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden="true">
      <div className="rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 px-4 py-3">
        <div className="h-4 w-48 rounded bg-white/10" />
      </div>
      <div className="rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 p-4 space-y-3">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="h-9 w-56 rounded-xl bg-white/10" />
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-lg bg-white/10" />
          <div className="h-9 w-9 rounded-lg bg-white/10" />
          <div className="h-9 w-9 rounded-lg bg-white/10" />
        </div>
      </div>
      <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 p-4 sm:p-5 space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-3">
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="h-16 w-full rounded-xl bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE: SCHEDULE
========================================================= */

export default function Schedule({ onNavigateToBrowse, onOpenEvent }) {
  const today = useMemo(() => toDateOnly(new Date()), []);
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("Week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [monthAnchor, setMonthAnchor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => {
    let active = true;

    const loadSchedule = async () => {
      setLoading(true);
      setError("");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        if (active) {
          setError("Please log in to view your schedule.");
          setLoading(false);
        }
        return;
      }

      const { data, error: queryError } = await supabase
        .from("event_registrations")
        .select("id, event_id, event_title, event_date, start_time, end_time, event_venue, event_organizer, status")
        .eq("user_id", authData.user.id)
        .in("status", ["registered", "accepted", "pending"])
        .order("event_date", { ascending: true });

      if (!active) return;
      if (queryError) {
        setError(queryError.message);
      } else {
        setScheduleEvents((data || []).map((registration) => {
          const startTime = registration.start_time?.slice(0, 5) || "00:00";
          const endTime = registration.end_time?.slice(0, 5) || startTime;
          return {
            registrationId: registration.id,
            eventId: registration.event_id,
            title: registration.event_title,
            venue: registration.event_venue || "Venue TBA",
            organizer: registration.event_organizer || "",
            date: registration.event_date,
            status: registration.status,
            startTime,
            endTime,
            start: new Date(`${registration.event_date}T${startTime}`),
            end: new Date(`${registration.event_date}T${endTime}`),
          };
        }));
      }
      setLoading(false);
    };

    loadSchedule();
    return () => {
      active = false;
    };
  }, []);

  const conflicts = useMemo(() => findConflicts(scheduleEvents), [
    scheduleEvents,
  ]);

  const todaysEvents = scheduleEvents.filter((ev) => isSameDay(ev.start, today));

  const handleAddToCalendar = () => {
    const firstEvent = [...scheduleEvents].sort((a, b) => a.start - b.start)[0];
    if (firstEvent) handleAddEventToGoogle(firstEvent);
    else setError("There are no scheduled events to add to Google Calendar yet.");
  };

  const handleAddEventToGoogle = (scheduleEvent) => {
    const url = buildGoogleCalendarUrl(scheduleEvent);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenScheduleEvent = (scheduleEvent) => {
    if (onOpenEvent) onOpenEvent(scheduleEvent.eventId);
  };

  const goToday = () => {
    setWeekStart(startOfWeek(today));
    setSelectedDay(today);
    setMonthAnchor(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
        <ScheduleHeader onAddToCalendar={handleAddToCalendar} />
        <div className="mt-6">
          <ScheduleLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
        <ScheduleHeader onAddToCalendar={handleAddToCalendar} />
        <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (scheduleEvents.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
        <ScheduleHeader onAddToCalendar={handleAddToCalendar} />
        <div className="mt-6">
          <ScheduleEmptyState onBrowseEvents={onNavigateToBrowse} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      <ScheduleHeader onAddToCalendar={handleAddToCalendar} />

      {/* TODAY HIGHLIGHT */}
      <div className="mt-6 rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">
          Today &mdash; {fmtLongDate(today)}
        </p>
        <span className="text-xs text-slate-400">
          {todaysEvents.length === 0
            ? "No events scheduled for today."
            : `${todaysEvents.length} event${
                todaysEvents.length > 1 ? "s" : ""
              } today`}
        </span>
      </div>

      {/* CONFLICT WARNING */}
      {conflicts.length > 0 && (
        <div className="mt-4">
          <ScheduleConflictWarning
            conflicts={conflicts}
            onOpen={handleOpenScheduleEvent}
          />
        </div>
      )}

      {/* VIEW SWITCHER + NAV */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <ScheduleViewSwitcher view={view} onChange={setView} />

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (view === "Week") setWeekStart((d) => addDays(d, -7));
              else if (view === "Day") setSelectedDay((d) => addDays(d, -1));
              else
                setMonthAnchor(
                  (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
                );
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            Today
          </button>
          <button
            onClick={() => {
              if (view === "Week") setWeekStart((d) => addDays(d, 7));
              else if (view === "Day") setSelectedDay((d) => addDays(d, 1));
              else
                setMonthAnchor(
                  (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
                );
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* VIEW CONTENT */}
      <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 p-4 sm:p-5">
        {view === "Week" && (
          <WeekView
            weekStart={weekStart}
            scheduleEvents={scheduleEvents}
            today={today}
            onOpen={handleOpenScheduleEvent}
          />
        )}
        {view === "Day" && (
          <DayView
            day={selectedDay}
            scheduleEvents={scheduleEvents}
            onOpen={handleOpenScheduleEvent}
          />
        )}
        {view === "Month" && (
          <MonthView
            monthAnchor={monthAnchor}
            scheduleEvents={scheduleEvents}
            today={today}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        )}
      </div>

      {/* UPCOMING */}
      <div className="mt-6">
        <UpcomingList
          scheduleEvents={scheduleEvents}
          onOpen={handleOpenScheduleEvent}
          onAddToGoogle={handleAddEventToGoogle}
        />
      </div>
    </div>
  );
}