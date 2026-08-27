/**
 * calendarExport.js — build valid calendar entries from CampusConnect events.
 * -----------------------------------------------------------------------
 * The DB stores event date/time as local wall-clock values with no timezone
 * (events.date = date, events.start_time/end_time = time). We therefore emit
 * "floating" local times for .ics (no trailing Z, no TZID) so the event lands
 * at the intended wall-clock time in whatever calendar imports it, and pass the
 * viewer's IANA timezone to Google Calendar via &ctz so it renders correctly.
 *
 * Handles:
 *   - title / description / location fallbacks (snake_case or camelCase source)
 *   - "HH:MM" and "HH:MM:SS" time formats
 *   - missing end time  -> defaults to start + 1 hour
 *   - missing start time -> all-day event
 *   - events crossing midnight (end <= start -> ends next day)
 */

/** Pull a value trying several possible keys (camelCase + snake_case). */
function pick(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return "";
}

/** Normalize an event (from events or event_registrations) for calendar use. */
export function normalizeEventForCalendar(event = {}) {
  return {
    title: String(pick(event, "title", "event_title", "eventTitle") || "Campus Event"),
    description: String(pick(event, "description", "details", "event_description") || ""),
    location: String(pick(event, "venue", "event_venue", "location", "eventVenue") || ""),
    organizer: String(pick(event, "organizer", "event_organizer") || ""),
    date: String(pick(event, "date", "event_date", "eventDate") || ""),
    startTime: String(pick(event, "start_time", "startTime") || ""),
    endTime: String(pick(event, "end_time", "endTime") || ""),
  };
}

/** "9:5" / "09:05" / "09:05:00" -> { h, m }. Returns null if unparseable. */
function parseTime(t) {
  if (!t) return null;
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min) || h > 23 || min > 59) return null;
  return { h, m: min };
}

/** "2026-08-26" -> { y, mo, d }. Returns null if unparseable. */
function parseDate(d) {
  if (!d) return null;
  const m = String(d).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]) };
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Resolve start/end into calendar primitives.
 * Returns { allDay, start:{y,mo,d,h,m}, end:{y,mo,d,h,m} } or null if no date.
 */
function resolveInterval(ev) {
  const date = parseDate(ev.date);
  if (!date) return null;

  const start = parseTime(ev.startTime);
  if (!start) {
    // All-day event: DTEND is the next day (exclusive) per RFC 5545.
    const endDate = addDays(date, 1);
    return { allDay: true, start: { ...date }, end: endDate };
  }

  let end = parseTime(ev.endTime);
  if (!end) end = { h: (start.h + 1) % 24, m: start.m }; // default +1h

  let startDT = { ...date, ...start };
  let endDT = { ...date, ...end };

  // Crosses midnight (or zero/negative duration): push end to next day.
  const startMinutes = start.h * 60 + start.m;
  const endMinutes = end.h * 60 + end.m;
  if (endMinutes <= startMinutes) {
    endDT = { ...addDays(date, 1), ...end };
  }

  return { allDay: false, start: startDT, end: endDT };
}

/** Add days to {y,mo,d} using real calendar math. */
function addDays({ y, mo, d }, days) {
  const dt = new Date(Date.UTC(y, mo - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return { y: dt.getUTCFullYear(), mo: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

/** Local floating stamp: 20260826T090000 */
function localStamp({ y, mo, d, h = 0, m = 0 }) {
  return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`;
}

/** Date-only stamp: 20260826 */
function dateStamp({ y, mo, d }) {
  return `${y}${pad(mo)}${pad(d)}`;
}

/** Escape text per RFC 5545 (commas, semicolons, backslashes, newlines). */
function escapeICS(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Resolve the viewer's IANA timezone (e.g. "Asia/Kolkata"), best-effort. */
function viewerTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

/** Fixed-format UTC DTSTAMP for "now". */
function nowStampUTC() {
  const now = new Date();
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(
    now.getUTCDate()
  )}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

/** Build the VEVENT lines for a single event; returns [] if no usable date. */
function buildVEventLines(rawEvent, { uidSeed } = {}) {
  const ev = normalizeEventForCalendar(rawEvent);
  const interval = resolveInterval(ev);
  if (!interval) return [];

  const uid = `${String(uidSeed || ev.title).replace(/\s+/g, "-")}-${dateStamp(
    interval.start
  )}@campusconnect`;

  const lines = ["BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${nowStampUTC()}`];

  if (interval.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${dateStamp(interval.start)}`);
    lines.push(`DTEND;VALUE=DATE:${dateStamp(interval.end)}`);
  } else {
    lines.push(`DTSTART:${localStamp(interval.start)}`);
    lines.push(`DTEND:${localStamp(interval.end)}`);
  }

  lines.push(`SUMMARY:${escapeICS(ev.title)}`);
  if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
  if (ev.location) lines.push(`LOCATION:${escapeICS(ev.location)}`);
  if (ev.organizer)
    lines.push(`ORGANIZER;CN=${escapeICS(ev.organizer)}:MAILTO:noreply@campusconnect.app`);
  lines.push("END:VEVENT");
  return lines;
}

const ICS_HEADER = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//CampusConnect//Schedule//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
];

/**
 * Build a valid RFC 5545 .ics document string for a single event.
 * Returns null if the event has no usable date.
 */
export function buildICS(rawEvent, opts = {}) {
  const vevent = buildVEventLines(rawEvent, opts);
  if (vevent.length === 0) return null;
  // RFC 5545 requires CRLF line endings.
  return [...ICS_HEADER, ...vevent, "END:VCALENDAR"].join("\r\n");
}

/**
 * Build a valid RFC 5545 .ics document containing MANY events (e.g. a
 * student's whole schedule). Skips any event without a usable date.
 * Returns null if no event could be included.
 */
export function buildICSForEvents(rawEvents = []) {
  const vevents = rawEvents
    .map((ev, i) => buildVEventLines(ev, { uidSeed: `${ev?.title || "event"}-${i}` }))
    .filter((lines) => lines.length > 0);
  if (vevents.length === 0) return null;
  return [...ICS_HEADER, ...vevents.flat(), "END:VCALENDAR"].join("\r\n");
}

/** Shared blob-download helper. */
function triggerDownload(content, filename) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Build a Google Calendar "add event" URL with encoded params.
 * Returns null if the event has no usable date.
 */
export function buildGoogleCalendarUrl(rawEvent) {
  const ev = normalizeEventForCalendar(rawEvent);
  const interval = resolveInterval(ev);
  if (!interval) return null;

  let dates;
  if (interval.allDay) {
    dates = `${dateStamp(interval.start)}/${dateStamp(interval.end)}`;
  } else {
    dates = `${localStamp(interval.start)}/${localStamp(interval.end)}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates,
  });
  if (ev.description) params.set("details", ev.description);
  if (ev.location) params.set("location", ev.location);
  const tz = viewerTimeZone();
  if (tz && !interval.allDay) params.set("ctz", tz);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Trigger a browser download of the .ics file for an event.
 * No-op (returns false) if the event can't be turned into a calendar entry.
 */
export function downloadICS(rawEvent) {
  const ics = buildICS(rawEvent);
  if (!ics) return false;
  const ev = normalizeEventForCalendar(rawEvent);
  const name = `${ev.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "event"}.ics`;
  triggerDownload(ics, name);
  return true;
}

/**
 * Trigger a browser download of a single .ics file containing MANY events
 * (the student's whole schedule). No-op (returns false) if none are valid.
 */
export function downloadICSForEvents(rawEvents = [], filename = "campusconnect-schedule.ics") {
  const ics = buildICSForEvents(rawEvents);
  if (!ics) return false;
  triggerDownload(ics, filename);
  return true;
}
