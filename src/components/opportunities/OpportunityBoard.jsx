import React, { useMemo, useState } from "react";
import { Briefcase, Inbox } from "lucide-react";
import {
  MOCK_OPPORTUNITIES,
  MOCK_SAVED_OPPORTUNITY_IDS,
  getDerivedStatus,
  daysUntil,
} from "../../data/mockOpportunities";
import OpportunitySearch from "./OpportunitySearch";
import OpportunityFilters, { OpportunityCategoryChips } from "./OpportunityFilters";
import OpportunityCard from "./OpportunityCard";

const DEFAULT_FILTERS = {
  mode: "any",
  deadline: "any",
  eligibility: "all",
  sort: "recommended",
};

/**
 * OpportunityBoard
 * Route: /opportunities
 *
 * Student-facing discovery experience for internships, hackathons,
 * scholarships, competitions, workshops, and placements.
 *
 * `isLoading` / passing an empty `opportunities` array demonstrates the
 * loading and empty states; wire these to real Supabase query state later.
 */
export default function OpportunityBoard({
  opportunities = MOCK_OPPORTUNITIES,
  isLoading = false,
  onViewOpportunity,
}) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [savedIds, setSavedIds] = useState(new Set(MOCK_SAVED_OPPORTUNITY_IDS));

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleView = (id) => {
    if (onViewOpportunity) onViewOpportunity(id);
  };

  const filtered = useMemo(() => {
    let list = opportunities.filter((o) => o.status === "published" || o.status === "closing_soon");

    // Students only see expired items if they explicitly filter for it —
    // there's no "expired" toggle in this UI yet, so we exclude by default.
    list = list.filter((o) => getDerivedStatus(o) !== "expired");

    if (category !== "all") {
      list = list.filter((o) => o.type === category);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        [o.title, o.organization, o.category, o.description, ...(o.requiredSkills || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (filters.mode !== "any") {
      list = list.filter((o) => o.mode === filters.mode);
    }

    if (filters.eligibility !== "all") {
      list = list.filter((o) => o.eligibilityScope === filters.eligibility);
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
      sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (filters.sort === "deadline") {
      sorted.sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));
    } else if (filters.sort === "popular") {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    // "recommended" — keep original curated order

    return sorted;
  }, [opportunities, category, search, filters]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase size={20} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Explore Opportunities</h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Discover internships, hackathons, scholarships, competitions, workshops, and
          placement opportunities.
        </p>
        <p className="mt-3 text-sm font-semibold text-indigo-300">
          {opportunities.length} Opportunities Available
        </p>
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
          ) : filtered.length === 0 ? (
            <EmptyState onReset={() => {
              setCategory("all");
              setSearch("");
              setFilters(DEFAULT_FILTERS);
            }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  saved={savedIds.has(opportunity.id)}
                  onToggleSave={() => toggleSave(opportunity.id)}
                  onView={handleView}
                />
              ))}
            </div>
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

function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl bg-white/5 border border-white/10">
      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Inbox size={24} className="text-slate-500" />
      </div>
      <h3 className="text-white font-semibold mb-1">No opportunities found</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-5">
        Try adjusting your search or filters to see more results.
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
