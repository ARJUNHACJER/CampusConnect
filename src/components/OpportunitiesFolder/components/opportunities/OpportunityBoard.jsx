import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, Inbox, AlertTriangle } from "lucide-react";
import {
  getDerivedStatus,
  daysUntil,
  MODE_LABEL_TO_DB,
  deriveEligibilityScope,
} from "../../data/opportunityConstants";
import { useOpportunities } from "../../hooks/useOpportunities";
import { useSavedOpportunities } from "../../hooks/useSavedOpportunities";
import OpportunitySearch from "./OpportunitySearch";
import OpportunityFilters, { OpportunityCategoryChips } from "./OpportunityFilters";
import OpportunityCard from "./OpportunityCard";

const DEFAULT_FILTERS = {
  mode: "any",
  deadline: "any",
  eligibility: "all",
  sort: "recommended",
};

// How many cards show before the student opts into the full list. 9 fills the
// 3-column grid with 3 tidy rows on desktop.
const VISIBLE_LIMIT = 9;

/**
 * OpportunityBoard
 * Route: /opportunities
 *
 * Student-facing discovery experience. Reads live data from Supabase
 * via useOpportunities() (see src/hooks/useOpportunities.js) instead
 * of the old mockOpportunities.js.
 *
 * `currentUserId`: pass the logged-in student's id from your auth
 * context (this upload didn't include that file, so it's a plain
 * prop here) — used to load/toggle saved opportunities.
 */
export default function OpportunityBoard({ currentUserId, onViewOpportunity }) {
  const { opportunities, isLoading, error, reload, liveError } = useOpportunities({ includeLive: true });
  const { savedIds, toggleSave } = useSavedOpportunities(currentUserId);

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showAll, setShowAll] = useState(false);

  const handleView = (id) => {
    if (onViewOpportunity) onViewOpportunity(id);
  };

  const filtered = useMemo(() => {
    // Students only see expired items if they explicitly filter for it —
    // there's no "expired" toggle in this UI yet, so we exclude by default.
    let list = opportunities.filter((o) => getDerivedStatus(o) !== "expired");

    if (category === "remote") {
      list = list.filter((o) => o.mode === "remote");
    } else if (category !== "all") {
      list = list.filter((o) => o.type === category);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        [o.title, o.organization, o.description, ...(o.skills || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (filters.mode !== "any") {
      list = list.filter((o) => o.mode === (MODE_LABEL_TO_DB[filters.mode] || filters.mode));
    }

    if (filters.eligibility !== "all") {
      list = list.filter((o) => deriveEligibilityScope(o.eligibility) === filters.eligibility);
    }

    if (filters.deadline !== "any") {
      list = list.filter((o) => {
        const days = daysUntil(o.deadline);
        if (filters.deadline === "closing_soon") return days <= 3 && days >= 0;
        if (filters.deadline === "this_week") return days <= 7 && days >= 0;
        if (filters.deadline === "this_month") return days <= 30 && days >= 0;
        return true;
      });
    }

    const sorted = [...list];
    if (filters.sort === "newest") {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sort === "deadline") {
      sorted.sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));
    }
    // "recommended" — keep the order Supabase returned (by deadline, see the service)

    return sorted;
  }, [opportunities, category, search, filters]);

  // Show a capped preview by default; "View all" reveals the rest. Reset back
  // to the capped view whenever the result set changes so a narrowed search
  // doesn't leave a stale "Show less" state.
  const visible = showAll ? filtered : filtered.slice(0, VISIBLE_LIMIT);
  const hasMore = filtered.length > VISIBLE_LIMIT;

  // Collapse back to the capped preview whenever the active query changes.
  useEffect(() => {
    setShowAll(false);
  }, [category, search, filters]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase size={20} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Explore Opportunities</h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Internships, jobs, hackathons, scholarships, and fellowships for students in
          India — curated by your campus team, plus live listings where available.
        </p>
        <p className="mt-3 text-sm font-semibold text-indigo-300">
          {opportunities.length} Opportunities Available
        </p>
        {liveError && (
          <p className="mt-2 text-xs text-amber-300/90">
            Live listings are temporarily unavailable — showing saved campus opportunities only.
          </p>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 max-w-xl">
        <OpportunitySearch value={search} onChange={setSearch} />
      </div>

      {/* Category chips */}
      <div className="mb-5">
        <OpportunityCategoryChips value={category} onChange={setCategory} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters */}
        <div className="md:w-64 shrink-0">
          <OpportunityFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <LoadingGrid />
          ) : error ? (
            <ErrorState onRetry={reload} />
          ) : filtered.length === 0 ? (
            <EmptyState
              onReset={() => {
                setCategory("all");
                setSearch("");
                setFilters(DEFAULT_FILTERS);
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {visible.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    saved={savedIds.has(opportunity.id)}
                    onToggleSave={() => toggleSave(opportunity)}
                    onView={handleView}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-200 transition-colors"
                  >
                    {showAll ? "Show less" : `View all ${filtered.length} opportunities`}
                  </button>
                  {!showAll && (
                    <p className="text-xs text-slate-500">
                      Showing {VISIBLE_LIMIT} of {filtered.length}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/5 border border-white/10 p-5 h-64 animate-pulse"
        >
          <div className="h-11 w-11 rounded-xl bg-white/10 mb-4" />
          <div className="h-4 w-20 rounded bg-white/10 mb-3" />
          <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
          <div className="h-3 w-1/2 rounded bg-white/10 mb-6" />
          <div className="h-3 w-full rounded bg-white/10 mb-2" />
          <div className="h-3 w-2/3 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl bg-white/5 border border-white/10">
      <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <h3 className="text-white font-semibold mb-1">Unable to load opportunities</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-5">
        Something went wrong reaching the server. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl bg-white/5 border border-white/10">
      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Inbox size={24} className="text-slate-500" />
      </div>
      <h3 className="text-white font-semibold mb-1">No opportunities found</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-5">
        Try changing your filters to see more results.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}
