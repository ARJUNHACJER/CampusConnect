import React from "react";
import { Star, MessageSquare, Users, TrendingUp, UserCheck } from "lucide-react";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
        <Icon size={16} />
      </div>
      <p className="text-xl font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

/**
 * FeedbackSummary
 * Row of summary cards: overall rating, response count, registered,
 * response rate, attendance.
 */
export default function FeedbackSummary({ summary }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        icon={Star}
        label="Overall Rating"
        value={`${summary.overallAvg.toFixed(1)} / 5`}
        accent="bg-amber-500/15 text-amber-400"
      />
      <StatCard
        icon={MessageSquare}
        label="Feedback Responses"
        value={summary.responses}
        accent="bg-indigo-500/15 text-indigo-400"
      />
      <StatCard
        icon={Users}
        label="Registered"
        value={summary.registrations}
        accent="bg-purple-500/15 text-purple-400"
      />
      <StatCard
        icon={TrendingUp}
        label="Response Rate"
        value={`${summary.responseRate}%`}
        accent="bg-emerald-500/15 text-emerald-400"
      />
      <StatCard
        icon={UserCheck}
        label="Attendance"
        value={summary.attendance}
        accent="bg-sky-500/15 text-sky-400"
      />
    </div>
  );
}
