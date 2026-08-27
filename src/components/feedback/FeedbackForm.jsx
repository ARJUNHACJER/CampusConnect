import React, { useState } from "react";
import { FEEDBACK_CATEGORIES, WOULD_ATTEND_AGAIN_OPTIONS } from "../../data/mockFeedback";
import StarRating from "./StarRating";

const CHAR_LIMIT = 500;

/**
 * FeedbackForm
 * Pure form component — owns its own local field state, calls
 * onSubmit(payload) with a shape matching the future `event_feedback`
 * row. Validation: overall rating (required), everything else optional.
 */
export default function FeedbackForm({ onSubmit, submitting = false }) {
  const [ratings, setRatings] = useState({
    overallRating: 0,
    organizationRating: 0,
    contentRating: 0,
    venueRating: 0,
    coordinationRating: 0,
  });
  const [comment, setComment] = useState("");
  const [likedMost, setLikedMost] = useState("");
  const [couldImprove, setCouldImprove] = useState("");
  const [wouldAttendAgain, setWouldAttendAgain] = useState(null);
  const [error, setError] = useState("");

  const setRating = (key) => (val) => setRatings((r) => ({ ...r, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ratings.overallRating) {
      setError("Please select an overall rating before submitting.");
      return;
    }
    setError("");
    onSubmit({
      ...ratings,
      comment: comment.trim(),
      likedMost: likedMost.trim(),
      couldImprove: couldImprove.trim(),
      wouldAttendAgain,
      submittedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall rating — required, emphasized */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <StarRating
          label="Overall Experience"
          required
          size={32}
          value={ratings.overallRating}
          onChange={setRating("overallRating")}
        />
      </div>

      {/* Category ratings */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Rate the details</h3>
        {FEEDBACK_CATEGORIES.filter((c) => c.id !== "overallRating").map((cat) => (
          <StarRating
            key={cat.id}
            label={cat.label}
            size={20}
            value={ratings[cat.id]}
            onChange={setRating(cat.id)}
          />
        ))}
      </div>

      {/* Written feedback */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <label className="block text-sm font-semibold text-white mb-2">
          Tell us about your experience
        </label>
        <textarea
          rows={4}
          maxLength={CHAR_LIMIT}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what you liked or what could be improved..."
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-colors resize-none"
        />
        <p className="text-xs text-slate-500 mt-1.5 text-right">
          {comment.length}/{CHAR_LIMIT}
        </p>
      </div>

      {/* Optional quick questions */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">A few quick questions (optional)</h3>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">What did you like most?</label>
          <input
            type="text"
            value={likedMost}
            onChange={(e) => setLikedMost(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="e.g. The mentors were very hands-on"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">What could be improved?</label>
          <input
            type="text"
            value={couldImprove}
            onChange={(e) => setCouldImprove(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="e.g. Registration took a while"
          />
        </div>

        <div>
          <p className="text-sm text-slate-300 mb-2">Would you attend similar events again?</p>
          <div className="flex gap-2">
            {WOULD_ATTEND_AGAIN_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setWouldAttendAgain(opt)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  wouldAttendAgain === opt
                    ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        {submitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
