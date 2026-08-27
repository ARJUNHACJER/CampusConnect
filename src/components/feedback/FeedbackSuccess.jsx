import React from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * FeedbackSuccess
 * Shown after a feedback submission succeeds, or when the student
 * revisits a completed event they've already reviewed.
 */
export default function FeedbackSuccess({ onBack, alreadySubmitted = false }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="h-14 w-14 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
        <CheckCircle2 size={28} className="text-emerald-400" />
      </div>
      <h2 className="text-lg font-bold text-white mb-1">
        {alreadySubmitted ? "Feedback Already Submitted" : "Feedback Submitted"}
      </h2>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        {alreadySubmitted
          ? "Thank you! Your feedback has already been recorded."
          : "Thank you for helping us improve future CampusConnect events."}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
      >
        Back to My Registrations
      </button>
    </div>
  );
}
