import React from "react";
import { Star } from "lucide-react";
import { MOCK_EVENTS, getFeedbackSummary } from "../../../data/mockFeedback";

/**
 * EventPerformance
 * Drop-in table for the existing Admin Analytics page — registrations,
 * attendance, feedback responses, and average rating per event.
 */
export default function EventPerformance({ events = MOCK_EVENTS }) {
  const rows = events.map((e) => {
    const summary = getFeedbackSummary(e.id);
    return { ...e, feedback: summary.responses, rating: summary.overallAvg };
  });

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Event Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-white/5">
              <th className="py-2.5 pr-4">Event</th>
              <th className="py-2.5 pr-4 text-right">Registrations</th>
              <th className="py-2.5 pr-4 text-right">Attendance</th>
              <th className="py-2.5 pr-4 text-right">Feedback</th>
              <th className="py-2.5 text-right">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="py-3 pr-4 text-white font-medium">{r.title}</td>
                <td className="py-3 pr-4 text-right text-slate-300">{r.registrations}</td>
                <td className="py-3 pr-4 text-right text-slate-300">{r.attendance}</td>
                <td className="py-3 pr-4 text-right text-slate-300">{r.feedback}</td>
                <td className="py-3 text-right">
                  <span className="inline-flex items-center gap-1 font-semibold text-white">
                    {r.rating > 0 ? r.rating.toFixed(1) : "—"}
                    {r.rating > 0 && <Star size={12} className="text-amber-400" fill="currentColor" />}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
