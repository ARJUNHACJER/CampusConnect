import React, { useEffect, useMemo, useState } from "react";

import ScheduleHeader from "./components/ScheduleHeader";
import ScheduleViewSwitcher from "./components/ScheduleViewSwitcher";
import DayView from "./components/DayView";
import WeekView from "./components/WeekView";
import MonthView from "./components/MonthView";
import ScheduleConflictWarning from "./components/ScheduleConflictWarning";
import UpcomingSchedule from "./components/UpcomingSchedule";
import ScheduleEmptyState from "./components/ScheduleEmptyState";
import ScheduleSkeleton from "./components/ScheduleSkeleton";

import { getScheduledEvents, findConflicts, formatTimeLabel } from "./scheduleUtils";

const TODAY = new Date(); // Aug 22, 2026 in the current CampusConnect demo data

function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Route: /events/schedule
 *
 * Answers "what do I have, on which day, at what time?" — distinct from
 * My Registrations, which answers "what have I registered for?". Schedule
 * derives its timeline purely from the student's registered events, so it
 * never owns a duplicate event list.
 */
export default function Schedule({ onNavigateToBrowse, onOpenEvent }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  const [view, setView] = useState("Week");
  const [activeDate, setActiveDate] = useState(TODAY);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getScheduledEvents()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your schedule. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const conflicts = useMemo(() => findConflicts(events), [events]);

  const upcoming = useMemo(() => {
    const todayKey = toDateKey(TODAY);
    return events
      .filter((e) => e.date >= todayKey)
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
      .slice(0, 5);
  }, [events]);

  const todayEvent = events.find((e) => e.date === toDateKey(TODAY));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <ScheduleHeader
        onToday={() => setActiveDate(new Date(TODAY))}
      />

      {loading && <ScheduleSkeleton />}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <ScheduleEmptyState onBrowseEvents={onNavigateToBrowse} />
      )}

      {!loading && !error && events.length > 0 && (
        <>
          {/* Today highlight */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="text-xs font-semibold tracking-wide text-slate-500">TODAY</p>
            {todayEvent ? (
              <div className="mt-2">
                <p className="text-sm font-semibold text-white">{todayEvent.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatTimeLabel(todayEvent.startTime)} – {formatTimeLabel(todayEvent.endTime)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">📍 {todayEvent.venue}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No events scheduled for today.</p>
            )}
          </div>

          <ScheduleConflictWarning conflicts={conflicts} onOpenEvent={onOpenEvent} />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <ScheduleViewSwitcher view={view} onChange={setView} />
          </div>

          {view === "Day" && (
            <DayView
              selectedDate={activeDate}
              events={events}
              onOpenEvent={onOpenEvent}
              today={TODAY}
            />
          )}

          {view === "Week" && (
            <WeekView
              selectedDate={activeDate}
              events={events}
              onOpenEvent={onOpenEvent}
              today={TODAY}
            />
          )}

          {view === "Month" && (
            <MonthView
              selectedDate={activeDate}
              activeDate={activeDate}
              onSelectDate={setActiveDate}
              events={events}
              onOpenEvent={onOpenEvent}
              today={TODAY}
            />
          )}

          <UpcomingSchedule events={upcoming} onOpenEvent={onOpenEvent} />
        </>
      )}
    </div>
  );
}
