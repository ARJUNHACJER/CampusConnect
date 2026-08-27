import React from "react";
import { Clock, MapPin, Eye } from "lucide-react";

/**
 * ConflictEventList
 * ---------------------------------------------------------------------------
 * Renders one or more conflicting events as compact rows: time, location,
 * and a "View Event" action. Used inside EventConflictModal, on the
 * Schedule page's overlap clusters, and in My Registrations' inline
 * conflict indicator.
 *
 * `label` (optional) tags the group, e.g. "Existing Event" / "New Event".
 * ---------------------------------------------------------------------------
 */
export default function ConflictEventList({ events = [], label, onViewEvent }) {
  if (!events.length) return null;

  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      ) : null}
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {event.title || event.name}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {formatTimeRange(event.startTime, event.endTime)}
              </span>
              {event.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  {event.location}
                </span>
              ) : null}
            </div>
          </div>
          {onViewEvent ? (
            <button
              onClick={() => onViewEvent(event)}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              <Eye size={13} />
              View
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function formatTimeRange(start, end) {
  if (!start || !end) return "";
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
}

export { formatTimeRange, formatTime };
