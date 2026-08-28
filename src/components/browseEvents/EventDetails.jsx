import React, { useState } from "react";
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useProfile } from "../../campusconnect-profile/src/context/useProfile";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Users,
  CheckCircle2,
  Code2,
  Palette,
  Music2,
  Lightbulb,
} from "lucide-react";

/* Importing The Design From website */
function AuroraBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[15%] -top-[20%] h-[55%] w-[55%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute -right-[15%] top-[10%] h-[60%] w-[60%] rounded-full bg-cyan-500/15 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-25%] left-[20%] h-[55%] w-[60%] rounded-full bg-violet-600/15 blur-[130px] animate-pulse" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050816_85%)]" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}


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
      <AuroraBackground>
    <div className="relative min-h-full overflow-hidden px-4 py-6 sm:px-6 lg:px-8 ">
      {/* PAGE BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#050816]" />

        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-indigo-600/20 blur-[120px]" />

        <div className="absolute right-[-12rem] top-[15%] h-[36rem] w-[36rem] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute bottom-[-15rem] left-[25%] h-[32rem] w-[32rem] rounded-full bg-violet-600/10 blur-[130px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.55)_100%)]" />

        <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* BACK */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Browse Events
        </button>

        {/* HERO */}
        <div
          className={`group relative h-64 w-full overflow-hidden rounded-3xl bg-gradient-to-br ${visual.classes} shadow-2xl shadow-black/40 sm:h-80`}
          style={
            hasImage
              ? {
                  backgroundImage: `url(${event.banner})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!hasImage && (
            <>
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <VisualIcon
                size={190}
                strokeWidth={1}
                className="absolute right-8 top-6 text-white/15"
                aria-hidden="true"
              />
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-black/25 to-transparent" />

          <div className="absolute left-6 right-6 top-6">
            <span className="inline-flex rounded-lg bg-black/35 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md ring-1 ring-white/10">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
              {event.title}
            </h1>

            <p className="mt-2 text-sm text-white/70">
              Organized by {event.organizer || "CampusConnect Events"}
            </p>
          </div>
        </div>
        {/*End here */}

        {limitMessage && (
          <div className="mt-4 rounded-2xl bg-orange-500/10 p-4 text-sm text-orange-300 ring-1 ring-inset ring-orange-500/20">
            {limitMessage}
          </div>
        )}

        {/* CONTENT */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">

          {/* ABOUT */}
          <section className="rounded-3xl bg-[#111827]/85 p-6 shadow-xl shadow-black/20 ring-1 ring-inset ring-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/20">
                <Compass size={18} className="text-indigo-300" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                  Event Overview
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-white">
                  About this event
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              {event.description ||
                "Event details will be shared by the organizer."}
            </p>
          </section>

          {/* EVENT INFORMATION */}
          <section className="overflow-hidden rounded-3xl bg-[#111827]/85 shadow-xl shadow-black/20 ring-1 ring-inset ring-white/10 backdrop-blur-xl">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                Event Information
              </p>
            </div>

            <div className="divide-y divide-white/10">

              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Calendar size={16} className="text-indigo-300" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Date
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Clock size={16} className="text-indigo-300" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Time
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">
                    {formatTimeRange(event.startTime, event.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                  <MapPin size={16} className="text-indigo-300" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Venue
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-200">
                    {event.venue || "Venue TBA"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Users size={16} className="text-indigo-300" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Organizer
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">
                    {event.organizer || "CampusConnect"}
                  </p>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* REGISTRATION */}
        <div className="mt-6 rounded-3xl bg-[#111827]/85 p-5 shadow-xl shadow-black/20 ring-1 ring-inset ring-white/10 backdrop-blur-xl">

          {registrationLoading ? (
              <div
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white/5 ring-1 ring-inset ring-white/10"
              aria-label="Loading registration status"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
              <span className="text-sm text-slate-400">
                Checking registration status...
              </span>
            </div>
          ) : registered ? (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3.5 text-sm font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
              <CheckCircle2 size={18} />

              <span>
                {registrationStatus === "pending"
                  ? "Waiting for approval"
                  : registrationStatus === "accepted"
                    ? "Registration approved"
                    : "You're registered for this event."}
              </span>
            </div>
          ) : attemptsRemaining === 0 && actionCount > 0 ? (
            <div className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3.5 text-sm font-medium text-red-300 ring-1 ring-inset ring-red-500/20">
              You&apos;ve used all 3 registration attempts for this event.
            </div>
          ) : (
            <>
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registering
                  ? "Registering..."
                  : actionCount > 0
                    ? "Re-register for this Event"
                    : "Register for this Event"}
              </button>

              {actionCount > 0 && (
                <p className="mt-2 text-center text-xs text-slate-400">
                  {attemptsRemaining} of 3 attempt
                  {attemptsRemaining === 1 ? "" : "s"} remaining.
                </p>
              )}
            </>
          )}
        </div>

        {/* PROFILE MESSAGE */}
        {showProfileMessage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowProfileMessage(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl bg-[#0d1220] p-6 shadow-2xl ring-1 ring-inset ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-white">
                Complete your profile to register
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Your profile is {overallCompletion}% complete. Your profile
                must be at least 90% complete before you can register for an
                event.
              </p>

              {registrationBlockReason?.message && (
                <p className="mt-2 text-sm text-orange-300">
                  {registrationBlockReason.message}
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowProfileMessage(false)}
                className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Got it
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
    </AuroraBackground>
  );
}
