/**
 * getConflictingEvents.js
 * ---------------------------------------------------------------------------
 * Companion to detectEventClash.js. Where detectEventClash() answers
 * "is there a conflict?", this module answers "which events, exactly?"
 * ---------------------------------------------------------------------------
 */

function toDateTime(date, time) {
  if (!date || !time) return null;
  const safeTime = time.length === 5 ? `${time}:00` : time;
  const dt = new Date(`${date}T${safeTime}`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart < bEnd && aEnd > bStart;
}

/**
 * getConflictingEvents(newEvent, registeredEvents)
 * Returns an array of every registered event that overlaps with newEvent.
 * Empty array = no conflicts.
 */
export function getConflictingEvents(newEvent, registeredEvents = []) {
  if (!newEvent?.date || !newEvent?.startTime || !newEvent?.endTime) return [];

  const newStart = toDateTime(newEvent.date, newEvent.startTime);
  const newEnd = toDateTime(newEvent.date, newEvent.endTime);

  return registeredEvents.filter((event) => {
    if (!event || event.date !== newEvent.date) return false;
    if (event.id && newEvent.id && event.id === newEvent.id) return false;

    const existingStart = toDateTime(event.date, event.startTime);
    const existingEnd = toDateTime(event.date, event.endTime);
    return overlaps(newStart, newEnd, existingStart, existingEnd);
  });
}

/**
 * getScheduleConflictGroups(registeredEvents)
 * For the Schedule page: given the student's full set of registered events,
 * returns groups of mutually-overlapping events so the UI can render
 * "⚠️ N Events Overlap" clusters.
 *
 * Output: [{ events: [eventA, eventB, ...] }, ...]
 * Only groups with 2+ events are returned.
 */
export function getScheduleConflictGroups(registeredEvents = []) {
  const groups = [];
  const visited = new Set();

  registeredEvents.forEach((event, idx) => {
    if (visited.has(event.id ?? idx)) return;

    const cluster = [event];
    const conflicts = getConflictingEvents(event, registeredEvents);
    conflicts.forEach((c) => cluster.push(c));

    if (cluster.length > 1) {
      // De-dupe by id (fallback to reference) and mark visited
      const seen = new Set();
      const unique = cluster.filter((e) => {
        const key = e.id ?? e;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      unique.forEach((e) => visited.add(e.id ?? e));
      groups.push({ events: unique });
    }
  });

  return groups;
}

export default getConflictingEvents;
