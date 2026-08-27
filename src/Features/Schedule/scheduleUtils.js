import { supabase } from "../../supabaseClient";

export async function getScheduledEvents() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return [];

  const { data, error } = await supabase
    .from("schedule_entries")
    .select("id, event_id, event_title, event_date, start_time, end_time, event_venue")
    .eq("user_id", authData.user.id)
    .order("event_date", { ascending: true });

  if (error) {
    // Older deployments may not have the optional schedule table yet. The
    // registered event snapshot still gives the student a usable schedule.
    if (error.code !== "42P01" && error.code !== "PGRST205") throw error;
    const fallback = await supabase
      .from("event_registrations")
      .select("event_id,event_title,event_date,start_time,end_time,event_venue,status")
      .eq("user_id", authData.user.id)
      .in("status", ["pending", "accepted", "registered", "attended"])
      .order("event_date", { ascending: true });
    if (fallback.error) throw fallback.error;
    return (fallback.data || []).map((registration) => ({
      id: registration.event_id,
      title: registration.event_title,
      date: registration.event_date,
      startTime: registration.start_time?.slice(0, 5) || "00:00",
      endTime: registration.end_time?.slice(0, 5) || "00:00",
      venue: registration.event_venue || "Venue TBA",
    }));
  }

  return (data || []).map((registration) => ({
    id: registration.event_id,
    title: registration.event_title,
    date: registration.event_date,
    startTime: registration.start_time?.slice(0, 5) || "00:00",
    endTime: registration.end_time?.slice(0, 5) || "00:00",
    venue: registration.event_venue || "Venue TBA",
  }));
}

export function toMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatTimeLabel(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function findConflicts(events) {
  const conflicts = [];
  const byDate = {};

  events.forEach((event) => {
    byDate[event.date] = byDate[event.date] || [];
    byDate[event.date].push(event);
  });

  Object.values(byDate).forEach((dayEvents) => {
    for (let first = 0; first < dayEvents.length; first += 1) {
      for (let second = first + 1; second < dayEvents.length; second += 1) {
        const a = dayEvents[first];
        const b = dayEvents[second];
        if (toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime)) {
          conflicts.push([a, b]);
        }
      }
    }
  });

  return conflicts;
}
