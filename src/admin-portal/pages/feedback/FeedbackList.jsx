import React, { useMemo, useState } from "react";
import { Star, Search, MessageSquareOff } from "lucide-react";
import {
  FEEDBACK_STAR_FILTERS,
  FEEDBACK_SENTIMENT_FILTERS,
  sentimentForRating,
} from "../../../data/mockFeedback";

/**
 * FeedbackList
 * Anonymized comment list with star filter, sentiment filter, and
 * text search. Student identity is intentionally not shown — only
 * an anonymized id, matching the "anonymous by default" requirement.
 */
export default function FeedbackList({ feedback }) {
  const [starFilter, setStarFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return feedback.filter((f) => {
      if (starFilter !== "all" && String(f.overallRating) !== starFilter) return false;
      if (sentimentFilter !== "all" && sentimentForRating(f.overallRating) !== sentimentFilter) return false;
      if (query.trim() && !f.comment.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [feedback, starFilter, sentimentFilter, query]);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Student Feedback</h3>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search feedback text..."
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FEEDBACK_STAR_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStarFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              starFilter === f.id
                ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="w-px bg-white/10 mx-1" />
        {FEEDBACK_SENTIMENT_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSentimentFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sentimentFilter === f.id
                ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Comments */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10">
          <MessageSquareOff size={22} className="text-slate-600 mb-2" />
          <p className="text-sm text-slate-500">No feedback matches these filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="rounded-xl bg-white/5 border border-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Anonymous student</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-white">
                  {f.overallRating}/5
                  <Star size={12} className="text-amber-400" fill="currentColor" />
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">"{f.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
