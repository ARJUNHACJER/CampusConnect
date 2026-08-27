import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  X,
  Copy,
  Check,
  ClipboardList,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { supabase } from "../supabaseClient";


import RateReviewButton from "../components/feedback/RateReviewButton"
import EventFeedback from "../components/feedback/EventFeedback";

//Review

/* =========================================================
   STATUS CONFIG
   Single source of truth for how each registration status
   is labeled, colored, and dot-styled across this page.
========================================================= */

const STATUS_CONFIG = {
  pending: {
    label: "Pending Approval",
    dot: "bg-amber-400",
    pill: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30",
  },
  accepted: {
    label: "Accepted",
    dot: "bg-emerald-400",
    pill: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-400",
    pill: "bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-500/30",
  },
  attended: {
    label: "Attended",
    dot: "bg-emerald-400",
    pill: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  },
  registered: {
    label: "Registered",
    dot: "bg-emerald-400",
    pill: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  },
  completed: {
    label: "Completed",
    dot: "bg-sky-400",
    pill: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/30",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    pill: "bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-500/30",
  },
  waitlisted: {
    label: "Waitlisted",
    dot: "bg-orange-400",
    pill: "bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-500/30",
  },
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "registered", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "waitlisted", label: "Waitlisted" },
];

// Each tab maps to the real registration statuses it should show. "Upcoming"
// covers everything still active (a fresh pending re-registration included),
// and "Completed" covers events the student attended.
const TAB_STATUS_MATCH = {
  registered: ["registered", "pending", "accepted"],
  completed: ["completed", "attended"],
  cancelled: ["cancelled"],
  waitlisted: ["waitlisted"],
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(start, end) {
  const fmt = (t) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(start)} \u2013 ${fmt(end)}`;
}

function daysUntil(dateStr, timeStr) {
  const target = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  const diffMs = target - now;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  return { days: Math.max(days, 0), hours: Math.max(hours, 0), diffMs };
}

/* =========================================================
   REGISTRATION SUMMARY (compact stat tiles)
========================================================= */

function RegistrationSummary({ stats }) {
  const tiles = [
    { label: "Total", value: stats.total, unit: "Events", accent: "text-white" },
    { label: "Upcoming", value: stats.upcoming, unit: "Events", accent: "text-emerald-400" },
    { label: "Completed", value: stats.completed, unit: "Events", accent: "text-sky-400" },
    {
      label: "Cancelled",
      value: stats.cancelled,
      unit: stats.cancelled === 1 ? "Event" : "Events",
      accent: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 px-4 py-3"
        >
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            {tile.label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${tile.accent}`}>
            {tile.value}
            <span className="ml-1.5 text-xs font-medium text-slate-500">
              {tile.unit}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   FILTERS (tabs + search)
========================================================= */

function RegistrationFilters({
  activeTab,
  onTabChange,
  query,
  onQueryChange,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5 ring-1 ring-inset ring-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search registrations"
          className="w-full rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-indigo-500/50"
        />
      </div>
    </div>
  );
}

/* =========================================================
   NEXT EVENT HIGHLIGHT
========================================================= */

function NextEventHighlight({ registration, onView }) {
  if (!registration) return null;
  const { event } = registration;
  const { days, hours } = daysUntil(event.date, event.startTime);

  return (
    <div className="rounded-2xl bg-linear-to-br from-indigo-500/15 to-purple-600/10 ring-1 ring-inset ring-indigo-500/30 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-indigo-300 uppercase">
            Your Next Event
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">
            {event.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              {formatTimeRange(event.startTime, event.endTime).split(" \u2013 ")[0]}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              {event.venue}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              Starts in
            </p>
            <p className="text-xl font-bold text-white">
              {String(days).padStart(2, "0")}
              <span className="text-xs font-medium text-slate-400"> Days </span>
              {String(hours).padStart(2, "0")}
              <span className="text-xs font-medium text-slate-400"> Hours</span>
            </p>
          </div>

          <button
            onClick={() => onView(registration)}
            className="shrink-0 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
          >
            View Event
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REGISTRATION CARD
========================================================= */

function RegistrationCard({ registration, onViewDetails, onCancel, actionPending, isScheduled, onAddToSchedule, onRateReview, onOpenCertificates }) {
  const { event, status } = registration;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.registered;
  const isUpcoming = status === "registered" || status === "accepted" || status === "pending";
  const isCompleted = status === "completed" || status === "attended";

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 overflow-hidden flex flex-col hover:ring-white/20 transition-all">
      {/* Banner */}
      <div
        className="h-28 w-full flex items-end p-3"
        style={{ background: event.banner }}
      >
        <span className="px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-[11px] font-semibold tracking-wide text-white uppercase">
          {event.category}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold leading-snug">
            {event.title}
          </h3>
        </div>

        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-slate-400">
          <p className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-500 shrink-0" />
            {formatDate(event.date)}
          </p>
          <p className="flex items-center gap-2">
            <Clock size={14} className="text-slate-500 shrink-0" />
            {formatTimeRange(event.startTime, event.endTime)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-500 shrink-0" />
            {event.venue}
          </p>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Registered on {formatDate(registration.registeredAt)}
        </p>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          <button
            onClick={() => onViewDetails(registration)}
            className="flex-1 min-w-30 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-inset ring-white/10 text-slate-200 text-sm font-medium transition-colors"
          >
            View Details
          </button>

          {isUpcoming && (
            <>
              <button
                onClick={() => onAddToSchedule(registration)}
                disabled={isScheduled || actionPending}
                className="flex-1 min-w-30 px-3 py-2 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 ring-1 ring-inset ring-indigo-500/30 text-indigo-300 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {isScheduled ? "Added to Schedule" : "Add to Schedule"}
              </button>
              <button
                onClick={() => onCancel(registration)}
                disabled={actionPending}
                className="w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
              >
                {actionPending ? "Cancelling..." : "Cancel Registration"}
              </button>
            </>
          )}

          {isCompleted && (
            <>
              <RateReviewButton
                feedbackSubmitted={registration.feedback_submitted}
                onClick={() => onRateReview(registration)}
              />
              <button
                onClick={() => onOpenCertificates?.()}
                className="flex-1 min-w-30 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 ring-1 ring-inset ring-white/10 text-slate-200 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText size={14} /> Certificate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SKELETON CARD (loading state)
========================================================= */

function RegistrationCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 overflow-hidden animate-pulse">
      <div className="h-28 w-full bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/3 rounded bg-white/10" />
        <div className="h-3 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
        <div className="h-8 w-full rounded-lg bg-white/10 mt-2" />
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATES
========================================================= */

function RegistrationEmptyState({ variant, onBrowseEvents, onClearFilters }) {
  if (variant === "no-registrations") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
        <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center mb-4">
          <ClipboardList size={26} className="text-indigo-400" />
        </div>
        <h3 className="text-white font-semibold text-lg">
          No Registrations Yet
        </h3>
        <p className="mt-1.5 text-sm text-slate-400 max-w-sm">
          You haven&apos;t registered for any campus events yet.
        </p>
        <button
          onClick={onBrowseEvents}
          className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
        >
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
      <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
        <Search size={24} className="text-slate-400" />
      </div>
      <h3 className="text-white font-semibold text-lg">No Events Found</h3>
      <p className="mt-1.5 text-sm text-slate-400 max-w-sm">
        Try another filter or search.
      </p>
      <button
        onClick={onClearFilters}
        className="mt-5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}

/* =========================================================
   REGISTRATION DETAILS MODAL
========================================================= */

function RegistrationDetailsModal({ registration, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!registration) return null;
  const { event, status } = registration;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.registered;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registration.registrationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; fail silently.
    }
  };

  const rows = [
    { label: "Event Name", value: event.title },
    { label: "Registration ID", value: registration.registrationCode, copyable: true },
    { label: "Registration Date", value: formatDate(registration.registeredAt) },
    { label: "Event Date", value: formatDate(event.date) },
    { label: "Time", value: formatTimeRange(event.startTime, event.endTime) },
    { label: "Venue", value: event.venue },
    { label: "Organizer", value: event.organizer },
    { label: "Participant", value: "Arjun Kumar (CS2021001)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-[#0d1220] ring-1 ring-inset ring-white/10 sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0d1220]">
          <h3 className="text-white font-semibold">Registration Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>

          <div className="rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 divide-y divide-white/10">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className="text-sm text-white text-right flex items-center gap-2">
                  {row.value}
                  {row.copyable && (
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
                      aria-label="Copy Registration ID"
                    >
                      {copied ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CANCEL CONFIRMATION MODAL
========================================================= */

function CancelConfirmModal({ registration, onKeep, onConfirmCancel }) {
  if (!registration) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onKeep} />
      <div className="relative w-full max-w-sm bg-[#0d1220] ring-1 ring-inset ring-white/10 rounded-2xl p-5">
        <div className="h-11 w-11 rounded-xl bg-red-500/15 flex items-center justify-center mb-3">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-base">
          Cancel Registration?
        </h3>
        <p className="mt-1.5 text-sm text-slate-400">
          Are you sure you want to cancel your registration for{" "}
          <span className="text-slate-300">{registration.event.title}</span>?
        </p>

        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2">
          <button
            onClick={onKeep}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-inset ring-white/10 text-slate-200 text-sm font-medium transition-colors"
          >
            Keep Registration
          </button>
          <button
            onClick={() => onConfirmCancel(registration)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-colors"
          >
            Cancel Registration
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE: MY REGISTRATIONS
========================================================= */

export default function MyRegistrations({ onNavigateToBrowse, onOpenCertificates }) {
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [scheduledIds, setScheduledIds] = useState(new Set());
  useEffect(() => {
    let active = true;
    supabase.from("event_registrations").select("*").order("registered_at", { ascending: false }).then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Could not load registrations:", error);
      setAllRegistrations((data || []).map((registration) => ({
        ...registration,
        registeredAt: registration.registered_at,
        status: registration.status || "registered",
        event: {
          id: registration.event_id,
          title: registration.event_title,
          category: registration.event_category || "General",
          date: registration.event_date,
          startTime: registration.start_time || "00:00",
          endTime: registration.end_time || "00:00",
          venue: registration.event_venue || "",
          organizer: registration.event_organizer || "",
          banner: registration.event_banner || "linear-gradient(135deg, #475569, #1e293b)",
        },
      })));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    supabase.from("schedule_entries").select("event_id").then(({ data }) => setScheduledIds(new Set((data || []).map((row) => row.event_id))));
  }, []);
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  const stats = useMemo(() => {
    const total = allRegistrations.length;
    const upcoming = allRegistrations.filter((r) => TAB_STATUS_MATCH.registered.includes(r.status)).length;
    const completed = allRegistrations.filter((r) => TAB_STATUS_MATCH.completed.includes(r.status)).length;
    const cancelled = allRegistrations.filter((r) => r.status === "cancelled").length;
    return { total, upcoming, completed, cancelled };
  }, [allRegistrations]);

  const nextEvent = useMemo(() => {
    const upcoming = allRegistrations
      .filter((r) => TAB_STATUS_MATCH.registered.includes(r.status))
      .sort(
        (a, b) =>
          new Date(`${a.event.date}T${a.event.startTime}`) -
          new Date(`${b.event.date}T${b.event.startTime}`)
      );
    return upcoming[0] || null;
  }, [allRegistrations]);

  const filtered = useMemo(() => {
    let list = allRegistrations;

    if (activeTab !== "all") {
      const allowed = TAB_STATUS_MATCH[activeTab] || [activeTab];
      list = list.filter((r) => allowed.includes(r.status));
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) =>
        [r.event.title, r.event.category, r.event.organizer, r.event.venue]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [allRegistrations, activeTab, query]);

  const handleClearFilters = () => {
    setActiveTab("all");
    setQuery("");
  };

  const handleConfirmCancel = async (registration) => {
    setActionId(registration.id);
    // Cancelling frees the slot but must NOT consume a registration attempt —
    // the 3-attempt cap counts registration submissions only, not cancellations.
    // (Re-registering later is what increments action_count, over in EventDetails.)
    const { error } = await supabase.from("event_registrations").update({ status: "cancelled" }).eq("id", registration.id);
    if (error) {
      window.alert(error.message);
    } else {
      setAllRegistrations((prev) => prev.map((r) => r.id === registration.id ? { ...r, status: "cancelled" } : r));
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) await supabase.from("notifications").insert({ user_id: userData.user.id, type: "registration_cancelled", title: "Registration cancelled", body: `Your registration for ${registration.event.title || "this event"} was cancelled.`, related_id: registration.event.id });
    }
    setActionId(null);
    setCancelTarget(null);
  };

  const handleAddToSchedule = async (registration) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from("schedule_entries").insert({
      user_id: userData.user.id,
      event_id: registration.event.id,
      event_title: registration.event.title,
      event_date: registration.event.date,
      start_time: registration.event.startTime,
      end_time: registration.event.endTime,
      event_venue: registration.event.venue,
    });
    if (error && error.code !== "23505") window.alert(error.message);
    else setScheduledIds((previous) => new Set([...previous, registration.event.id]));
  };

  const handleSubmitFeedback = async (payload) => {
    const { data: userData } = await supabase.auth.getUser();
    const row = {
      user_id: userData?.user?.id ?? null,
      event_id: payload.eventId,
      registration_id: payload.studentRegistrationId ?? null,
      overall_rating: payload.overallRating,
      organization_rating: payload.organizationRating || null,
      content_rating: payload.contentRating || null,
      venue_rating: payload.venueRating || null,
      coordination_rating: payload.coordinationRating || null,
      comment: payload.comment || null,
      liked_most: payload.likedMost || null,
      could_improve: payload.couldImprove || null,
      would_attend_again: payload.wouldAttendAgain || null,
    };
    const { error } = await supabase.from("event_feedback").insert(row);
    // 23505 = already submitted; treat as success. Other errors (e.g. the
    // table not being created yet) degrade gracefully — we still reflect the
    // submission in the UI so the flow never dead-ends.
    if (error && error.code !== "23505") {
      console.warn("[MyRegistrations] Feedback insert failed:", error.message);
    }
    setAllRegistrations((prev) =>
      prev.map((r) =>
        r.id === payload.studentRegistrationId ? { ...r, feedback_submitted: true } : r
      )
    );
    if (payload.studentRegistrationId) {
      const { error: updateError } = await supabase
        .from("event_registrations")
        .update({ feedback_submitted: true })
        .eq("id", payload.studentRegistrationId);
      if (updateError) {
        console.warn("[MyRegistrations] Could not persist feedback flag:", updateError.message);
      }
    }
  };

  if (feedbackTarget) {
    return (
      <EventFeedback
        eventId={feedbackTarget.event.id}
        registrations={[
          {
            id: feedbackTarget.id,
            eventId: feedbackTarget.event.id,
            eventTitle: feedbackTarget.event.title,
            status: "completed",
            attended: true,
            feedbackSubmitted: !!feedbackTarget.feedback_submitted,
          },
        ]}
        onSubmitFeedback={handleSubmitFeedback}
        onBack={() => setFeedbackTarget(null)}
      />
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">My Registrations</h1>
          <p className="mt-1 text-sm text-slate-400">
            View and manage all the events you&apos;ve registered for.
          </p>
        </div>
        <span className="text-sm text-slate-400 whitespace-nowrap">
          {stats.total} Total Registrations
        </span>
      </div>

      {/* SUMMARY */}
      <div className="mt-6">
        <RegistrationSummary stats={stats} />
      </div>

      {/* NEXT EVENT HIGHLIGHT (only meaningful on Upcoming tab) */}
      {activeTab === "registered" && nextEvent && (
        <div className="mt-6">
          <NextEventHighlight
            registration={nextEvent}
            onView={setDetailsTarget}
          />
        </div>
      )}

      {/* FILTERS */}
      <div className="mt-6">
        <RegistrationFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          query={query}
          onQueryChange={setQuery}
        />
      </div>

      {/* CONTENT */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <RegistrationCardSkeleton key={i} />
            ))}
          </div>
        ) : allRegistrations.length === 0 ? (
          <RegistrationEmptyState
            variant="no-registrations"
            onBrowseEvents={onNavigateToBrowse}
          />
        ) : filtered.length === 0 ? (
          <RegistrationEmptyState
            variant="no-results"
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onViewDetails={setDetailsTarget}
                onCancel={setCancelTarget}
                actionPending={actionId === registration.id}
                isScheduled={scheduledIds.has(registration.event.id)}
                onAddToSchedule={handleAddToSchedule}
                onRateReview={setFeedbackTarget}
                onOpenCertificates={onOpenCertificates}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      <RegistrationDetailsModal
        registration={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />
      <CancelConfirmModal
        registration={cancelTarget}
        onKeep={() => setCancelTarget(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}