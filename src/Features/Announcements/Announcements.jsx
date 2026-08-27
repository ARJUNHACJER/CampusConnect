import React, { useEffect, useMemo, useState } from "react";

import AnnouncementHeader from "./components/AnnouncementHeader";
import AnnouncementSearch from "./components/AnnouncementSearch";
import AnnouncementFilters from "./components/AnnouncementFilters";
import PinnedAnnouncements from "./components/PinnedAnnouncements";
import AnnouncementCard from "./components/AnnouncementCard";
import AnnouncementDetails from "./components/AnnouncementDetails";
import AnnouncementEmptyState from "./components/AnnouncementEmptyState";
import AnnouncementSkeleton from "./components/AnnouncementSkeleton";
import { supabase } from "../../supabaseClient";

const CATEGORIES = ["All", "Events", "Academic", "Exams", "Placements", "General", "Important"];
const PRIORITIES = ["All", "Normal", "Important", "Urgent"];

/**
 * Route: /updates/announcements
 *
 * Full, searchable, filterable feed of every official CampusConnect
 * announcement. The Dashboard only shows a handful of recent items —
 * this page owns the complete feed, pinned notices, and announcement
 * detail view.
 *
 * `onViewEvent(eventId)` is called when the student opens an announcement
 * linked to an event, and should navigate to /events/:eventId — mirrors
 * the callback pattern already used by Schedule / MyRegistrations.
 */
export default function Announcements({ onViewEvent }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    supabase
      .from("announcements")
      .select("*")
      .eq("status", "published")
      .order("publish_date", { ascending: false })
      .then((data) => {
        if (data.error) throw data.error;
        if (!cancelled) {
          setAnnouncements((data.data || []).map((announcement) => ({
            ...announcement,
            category: announcement.category || "General",
            priority: announcement.priority || "Normal",
            pinned: announcement.priority === "Urgent",
            publisher: "CampusConnect Admin",
            publishedAt: announcement.publish_date || announcement.created_at,
            read: false,
            attachment: announcement.attachment
              ? { name: announcement.attachment, url: announcement.attachment }
              : null,
            relatedEventId: announcement.related_event_id || null,
          })));
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load announcements. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pinned = useMemo(() => announcements.filter((a) => a.pinned), [announcements]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return announcements
      .filter((a) => !a.pinned)
      .filter((a) => (category === "All" ? true : a.category === category))
      .filter((a) => (priority === "All" ? true : a.priority === priority))
      .filter((a) => {
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.publisher.toLowerCase().includes(q)
        );
      });
  }, [announcements, search, category, priority]);

  const hasActiveFilters = search.trim() !== "" || category !== "All" || priority !== "All";

  const handleClearFilters = () => {
    setSearch("");
    setCategory("All");
    setPriority("All");
  };

  const handleReadMore = (announcement) => {
    setSelected(announcement);
    if (!announcement.read) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcement.id ? { ...a, read: true } : a))
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <AnnouncementHeader total={announcements.length} />

      <div className="space-y-4">
        <AnnouncementSearch value={search} onChange={setSearch} />
        <AnnouncementFilters
          category={category}
          onCategoryChange={setCategory}
          priority={priority}
          onPriorityChange={setPriority}
          categories={CATEGORIES}
          priorities={PRIORITIES}
        />
      </div>

      {loading && <AnnouncementSkeleton />}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && announcements.length === 0 && <AnnouncementEmptyState variant="none" />}

      {!loading && !error && announcements.length > 0 && (
        <>
          {!hasActiveFilters && pinned.length > 0 && (
            <PinnedAnnouncements announcements={pinned} onReadMore={handleReadMore} />
          )}

          {filtered.length === 0 ? (
            <AnnouncementEmptyState variant="search" onClearFilters={handleClearFilters} />
          ) : (
            <div className="space-y-4">
              {filtered.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} onReadMore={handleReadMore} />
              ))}
            </div>
          )}
        </>
      )}

      <AnnouncementDetails
        announcement={selected}
        onClose={() => setSelected(null)}
        onViewEvent={(eventId) => {
          setSelected(null);
          onViewEvent?.(eventId);
        }}
      />
    </div>
  );
}
