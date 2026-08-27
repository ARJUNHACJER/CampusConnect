import React from "react";
import { MapPin, Calendar, AlertCircle } from "lucide-react";
import {
  OPPORTUNITY_TYPE_LABEL,
  OPPORTUNITY_TYPE_COLORS,
  getDerivedStatus,
} from "../../data/mockOpportunities";
import SavedOpportunityButton from "./SavedOpportunityButton";

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

  return (
    <div
      className={`group flex flex-col rounded-2xl bg-white/5 border border-white/10 p-5 transition-all hover:border-indigo-500/30 hover:bg-white/[0.07] ${
        isExpired ? "opacity-60" : ""
      }`}
    >
      {/* Top row: logo + save */}
      <div className="flex items-start justify-between mb-3">
        <div className="h-11 w-11 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-semibold text-white text-sm shrink-0">
          {opportunity.logoInitials}
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
          {opportunity.location} • {opportunity.mode}
        </span>
      </div>

      {/* Skills */}
      {opportunity.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.requiredSkills.slice(0, 3).map((skill) => (
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
            {new Date(opportunity.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <StatusFlag status={derivedStatus} />
        </div>
        <button
          type="button"
          onClick={() => onView(opportunity.id)}
          className="shrink-0 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );
}
