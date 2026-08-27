import React from "react";
import { MapPin, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import {
  OPPORTUNITY_TYPE_LABEL,
  OPPORTUNITY_TYPE_COLORS,
  MODE_DB_TO_LABEL,
  getDerivedStatus,
} from "../../data/opportunityConstants";
import SavedOpportunityButton from "./SavedOpportunityButton";

/** Supabase rows don't store precomputed logo initials — derive them from the org name. */
function initialsFor(organization) {
  if (!organization || organization === "Not specified") return "?";
  return organization
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function StatusFlag({ status }) {
  if (status === "closing_soon") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400">
        <AlertCircle size={12} /> Closing Soon
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400">
        <AlertCircle size={12} /> Expired
      </span>
    );
  }
  return null;
}

/**
 * OpportunityCard
 * Grid card: 3-up desktop / 2-up tablet / 1-up mobile is controlled
 * by the parent grid's className, not this component.
 */
export default function OpportunityCard({ opportunity, saved, onToggleSave, onView }) {
  const derivedStatus = getDerivedStatus(opportunity);
  const isExpired = derivedStatus === "expired";
  // Live-only rows (fetched straight from the provider, not yet synced into
  // Supabase) carry a synthetic `ext:` id, so there's no DB row to open a
  // details page for — link straight to the source instead.
  const isLiveOnly = typeof opportunity.id === "string" && opportunity.id.startsWith("ext:");

  return (
    <div
      className={`group flex flex-col rounded-2xl bg-white/5 border border-white/10 p-5 transition-all hover:border-indigo-500/30 hover:bg-white/[0.07] ${
        isExpired ? "opacity-60" : ""
      }`}
    >
      {/* Top row: logo + save */}
      <div className="flex items-start justify-between mb-3">
        <div className="h-11 w-11 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-semibold text-white text-sm shrink-0">
          {initialsFor(opportunity.organization)}
        </div>
        <SavedOpportunityButton saved={saved} onToggle={onToggleSave} compact />
      </div>

      {/* Type badge */}
      <span
        className={`self-start mb-2 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
          OPPORTUNITY_TYPE_COLORS[opportunity.type]
        }`}
      >
        {OPPORTUNITY_TYPE_LABEL[opportunity.type]}
      </span>

      {/* Title + org */}
      <h3 className="text-white font-semibold text-base leading-snug mb-1 line-clamp-2">
        {opportunity.title}
      </h3>
      <p className="text-sm text-slate-400 mb-3">{opportunity.organization}</p>

      {/* Description */}
      <p className="text-sm text-slate-400 line-clamp-2 mb-4">{opportunity.description}</p>

      {/* Location / mode */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
        <MapPin size={13} />
        <span>
          {opportunity.location} • {MODE_DB_TO_LABEL[opportunity.mode] || opportunity.mode}
        </span>
      </div>

      {/* Skills */}
      {(opportunity.skills || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 rounded-md bg-white/5 text-[11px] text-slate-300 border border-white/10"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer: deadline + CTA */}
      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
            <Calendar size={12} />
            <span>Deadline</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {opportunity.deadline
              ? new Date(opportunity.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Rolling"}
          </p>
          <StatusFlag status={derivedStatus} />
        </div>
        {isLiveOnly ? (
          <a
            href={isExpired ? undefined : opportunity.apply_url || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={isExpired || !opportunity.apply_url}
            onClick={(e) => (isExpired || !opportunity.apply_url) && e.preventDefault()}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isExpired || !opportunity.apply_url
                ? "bg-white/5 text-slate-500 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-400 text-white"
            }`}
          >
            Apply Now
            <ExternalLink size={14} />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onView(opportunity.id)}
            className="shrink-0 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
