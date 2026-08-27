import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useTimedMessage } from "./ui/useTimedMessage";

import {
  Bell,
  CalendarDays,
  ClipboardList,
  ChevronRight,
  Trophy,
  Bot,
  Search,
} from "lucide-react";

import FestCountdown from "./festTime/Festcountdown";

/* =========================================================
   STAT CARDS
========================================================= */

const statCards = [
  {
    label: "REGISTERED",
    value: 0,
    icon: ClipboardList,
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    label: "UPCOMING",
    value: 0,
    icon: CalendarDays,
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
  },
  {
    label: "COMPLETED",
    value: 0,
    icon: ClipboardList,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];

/* =========================================================
   UPCOMING EVENTS
========================================================= */


/* =========================================================
   ANNOUNCEMENTS
========================================================= */


/* =========================================================
   RECOMMENDED
========================================================= */

function DashboardSkeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} />;
}

function DashboardSectionSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-[#131a2b] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <DashboardSkeleton className="h-11 w-11 shrink-0" />
          <div className="flex-1 space-y-2">
            <DashboardSkeleton className="h-4 w-3/4" />
            <DashboardSkeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

const quickActions = [
  {
    label: "Browse Events",
    icon: Search,
  },
  {
    label: "Schedule",
    icon: CalendarDays,
  },
  {
    label: "AI Help",
    icon: Bot,
  },
  {
    label: "Results",
    icon: Trophy,
  },
];

/* =========================================================
   DASHBOARD COMPONENT
========================================================= */

const CampusConnectDashboard = ({ userName, onNavigate, onOpenEvent }) => {
  const [dashboardEvents, setDashboardEvents] = useState([]);
  const [dashboardAnnouncements, setDashboardAnnouncements] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({ registered: 0, upcoming: 0, completed: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const { message: notice, show: showNotice, dismiss: dismissNotice } = useTimedMessage(2500);

  useEffect(() => {
    let active = true;
    const loadSharedContent = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        if (active) setLoading(false);
        return;
      }
      const todayIso = new Date().toISOString().slice(0, 10);
      const [registrations, allRegistrations, eventRows, announcementRows, notificationRows] = await Promise.all([
        supabase
          .from("event_registrations")
          .select("*")
          .eq("user_id", authData.user.id)
          .in("status", ["registered", "accepted", "pending"])
          .gte("event_date", todayIso)
          .order("event_date", { ascending: true })
          .limit(4),
        supabase.from("event_registrations").select("status").eq("user_id", authData.user.id),
        supabase.from("events").select("*").eq("status", "published").gte("date", todayIso).order("date", { ascending: true }).limit(4),
        supabase.from("announcements").select("*").eq("status", "published").order("publish_date", { ascending: false }).limit(3),
        supabase.from("notifications").select("*").eq("user_id", authData.user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      if (!active) return;
      if (!registrations.error) {
        const registeredEvents = registrations.data || [];
        const fallbackEvents = (eventRows.data || []).map((event) => ({
          id: `event-${event.id}`,
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          event_venue: event.venue,
          event_banner: event.banner,
          status: "registered",
        }));
        setDashboardEvents(registeredEvents.length ? registeredEvents : fallbackEvents);
      }
      if (!allRegistrations.error) {
        const rows = allRegistrations.data || [];
        setDashboardStats({
          registered: rows.filter((row) => row.status === "registered" || row.status === "pending" || row.status === "accepted").length,
          upcoming: rows.filter((row) => row.status === "registered" || row.status === "accepted").length,
          completed: rows.filter((row) => row.status === "completed").length,
        });
      }
      if (!announcementRows.error) setDashboardAnnouncements(announcementRows.data || []);
      if (!notificationRows.error) setNotifications(notificationRows.data || []);
      setLoading(false);
    };
    loadSharedContent();
    return () => { active = false; };
  }, []);
  const greeting = new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());
  const greetingHour = Number(greeting);
  const greetingText = greetingHour < 12 ? "Good Morning" : greetingHour < 17 ? "Good Afternoon" : greetingHour < 21 ? "Good Evening" : "Good Night";
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        {/* Greeting */}
        <div className="flex items-center gap-3">

          <div>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              {greetingText} <span>👋</span>
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {userName || "CampusConnect User"}
            </h1>
          </div>

        </div>

        {/* Countdown + Notification */}
        <div className="flex items-center gap-3 ml-auto">

          {/* Countdown — now a live, real-time countdown */}
          <FestCountdown />

          {/* Notification */}
          <button
            type="button"
            onClick={() => setShowNotifications((open) => !open)}
            className="relative h-11 w-11 shrink-0 rounded-full bg-[#131a2b] border border-white/10 flex items-center justify-center hover:bg-white/5"
            aria-label="Notifications"
          >
            <Bell
              size={18}
              className="text-amber-400"
            />

            {notifications.some((notification) => !notification.read_at) && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500" />}
          </button>

          {showNotifications && <div className="absolute right-4 top-20 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#131a2b] p-4 shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-white">Notifications</h2><button type="button" onClick={() => Promise.all(notifications.filter((n) => !n.read_at).map((n) => supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id))).then(() => setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))))} className="text-xs text-indigo-300">Mark all read</button></div>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">{notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications.</p> : notifications.map((notification) => <button key={notification.id} type="button" onClick={() => { if (!notification.read_at) { supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notification.id); setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)); } }} className={`w-full rounded-xl p-3 text-left ${notification.read_at ? "bg-white/5" : "bg-indigo-500/10"}`}><p className="text-sm font-medium text-white">{notification.title}</p><p className="mt-1 text-xs text-slate-400">{notification.body || "-"}</p></button>)}</div>
          </div>}

        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#131a2b] border border-white/10 rounded-2xl p-5 flex items-center gap-4"
          >

            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <card.icon
                size={22}
                className={card.iconColor}
              />
            </div>

            <div>

              {loading ? <DashboardSkeleton className="h-9 w-12" /> : <p className="text-3xl font-bold text-white leading-none">{card.label === "REGISTERED" ? dashboardStats.registered : card.label === "UPCOMING" ? dashboardStats.upcoming : dashboardStats.completed}</p>}

              <p className="text-xs tracking-wide text-slate-400 mt-1.5">
                {card.label}
              </p>

            </div>

          </div>
        ))}

      </div>

      {/* =====================================================
          UPCOMING EVENTS + ANNOUNCEMENTS
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* UPCOMING EVENTS */}
        <section>

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-lg font-bold text-white">
              My Upcoming Events
            </h2>

            <button
              type="button"
              onClick={() => onNavigate?.("My Registrations")}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all
              <ChevronRight size={14} />
            </button>

          </div>

          {loading ? <DashboardSectionSkeleton /> : dashboardEvents.length === 0 ? (
            <div className="bg-[#131a2b] border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-sm text-slate-400">No upcoming registered events.</p>
              <button
                type="button"
                onClick={() => onNavigate?.("Browse Events")}
                className="mt-3 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                Browse events →
              </button>
            </div>
          ) : <div className="space-y-3">
            {dashboardEvents.map((ev) => {
              const statusStyles = {
                pending: "bg-amber-500/15 text-amber-300",
                accepted: "bg-emerald-500/15 text-emerald-300",
                registered: "bg-indigo-500/15 text-indigo-300",
              };
              const statusLabels = { pending: "Pending", accepted: "Approved", registered: "Registered" };
              const eventDate = ev.event_date
                ? new Date(`${ev.event_date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                : "Date to be announced";
              return (
                <button
                  type="button"
                  key={ev.id}
                  onClick={() => onOpenEvent?.(ev.event_id)}
                  className="w-full text-left bg-[#131a2b] border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-white/20 hover:bg-white/5 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 bg-indigo-500/20">
                    {ev.event_banner || "🎫"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">
                      {ev.event_title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {eventDate}
                      {ev.event_venue ? ` • ${ev.event_venue}` : ""}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyles[ev.status] || "bg-white/10 text-slate-300"}`}
                  >
                    {statusLabels[ev.status] || "Registered"}
                  </span>
                </button>
              );
            })}
          </div>}

        </section>

        {/* ANNOUNCEMENTS */}
        <section>

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-lg font-bold text-white">
              Announcements
            </h2>

            <button
              type="button"
              onClick={() => onNavigate?.("Announcements")}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all
              <ChevronRight size={14} />
            </button>

          </div>

          {loading ? <DashboardSectionSkeleton /> : <div className="space-y-3">
            {dashboardAnnouncements.map((a) => (
              <div
                key={a.id}
                className="bg-[#131a2b] border border-white/10 rounded-2xl p-4 flex gap-3 hover:border-white/20 transition-colors"
              >

                <span
                  className="w-1 rounded-full shrink-0 bg-indigo-500"
                />

                <div className="min-w-0 flex-1">

                  <div className="flex items-center flex-wrap gap-2">

                    <p className="font-semibold text-white">
                      {a.title}
                    </p>

                    {a.tag && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.tagColor}`}
                      >
                        {a.tag}
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-slate-400 mt-1">
                    {a.description}
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    {a.publish_date}
                  </p>

                </div>

              </div>
            ))}
          </div>}

        </section>

      </div>

      {/* QUICK ACTIONS */}
      <div>
        <section>

          <h2 className="text-lg font-bold text-white mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">

            {quickActions.map((qa) => (
              <button
                type="button"
                key={qa.label}
                onClick={() => {
                  if (qa.label === "Browse Events") onNavigate?.("Browse Events");
                  else if (qa.label === "Schedule") onNavigate?.("Schedule");
                  else if (qa.label === "AI Help") showNotice("AI Help is coming soon — stay tuned!");
                  else onNavigate?.("Results");
                }}
                className="bg-[#131a2b] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-white/20 hover:bg-white/5 transition-colors"
              >

                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">

                  <qa.icon
                    size={18}
                    className="text-slate-300"
                  />

                </div>

                <span className="text-sm font-medium text-slate-200">
                  {qa.label}
                </span>

              </button>
            ))}

          </div>

        </section>
      </div>

      {notice && <button type="button" onClick={dismissNotice} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-3 text-sm text-white shadow-xl ring-1 ring-white/10">{notice}</button>}

    </main>
  );
};

export default CampusConnectDashboard;