/**
 * detectEventClash.js
 * ---------------------------------------------------------------------------
 * Pure utility functions for detecting schedule overlaps between events.
 * No UI, no React, no Supabase — safe to unit test and reuse anywhere
 * (Browse Events, Event Details, Registration flow, My Registrations, Schedule).
 *
 * Event shape expected:
 * {
 *   id: string,
 *   date: "YYYY-MM-DD",
 *   startTime: "HH:MM" (24hr) | "HH:MM:SS",
 *   endTime: "HH:MM" (24hr) | "HH:MM:SS",
 *   title / name: string,
 *   location: string,
 * }
 * ---------------------------------------------------------------------------
 */

/**
 * Normalizes a date + time pair into a comparable Date object.
 * Falls back gracefully if seconds are missing.
 */
function toDateTime(date, time) {
  if (!date || !time) return null;
  const safeTime = time.length === 5 ? `${time}:00` : time;
  const dt = new Date(`${date}T${safeTime}`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/**
 * Returns true if two [start, end) time ranges on the same day overlap.
 *
 * Rules (per spec):
 *  - Same start time                         -> conflict
 *  - Partial overlap                         -> conflict
 *  - New event starts exactly when old ends  -> NO conflict (touching, not overlapping)
 *  - Different dates                         -> NO conflict
 */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart < bEnd && aEnd > bStart;
}

/**
 * detectEventClash(newEvent, registeredEvents)
 * Returns true/false — does newEvent clash with ANY of the student's
 * existing registered events?
 */
export function detectEventClash(newEvent, registeredEvents = []) {
  if (!newEvent?.date || !newEvent?.startTime || !newEvent?.endTime) return false;

  return registeredEvents.some((event) => {
    if (!event || event.date !== newEvent.date) return false;
    if (event.id && newEvent.id && event.id === newEvent.id) return false; // ignore itself

    const newStart = toDateTime(newEvent.date, newEvent.startTime);
    const newEnd = toDateTime(newEvent.date, newEvent.endTime);
    const existingStart = toDateTime(event.date, event.startTime);
    const existingEnd = toDateTime(event.date, event.endTime);

    return rangesOverlap(newStart, newEnd, existingStart, existingEnd);
  });
}

export default detectEventClash;
