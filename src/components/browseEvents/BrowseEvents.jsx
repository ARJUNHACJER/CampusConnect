import React, { useEffect, useMemo, useState } from "react";
import { Search, Calendar, Clock, MapPin, Compass, Code2, Palette, Music2, Lightbulb } from "lucide-react";

import { supabase } from "../../supabaseClient";

/* =========================================================
   HELPERS
   Kept local (not shared with Features/Myregistrations.jsx or
   Features/Schedule.jsx) since this page only ever formats raw
   event data, never a registration.
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
    if (!t) return "Time TBA";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(start)} \u2013 ${fmt(end)}`;
}

const CATEGORIES = ["All", "Technical", "Design", "Cultural", "Entrepreneurship"];

const CATEGORY_VISUALS = {
  Technical: { icon: Code2, className: "from-cyan-500/80 via-blue-600/80 to-indigo-800/90" },
  Design: { icon: Palette, className: "from-pink-500/80 via-rose-600/80 to-orange-700/90" },
  Cultural: { icon: Music2, className: "from-amber-400/80 via-orange-600/80 to-red-800/90" },
  Entrepreneurship: { icon: Lightbulb, className: "from-emerald-400/80 via-teal-600/80 to-cyan-800/90" },
};

/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({ event, onOpenEvent }) {
  const visual = CATEGORY_VISUALS[event.category] || { icon: Compass, className: "from-slate-500/80 via-slate-700/80 to-slate-900/90" };
  const VisualIcon = visual.icon;
  const hasImage = typeof event.banner === "string" && /^(https?:|data:image)/i.test(event.banner);
  return (
    <button
      onClick={() => onOpenEvent(event)}
      className="text-left rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 overflow-hidden hover:ring-white/20 transition-all flex flex-col"
    >
      <div
        className={`relative h-28 w-full flex items-end p-3 overflow-hidden bg-linear-to-br ${visual.className}`}
        style={hasImage ? { backgroundImage: `url(${event.banner})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {!hasImage && <VisualIcon size={46} className="absolute right-5 top-5 text-white/25" aria-hidden="true" />}
        <div className="absolute inset-0 bg-black/10" />
        <span className="px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-[11px] font-semibold tracking-wide text-white uppercase">
          {event.category}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-semibold leading-snug">
          {event.title}
        </h3>

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

        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="inline-flex px-3 py-2 rounded-lg bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 text-indigo-300 text-sm font-medium">
            View Details
          </span>
        </div>
      </div>
    </button>
  );
}

function EventCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 overflow-hidden animate-pulse">
      <div className="h-28 w-full bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
        <div className="h-3 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
        <div className="h-8 w-full rounded-lg bg-white/10 mt-2" />
      </div>
    </div>
  );
}

/* =========================================================
   PAGE: BROWSE EVENTS
========================================================= */

export default function BrowseEvents({ onOpenEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    supabase.from("events").select("*").eq("status", "published").order("date", { ascending: true }).then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Could not load events:", error);
      setEvents((data || []).map((event) => ({
        ...event,
        startTime: event.startTime || event.start_time || "",
        endTime: event.endTime || event.end_time || "",
      })));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = events;

    if (category !== "All") {
      list = list.filter((e) => e.category === category);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) =>
        [e.title, e.category, e.organizer, e.venue]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, category, query]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Events</h1>
          <p className="mt-1 text-sm text-slate-400">
            Discover what&apos;s happening on campus and register in a click.
          </p>
        </div>
        <span className="text-sm text-slate-400 whitespace-nowrap">
          {events.length} Events Live
        </span>
      </div>

      {/* FILTERS */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5 ring-1 ring-inset ring-white/10"
              }`}
            >
              {cat}
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events"
            className="w-full rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* GRID */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Compass size={24} className="text-slate-400" />
            </div>
            <h3 className="text-white font-semibold text-lg">No Events Found</h3>
            <p className="mt-1.5 text-sm text-slate-400 max-w-sm">
              Events added by the campus team will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onOpenEvent={onOpenEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
