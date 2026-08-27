/**
 * opportunityConstants.js
 * ------------------------------------------------------------------
 * Type/status enums + small helpers used across the Opportunities
 * module. Extracted from mockOpportunities.js so components don't
 * lose these when the mock data file is retired in favor of Supabase.
 * ------------------------------------------------------------------
 */

export const OPPORTUNITY_TYPES = [
  { id: "all", label: "All" },
  { id: "internship", label: "Internships" },
  { id: "job", label: "Jobs" },
  { id: "hackathon", label: "Hackathons" },
  { id: "scholarship", label: "Scholarships" },
  { id: "fellowship", label: "Fellowships" },
];

// Student-board category chips: the type filters above, plus a "Remote"
// shortcut that filters by work mode (mapped to mode === "remote" in the
// board). Kept separate from OPPORTUNITY_TYPES so admin type <select>s
// don't offer "Remote" as a creatable type.
export const STUDENT_CATEGORIES = [...OPPORTUNITY_TYPES, { id: "remote", label: "Remote" }];

export const OPPORTUNITY_TYPE_LABEL = {
  internship: "Internship",
  job: "Job",
  hackathon: "Hackathon",
  scholarship: "Scholarship",
  fellowship: "Fellowship",
};

export const OPPORTUNITY_TYPE_COLORS = {
  internship: "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/30",
  job: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30",
  hackathon: "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/30",
  scholarship: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  fellowship: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/30",
};

// Display labels shown in the UI (unchanged from the original mock module).
export const WORK_MODES = ["Online", "Offline", "Hybrid"];

// How UI display modes map to the `mode` column values stored in Supabase.
export const MODE_DB_TO_LABEL = {
  remote: "Online",
  onsite: "Offline",
  hybrid: "Hybrid",
};
export const MODE_LABEL_TO_DB = {
  Online: "remote",
  Offline: "onsite",
  Hybrid: "hybrid",
};

export const DEADLINE_FILTERS = [
  { id: "any", label: "Any" },
  { id: "closing_soon", label: "Closing Soon" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
];

export const ELIGIBILITY_FILTERS = [
  { id: "all", label: "All Students" },
  { id: "department", label: "Department-specific" },
  { id: "year", label: "Year-specific" },
];

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "newest", label: "Newest" },
  { id: "deadline", label: "Deadline Soon" },
];

// Admin-facing lifecycle status. Kept as a text column (see
// supabase/migrations/001_opportunities.sql) rather than a Postgres
// enum, since the existing UI already models this as plain strings.
export const OPPORTUNITY_STATUSES = ["draft", "published", "closing_soon", "expired", "cancelled"];

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / DAY_MS);
}

/** Derives a display status for a card from its deadline + stored status. */
export function getDerivedStatus(opportunity) {
  if (opportunity.status === "cancelled") return "cancelled";
  if (!opportunity.deadline) return opportunity.status || "published";
  const days = daysUntil(opportunity.deadline);
  if (days < 0) return "expired";
  if (days <= 3) return "closing_soon";
  return opportunity.status === "draft" ? "draft" : "published";
}

// The `opportunities` table stores eligibility as a single free-text column
// (e.g. "All Students", "3rd & 4th Year", "Open to CSE/ECE") — there is no
// structured `eligibility_scope` column. The student board's Eligibility
// filter (All / Department-specific / Year-specific) therefore derives a
// coarse scope from that text so the filter matches real rows instead of a
// column that doesn't exist.
const ELIGIBILITY_YEAR_HINT = /\b(1st|2nd|3rd|4th|5th|final|freshman|sophomore|junior|senior)\b|year|semester/i;
const ELIGIBILITY_DEPT_HINT = /\b(cse|ece|eee|it|mech|civil|mba|mca|bca|b\.?tech|b\.?e|b\.?sc|b\.?com|b\.?a)\b|branch|department|stream|specialization|major|engineering|science|commerce|arts|management/i;

/** Maps free-text `eligibility` to one of the ELIGIBILITY_FILTERS ids. */
export function deriveEligibilityScope(eligibility) {
  const text = String(eligibility || "").toLowerCase();
  // Empty or explicitly-open listings are open to everyone.
  if (!text || /open to all|all students|all applicants|everyone|\bany\b/.test(text)) {
    return "all";
  }
  // A named branch/department is the narrower academic axis → checked first.
  if (ELIGIBILITY_DEPT_HINT.test(text)) return "department";
  if (ELIGIBILITY_YEAR_HINT.test(text)) return "year";
  return "all";
}
