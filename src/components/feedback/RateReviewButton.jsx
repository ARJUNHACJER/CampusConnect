import React from "react";
import { Star, CheckCircle2 } from "lucide-react";

/**
 * RateReviewButton
 * Drop into My Registrations → Completed events. Not in the original
 * component list, but needed to trigger EventFeedback per the spec's
 * "Rate & Review" flow — kept here so it's easy to import from
 * MyRegistrations.jsx without duplicating markup.
 */
export default function RateReviewButton({ feedbackSubmitted, onClick }) {
  if (feedbackSubmitted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
        <CheckCircle2 size={13} />
        Feedback Submitted
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors"
    >
      <Star size={13} />
      Rate &amp; Review
    </button>
  );
}
