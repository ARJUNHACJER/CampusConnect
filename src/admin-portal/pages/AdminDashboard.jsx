import React, { useEffect, useState } from "react";
import { Users, CalendarCheck, CalendarClock, ClipboardList, PlusCircle, Megaphone, ListChecks, Trophy } from "lucide-react";
import { EmptyState, LoadingSkeleton, StatCard } from "../components/AdminUI";
import { supabase } from "../../supabaseClient";

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ students: 0, events: 0, upcoming: 0, registrations: 0 });
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState({ events: [], announcements: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [students, events, upcoming, registrations] = await Promise.all([
        supabase.from("profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published").gte("date", today),
        supabase.from("event_registrations").select("id", { count: "exact", head: true }),
      ]);
      const [recentEvents, recentAnnouncements] = await Promise.all([
        supabase.from("events").select("id,title,date,status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("announcements").select("id,title,status,publish_date").order("publish_date", { ascending: false }).limit(5),
      ]);
      if (!active) return;
      if (recentEvents.error || recentAnnouncements.error) setError(recentEvents.error?.message || recentAnnouncements.error?.message || "Could not load recent activity.");
      else setRecent({ events: recentEvents.data || [], announcements: recentAnnouncements.data || [] });
      setStats({ students: students.count || 0, events: events.count || 0, upcoming: upcoming.count || 0, registrations: registrations.count || 0 });
      setLoading(false);
    };
    load();
    const timer = setInterval(load, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white lg:text-2xl">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">Live data from your CampusConnect database.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={loading ? "..." : stats.students} accent="indigo" />
        <StatCard icon={CalendarCheck} label="Total Events" value={loading ? "..." : stats.events} accent="sky" />
        <StatCard icon={CalendarClock} label="Upcoming Events" value={loading ? "..." : stats.upcoming} accent="orange" />
        <StatCard icon={ClipboardList} label="Registrations" value={loading ? "..." : stats.registrations} accent="emerald" />
      </div>
      <div className="flex flex-wrap gap-3">
        <QuickAction icon={PlusCircle} label="Create Event" onClick={() => onNavigate("events-create")} />
        <QuickAction icon={Megaphone} label="Create Announcement" onClick={() => onNavigate("announcements")} />
        <QuickAction icon={ListChecks} label="View Registrations" onClick={() => onNavigate("registrations")} />
        <QuickAction icon={Trophy} label="Publish Results" onClick={() => onNavigate("results")} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
        {loading ? <LoadingSkeleton rows={3} /> : error ? <p className="text-red-300">{error}</p> : <div className="grid gap-6 lg:grid-cols-2"><div><h3 className="mb-3 font-semibold text-white">Recent Events</h3>{recent.events.length ? recent.events.map((event) => <p key={event.id} className="border-b border-white/5 py-2 text-xs">{event.title} <span className="float-right text-slate-500">{event.date || "-"}</span></p>) : <EmptyState title="No recent events" />}</div><div><h3 className="mb-3 font-semibold text-white">Recent Announcements</h3>{recent.announcements.length ? recent.announcements.map((item) => <p key={item.id} className="border-b border-white/5 py-2 text-xs">{item.title} <span className="float-right text-slate-500">{item.status}</span></p>) : <EmptyState title="No recent announcements" />}</div></div>}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"><Icon size={16} className="text-indigo-400" />{label}</button>;
}
