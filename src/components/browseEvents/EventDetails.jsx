import React, { useState } from "react";
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useProfile } from "../../campusconnect-profile/src/context/useProfile";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Code2,
  Palette,
  Music2,
  Lightbulb,
} from "lucide-react";

/* =========================================================
   HELPERS (same formatting rules as BrowseEvents.jsx)
========================================================= */

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(start, end) {
  const fmt = (t) => {
    if (!t) return "Time TBA";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(start)} \u2013 ${fmt(end)}`;
}

const CATEGORY_VISUALS = {
  Technical: { icon: Code2, classes: "from-cyan-500 via-blue-700 to-indigo-950" },
  Design: { icon: Palette, classes: "from-pink-500 via-rose-600 to-orange-900" },
  Cultural: { icon: Music2, classes: "from-amber-400 via-orange-600 to-red-900" },
  Entrepreneurship: { icon: Lightbulb, classes: "from-emerald-400 via-teal-600 to-cyan-950" },
};

/* =========================================================
   PAGE: EVENT DETAILS
   Read-only view of a single event, reached from either Browse
   Events or Schedule. Registering here is a local UI mock —
   wiring it to Supabase only needs to change handleRegister.
========================================================= */

export default function EventDetails({ event, onBack }) {
  const { registrationReady, overallCompletion, registrationBlockReason } = useProfile();
  const [registered, setRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showProfileMessage, setShowProfileMessage] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [limitMessage, setLimitMessage] = useState("");

  useEffect(() => {
    if (!event) {
      setRegistrationLoading(false);
      return;
    }
    setRegistrationLoading(true);
    setRegistered(false);
    setRegistrationStatus(null);
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("event_registrations").select("status, action_count").eq("user_id", data.user.id).eq("event_id", event.id).maybeSingle().then(({ data: registration }) => {
        setRegistrationStatus(registration?.status || null);
        setRegistered(["pending", "accepted", "registered", "attended"].includes(registration?.status));
        setActionCount(registration?.action_count || 0);
        setRegistrationLoading(false);
      });
    }).catch(() => setRegistrationLoading(false));
  }, [event]);

  if (!event) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <p className="mt-6 text-sm text-slate-400">
          No event selected. Head back to Browse Events to pick one.
        </p>
      </div>
    );
  }

  const handleRegister = async () => {
    if (!registrationReady) {
      setShowProfileMessage(true);
      return;
    }

    setRegistering(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setRegistering(false);
      return;
    }

    // Always decide from a FRESH read of the row, never from stale local state —
    // this closes the double-click race and keeps the attempt cap honest.
    const { data: existing } = await supabase
      .from("event_registrations")
      .select("id, status, action_count")
      .eq("user_id", userData.user.id)
      .eq("event_id", event.id)
      .maybeSingle();

    // Pending / accepted / attended registrations already hold a slot — block
    // re-registration. (Rejected and cancelled rows are allowed to re-register.)
    if (existing && ["pending", "accepted", "registered", "attended"].includes(existing.status)) {
      setRegistered(true);
      setActionCount(existing.action_count || 0);
      setRegistering(false);
      return;
    }

    // action_count counts registration SUBMISSIONS only (cancelling is free).
    // Once 3 attempts are used, a rejected student is permanently blocked.
    const usedAttempts = existing?.action_count || 0;
    if (usedAttempts >= 3) {
      setLimitMessage("You've used all 3 registration attempts for this event and can no longer re-register.");
      setActionCount(usedAttempts);
      setRegistering(false);
      return;
    }

    const nextCount = usedAttempts + 1;
    const registrationPayload = {
      user_id: userData.user.id,
      event_id: event.id,
      event_title: event.title,
      event_date: event.date,
      event_category: event.category,
      event_venue: event.venue,
      event_organizer: event.organizer,
      event_banner: event.banner,
      start_time: event.startTime,
      end_time: event.endTime,
      status: "pending",
      action_count: nextCount,
      registered_at: new Date().toISOString(),
    };
    const { error } = existing
      ? await supabase.from("event_registrations").update(registrationPayload).eq("id", existing.id)
      : await supabase.from("event_registrations").insert(registrationPayload);
    // 23505 = a row already exists (a concurrent insert won the race). Treat it
    // as success — the student is registered either way.
    if (!error || error.code === "23505") {
      setRegistered(true);
      setActionCount(nextCount);
      setLimitMessage("");
      await supabase.from("notifications").insert({ user_id: userData.user.id, type: "registration", title: "Registration submitted", body: `Your registration for ${event.title || "this event"} is pending approval.`, related_id: event.id });
    } else {
      setLimitMessage(error.message);
    }
    setRegistering(false);
  };

  const attemptsRemaining = Math.max(0, 3 - actionCount);
  const visual = CATEGORY_VISUALS[event.category] || { icon: Code2, classes: "from-slate-500 via-slate-700 to-slate-950" };
  const VisualIcon = visual.icon;
  const hasImage = typeof event.banner === "string" && /^(https?:|data:image)/i.test(event.banner);

  return (
    <div className="relative min-h-full overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_32%),linear-gradient(145deg,#0b0f1a_0%,#101827_52%,#0d1320_100%)]" />
      <div className="relative mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Browse Events
      </button>

      {/* BANNER */}
      <div className={`relative mt-4 h-56 w-full overflow-hidden rounded-3xl bg-linear-to-br ${visual.classes} p-6 shadow-2xl shadow-black/30 sm:h-72`} style={hasImage ? { backgroundImage: `url(${event.banner})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        {!hasImage && <VisualIcon size={140} className="absolute right-8 top-8 text-white/15" aria-hidden="true" />}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <span className="px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-[11px] font-semibold tracking-wide text-white uppercase">
          {event.category}
        </span>
        <div className="absolute bottom-6 left-6 right-6"><p className="max-w-3xl text-2xl font-bold text-white sm:text-4xl">{event.title}</p><p className="mt-2 max-w-2xl text-sm text-white/75">{event.organizer || "CampusConnect Events"}</p></div>
      </div>

      {limitMessage && <div className="mt-4 rounded-xl bg-orange-500/10 p-3 text-sm text-orange-300">{limitMessage}</div>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-2xl border border-white/10 bg-[#131c2b]/90 p-5 shadow-xl shadow-black/10"><h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-300">About this event</h2><p className="mt-3 text-sm leading-7 text-slate-300">{event.description || "Event details will be shared by the organizer."}</p></section>

      {/* KEY INFO */}
      <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 divide-y divide-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Calendar size={16} className="text-slate-500 shrink-0" />
          <span className="text-sm text-slate-200">
            {formatDate(event.date)}
          </span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Clock size={16} className="text-slate-500 shrink-0" />
          <span className="text-sm text-slate-200">
            {formatTimeRange(event.startTime, event.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <MapPin size={16} className="text-slate-500 shrink-0" />
          <span className="text-sm text-slate-200">{event.venue}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Users size={16} className="text-slate-500 shrink-0" />
          <span className="text-sm text-slate-200">{event.organizer}</span>
        </div>
      </div>
      </div>

      {/* REGISTER */}
      <div className="mt-6">
        {registrationLoading ? (
          <div className="h-12 w-full animate-pulse rounded-xl bg-white/10" aria-label="Loading registration status" />
        ) : registered ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30 text-emerald-300 text-sm font-medium">
            <CheckCircle2 size={16} />
            {registrationStatus === "pending" ? "Waiting for approval" : registrationStatus === "accepted" ? "Registration approved" : "You're registered for this event."}
          </div>
        ) : attemptsRemaining === 0 && actionCount > 0 ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 ring-1 ring-inset ring-red-500/30 text-red-300 text-sm font-medium">
            You&apos;ve used all 3 registration attempts for this event.
          </div>
        ) : (
          <>
            <button
              onClick={handleRegister}
              disabled={registering}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {registering ? "Registering..." : actionCount > 0 ? "Re-register for this Event" : "Register for this Event"}
            </button>
            {actionCount > 0 && (
              <p className="mt-2 text-xs text-slate-400">
                {attemptsRemaining} of 3 attempt{attemptsRemaining === 1 ? "" : "s"} remaining.
              </p>
            )}
          </>
        )}
      </div>

      {showProfileMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowProfileMessage(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#0d1220] p-6 ring-1 ring-inset ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white">Complete your profile to register</h2>
            <p className="mt-2 text-sm text-slate-400">
              Your profile is {overallCompletion}% complete. Your profile must be at least 90% complete before you can register for an event.
            </p>
            {registrationBlockReason?.message && (
              <p className="mt-2 text-sm text-orange-300">{registrationBlockReason.message}</p>
            )}
            <button
              type="button"
              onClick={() => setShowProfileMessage(false)}
              className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
