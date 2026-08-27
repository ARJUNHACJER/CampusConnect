import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../../../supabaseClient";
import { detectEventClash } from "../../../utils/detectEventClash";
import { getConflictingEvents } from "../../../utils/getConflictingEvents";

/**
 * useEventClash(studentId)
 * ---------------------------------------------------------------------------
 * Loads the current student's registered events once, and exposes
 * checkClash(newEvent) / getConflicts(newEvent) helpers built on top of the
 * shared detectEventClash / getConflictingEvents utilities.
 *
 * Use this from Browse Events, Event Details, the registration flow,
 * My Registrations, and Schedule so the clash logic is defined in exactly
 * one place.
 * ---------------------------------------------------------------------------
 */
export function useEventClash(studentId) {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRegisteredEvents = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("event:events(id, title, date, start_time, end_time, location)")
        .eq("student_id", studentId)
        .eq("status", "registered");

      if (error) throw error;

      const normalized = (data || [])
        .map((row) => row.event)
        .filter(Boolean)
        .map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          startTime: e.start_time,
          endTime: e.end_time,
          location: e.location,
        }));

      setRegisteredEvents(normalized);
    } catch (err) {
      console.warn("[useEventClash] Could not load registered events:", err.message);
      setRegisteredEvents([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadRegisteredEvents();
  }, [loadRegisteredEvents]);

  const checkClash = useCallback(
    (newEvent) => detectEventClash(newEvent, registeredEvents),
    [registeredEvents]
  );

  const getConflicts = useCallback(
    (newEvent) => getConflictingEvents(newEvent, registeredEvents),
    [registeredEvents]
  );

  return {
    registeredEvents,
    loading,
    checkClash,
    getConflicts,
    refetch: loadRegisteredEvents,
  };
}

export default useEventClash;
