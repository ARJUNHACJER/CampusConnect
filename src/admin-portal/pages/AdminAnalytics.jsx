import React, { useEffect, useState } from "react";
import { CalendarCheck, ClipboardList, Flame, Users, CheckCircle2 } from "lucide-react";
import { StatCard } from "../components/AdminUI";
import { SkeletonStatGrid, Skeleton } from "../../components/ui/Skeleton";
import { supabase } from "../../supabaseClient";

/**
 * AdminAnalytics.jsx
 * -----------------------------------------------------------------------
 * Every number on this page is derived from the live database — nothing is
 * hardcoded or mocked. Bars are plain divs + Tailwind widths so we don't
 * pull in a chart library.
 *
 * Data notes:
 *   - `event_registrations` has NO department column, so department
 *     participation is derived by joining each registration's event_id to
 *     the events table's `department`.
 *   - Registration status vocabulary in this project:
 *       pending → awaiting admin action (student just registered)
 *       accepted → approved by admin
 *       rejected → declined by admin
 *       attended → marked present
 *       cancelled → withdrawn by the student
 *     "Approved" in the UI == `accepted` rows.
 * -----------------------------------------------------------------------
 */

const EMPTY_METRICS = {
  totalStudents: 0,
  totalEvents: 0,
  totalRegistrations: 0,
  completedEvents: 0,
  statusCounts: { pending: 0, accepted: 0, rejected: 0, attended: 0, cancelled: 0 },
  popularEvents: [],
  deptParticipation: [],
  monthlyParticipation: [],
};

function buildLastSixMonths(now) {
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: d.toLocaleString("en-US", { month: "short" }),
      count: 0,
    });
  }
  return months;
}

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);

      const [studentsRes, eventsRes, registrationsRes] = await Promise.all([
        supabase.from("profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("events").select("id,title,department,date,status"),
        supabase.from("event_registrations").select("event_id,event_date,status,registered_at"),
      ]);

      if (!active) return;

      const firstError = studentsRes.error || eventsRes.error || registrationsRes.error;
      if (firstError) {
        setError(firstError.message || "Could not load analytics.");
        setLoading(false);
        return;
      }

      const events = eventsRes.data || [];
      const registrations = registrationsRes.data || [];
      const eventById = events.reduce((map, event) => {
        map[event.id] = event;
        return map;
      }, {});

      // Cancelled registrations are withdrawals — they shouldn't inflate
      // participation, popularity, or department breakdowns.
      const activeRegs = registrations.filter((r) => r.status !== "cancelled");

      const statusCounts = registrations.reduce(
        (acc, r) => {
          const key = r.status || "pending";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        { pending: 0, accepted: 0, rejected: 0, attended: 0, cancelled: 0 }
      );

      const counts = activeRegs.reduce((map, r) => {
        map[r.event_id] = (map[r.event_id] || 0) + 1;
        return map;
      }, {});

      const departments = activeRegs.reduce((map, r) => {
        const dept = eventById[r.event_id]?.department || eventById[r.event_id]?.category || "Unspecified";
        map[dept] = (map[dept] || 0) + 1;
        return map;
      }, {});

      const months = buildLastSixMonths(now);
      const monthIndex = months.reduce((map, m, i) => {
        map[m.key] = i;
        return map;
      }, {});
      activeRegs.forEach((r) => {
        const stamp = r.registered_at || r.event_date;
        if (!stamp) return;
        const key = String(stamp).slice(0, 7);
        if (key in monthIndex) months[monthIndex[key]].count += 1;
      });

      const completedEvents = events.filter(
        (e) => e.status === "completed" || (e.date && e.date < today)
      ).length;

      setMetrics({
        totalStudents: studentsRes.count || 0,
        totalEvents: events.length,
        totalRegistrations: registrations.length,
        completedEvents,
        statusCounts,
        popularEvents: events
          .map((event) => ({ id: event.id, name: event.title || "Untitled event", registrationCount: counts[event.id] || 0 }))
          .sort((a, b) => b.registrationCount - a.registrationCount)
          .slice(0, 5),
        deptParticipation: Object.entries(departments)
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count),
        monthlyParticipation: months,
      });
      setError("");
      setLoading(false);
    };

    load();
    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <SkeletonStatGrid count={4} />
        <SkeletonStatGrid count={4} />
        <div className="grid lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4 animate-pulse" aria-hidden="true">
              <Skeleton className="h-4 w-40" />
              {[0, 1, 2, 3].map((r) => <Skeleton key={r} className="h-6 w-full" />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm font-semibold text-red-300">Couldn't load analytics</p>
        <p className="text-xs text-red-300/80 mt-1">{error}</p>
      </div>
    );
  }

  const {
    totalStudents,
    totalEvents,
    totalRegistrations,
    completedEvents,
    statusCounts,
    popularEvents,
    deptParticipation,
    monthlyParticipation,
  } = metrics;

  const maxDept = Math.max(...deptParticipation.map((d) => d.count), 1);
  const maxEvent = Math.max(...popularEvents.map((e) => e.registrationCount), 1);
  const maxMonth = Math.max(...monthlyParticipation.map((m) => m.count), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={totalStudents} accent="indigo" />
        <StatCard icon={CalendarCheck} label="Total Events" value={totalEvents} accent="sky" />
        <StatCard icon={ClipboardList} label="Total Registrations" value={totalRegistrations} accent="emerald" />
        <StatCard icon={CheckCircle2} label="Completed Events" value={completedEvents} accent="orange" />
      </div>

      {/* Registration status breakdown — sums to Total Registrations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Pending" value={statusCounts.pending} tone="text-amber-300" />
        <MiniStat label="Approved" value={statusCounts.accepted} tone="text-emerald-300" />
        <MiniStat label="Rejected" value={statusCounts.rejected} tone="text-rose-300" />
        <MiniStat label="Attended" value={statusCounts.attended} tone="text-violet-300" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={15} className="text-orange-400" />
            <h3 className="text-sm font-semibold text-white">Most Popular Events</h3>
          </div>
          {popularEvents.some((e) => e.registrationCount > 0) ? (
            <div className="space-y-3">
              {popularEvents.map((e) => (
                <div key={e.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 truncate pr-2">{e.name}</span>
                    <span className="text-slate-500 shrink-0">{e.registrationCount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-600"
                      style={{ width: `${(e.registrationCount / maxEvent) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No registrations yet.</p>
          )}
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Department Participation</h3>
          {deptParticipation.length ? (
            <div className="space-y-3">
              {deptParticipation.map((d) => (
                <div key={d.department}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 truncate pr-2">{d.department}</span>
                    <span className="text-slate-500 shrink-0">{d.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-orange-400 to-pink-500"
                      style={{ width: `${(d.count / maxDept) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No participation data yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Registrations — Last 6 Months</h3>
        <div className="flex items-end gap-4 h-40">
          {monthlyParticipation.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] text-slate-500">{m.count || ""}</span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-lg bg-linear-to-t from-indigo-500 to-purple-500 min-h-[2px]"
                  style={{ height: `${(m.count / maxMonth) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1.5 ${tone}`}>{value}</p>
    </div>
  );
}
