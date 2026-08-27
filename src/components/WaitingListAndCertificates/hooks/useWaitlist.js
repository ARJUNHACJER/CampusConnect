import { useCallback, useMemo, useState } from "react";
import { EVENTS, WAITLIST_ENTRIES } from "../shared/mockData";

/* ==========================================================================
   useWaitlist
   All read/write operations for the waitlist system live here. Every
   function below is written as if it were already async (`await`) so
   swapping the in-memory arrays for real Supabase calls is mechanical:

     // TODO(supabase): replace with
     // const { data } = await supabase.from("waitlist_entries").select("*").eq("eventId", eventId)

   ========================================================================== */

export function useWaitlist(currentStudentId) {
  const [events, setEvents] = useState(EVENTS);
  const [entries, setEntries] = useState(WAITLIST_ENTRIES);
  const [loading, setLoading] = useState(false);

  const getEvent = useCallback(
    (eventId) => events.find((e) => e.id === eventId),
    [events]
  );

  const getEntryForStudent = useCallback(
    (eventId, studentId = currentStudentId) =>
      entries.find(
        (w) =>
          w.eventId === eventId &&
          w.studentId === studentId &&
          w.status !== "cancelled"
      ),
    [entries, currentStudentId]
  );

  const getWaitlistForEvent = useCallback(
    (eventId) =>
      entries
        .filter((w) => w.eventId === eventId && w.status === "waiting")
        .sort((a, b) => a.position - b.position),
    [entries]
  );

  const myWaitlistedEvents = useMemo(
    () =>
      entries
        .filter(
          (w) => w.studentId === currentStudentId && w.status !== "cancelled"
        )
        .map((w) => ({ ...w, event: getEvent(w.eventId) })),
    [entries, currentStudentId, getEvent]
  );

  /** Determine the event-details CTA state for a given event + student. */
  const getEventState = useCallback(
    (eventId, studentId = currentStudentId) => {
      const event = getEvent(eventId);
      if (!event) return { state: "unknown" };
      if (event.status === "completed") return { state: "completed", event };

      const myEntry = getEntryForStudent(eventId, studentId);
      if (myEntry?.status === "waiting")
        return { state: "waitlisted", event, entry: myEntry };
      if (myEntry?.status === "offered")
        return { state: "offered", event, entry: myEntry };
      if (myEntry?.status === "registered")
        return { state: "registered", event, entry: myEntry };

      const isFull = event.registeredCount >= event.maxParticipants;
      return { state: isFull ? "full" : "open", event };
    },
    [getEvent, getEntryForStudent, currentStudentId]
  );

  const joinWaitlist = useCallback(
    async (eventId, studentId = currentStudentId, studentName = "You") => {
      setLoading(true);
      // TODO(supabase): insert into waitlist_entries, enforce unique(eventId, studentId)
      await new Promise((r) => setTimeout(r, 300));
      let newEntry;
      setEntries((prev) => {
        const currentMax = prev
          .filter((w) => w.eventId === eventId && w.status === "waiting")
          .reduce((max, w) => Math.max(max, w.position), 0);
        newEntry = {
          id: `wait_${Date.now()}`,
          eventId,
          studentId,
          studentName,
          position: currentMax + 1,
          joinedAt: new Date().toISOString(),
          status: "waiting",
          offerExpiresAt: null,
        };
        return [...prev, newEntry];
      });
      setLoading(false);
      return newEntry;
    },
    [currentStudentId]
  );

  const leaveWaitlist = useCallback(async (entryId) => {
    setLoading(true);
    // TODO(supabase): delete row, then recalculate `position` for the
    // remaining rows in that event via a transaction / RPC.
    await new Promise((r) => setTimeout(r, 250));
    setEntries((prev) => {
      const target = prev.find((w) => w.id === entryId);
      if (!target) return prev;
      return prev
        .filter((w) => w.id !== entryId)
        .map((w) =>
          w.eventId === target.eventId &&
          w.status === "waiting" &&
          w.position > target.position
            ? { ...w, position: w.position - 1 }
            : w
        );
    });
    setLoading(false);
  }, []);

  /** Called when a registered student cancels, freeing a seat. */
  const promoteNextInLine = useCallback(async (eventId) => {
    setLoading(true);
    // TODO(supabase): RPC that atomically finds MIN(position) where
    // status='waiting', sets status='offered', offerExpiresAt=now()+duration
    await new Promise((r) => setTimeout(r, 300));
    let promoted = null;
    setEntries((prev) => {
      const next = [...prev];
      const candidates = next
        .filter((w) => w.eventId === eventId && w.status === "waiting")
        .sort((a, b) => a.position - b.position);
      if (candidates.length === 0) return prev;
      const target = candidates[0];
      const idx = next.findIndex((w) => w.id === target.id);
      const event = events.find((e) => e.id === eventId);
      const hours = event?.seatOfferDurationHours ?? 12;
      const expiresAt = new Date(
        Date.now() + hours * 60 * 60 * 1000
      ).toISOString();
      next[idx] = { ...target, status: "offered", offerExpiresAt: expiresAt };
      promoted = next[idx];
      return next;
    });
    setLoading(false);
    return promoted; // Caller creates the "Seat Available" notification
  }, [events]);

  /** Student accepts an offered seat. Runs the clash check first. */
  const acceptSeat = useCallback(
    async (entryId, { hasClash = false } = {}) => {
      if (hasClash) {
        // Warning-only policy: caller must re-invoke with explicit
        // confirmation after showing the Schedule Conflict dialog.
        return { ok: false, reason: "clash" };
      }
      setLoading(true);
      // TODO(supabase): transaction — update waitlist_entries.status='registered',
      // insert into registrations, increment events.registeredCount
      await new Promise((r) => setTimeout(r, 300));
      let updated = null;
      setEntries((prev) =>
        prev.map((w) => {
          if (w.id !== entryId) return w;
          updated = { ...w, status: "registered" };
          return updated;
        })
      );
      if (updated) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === updated.eventId
              ? { ...e, registeredCount: e.registeredCount + 1 }
              : e
          )
        );
      }
      setLoading(false);
      return { ok: true, entry: updated };
    },
    []
  );

  const declineOrExpireOffer = useCallback(async (entryId) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 250));
    let eventId = null;
    setEntries((prev) =>
      prev.map((w) => {
        if (w.id !== entryId) return w;
        eventId = w.eventId;
        return { ...w, status: "expired" };
      })
    );
    setLoading(false);
    if (eventId) {
      return promoteNextInLine(eventId); // cascade to next in line
    }
    return null;
  }, [promoteNextInLine]);

  return {
    loading,
    events,
    entries,
    getEvent,
    getEntryForStudent,
    getWaitlistForEvent,
    myWaitlistedEvents,
    getEventState,
    joinWaitlist,
    leaveWaitlist,
    promoteNextInLine,
    acceptSeat,
    declineOrExpireOffer,
  };
}
