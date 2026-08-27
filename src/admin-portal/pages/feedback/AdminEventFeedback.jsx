import React, { useState } from "react";
import { Star as StarIcon } from "lucide-react";
import { MOCK_EVENTS, MOCK_EVENT_FEEDBACK, getFeedbackSummary } from "../../../data/mockFeedback";
import FeedbackSummary from "./FeedbackSummary";
import RatingBreakdown from "./RatingBreakdown";
import CategoryRatings from "./CategoryRatings";
import FeedbackList from "./FeedbackList";

/**
 * AdminEventFeedback
 * Route: /admin/events/feedback
 * Nested under the existing Events section of the Admin Portal
 * (Create Event / Manage Events / Registrations / Feedback), not a
 * standalone feedback system.
 */
export default function AdminEventFeedback({ events = MOCK_EVENTS }) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id);

  const summary = getFeedbackSummary(selectedEventId);
  const feedback = MOCK_EVENT_FEEDBACK[selectedEventId] || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <StarIcon size={20} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Event Feedback</h1>
        </div>
        <p className="text-sm text-slate-400">
          Review ratings and comments submitted by students for completed events.
        </p>
      </div>

      {/* Event selector */}
      <div className="mb-6 max-w-sm">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id} className="bg-[#0d1220]">
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {feedback.length === 0 ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center">
          <p className="text-sm text-slate-400">No feedback has been submitted for this event yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <FeedbackSummary summary={summary} />

          <div className="grid lg:grid-cols-2 gap-6">
            <RatingBreakdown distribution={summary.distribution} />
            <CategoryRatings categoryAverages={summary.categoryAverages} />
          </div>

          <FeedbackList feedback={feedback} />
        </div>
      )}
    </div>
  );
}
