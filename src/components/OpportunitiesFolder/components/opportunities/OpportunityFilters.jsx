import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  STUDENT_CATEGORIES,
  WORK_MODES,
  DEADLINE_FILTERS,
  ELIGIBILITY_FILTERS,
  SORT_OPTIONS,
} from "../../data/opportunityConstants";

/** Small reusable pill-select used inside the filter panel */
function PillGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const id = typeof opt === "string" ? opt : opt.id;
          const optLabel = typeof opt === "string" ? opt : opt.label;
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {optLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * OpportunityCategoryChips
 * Horizontal, scrollable on mobile — the top-level type filter.
 */
export function OpportunityCategoryChips({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
      {STUDENT_CATEGORIES.map((type) => {
        const active = value === type.id;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              active
                ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30 shadow-sm"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {type.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * OpportunityFilters
 * Full filter set: mode, location, deadline, eligibility, sort.
 * Renders inline on desktop, and as a slide-up modal on mobile
 * triggered by a "Filters" button.
 */
export default function OpportunityFilters({ filters, onChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (key) => (val) => onChange({ ...filters, [key]: val });

  const activeCount = [
    filters.mode !== "any",
    filters.deadline !== "any",
    filters.eligibility !== "all",
    filters.sort !== "recommended",
  ].filter(Boolean).length;

  const panel = (
    <div className="space-y-5">
      <PillGroup
        label="Mode"
        options={["any", ...WORK_MODES]}
        value={filters.mode}
        onChange={update("mode")}
      />
      <PillGroup
        label="Deadline"
        options={DEADLINE_FILTERS}
        value={filters.deadline}
        onChange={update("deadline")}
      />
      <PillGroup
        label="Eligibility"
        options={ELIGIBILITY_FILTERS}
        value={filters.eligibility}
        onChange={update("eligibility")}
      />
      <PillGroup
        label="Sort by"
        options={SORT_OPTIONS}
        value={filters.sort}
        onChange={update("sort")}
      />
    </div>
  );

  return (
    <>
      {/* Desktop inline panel */}
      <div className="hidden md:block rounded-2xl bg-white/5 border border-white/10 p-5">
        {panel}
      </div>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-slate-200"
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeCount > 0 && (
          <span className="bg-indigo-500 text-white text-[11px] font-semibold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile modal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[#0d1220] border-t border-white/10 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">Filters</h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close filters"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
