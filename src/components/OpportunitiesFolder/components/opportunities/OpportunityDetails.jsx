import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  OPPORTUNITY_TYPE_LABEL,
  OPPORTUNITY_TYPE_COLORS,
  MODE_DB_TO_LABEL,
  getDerivedStatus,
} from "../../data/opportunityConstants";
import { getOpportunityById } from "../../services/opportunitiesService";
import { useSavedOpportunities } from "../../hooks/useSavedOpportunities";
import SavedOpportunityButton from "./SavedOpportunityButton";

function InfoBlock({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  );
}

/**
 * OpportunityDetails
 * Route: /opportunities/:opportunityId
 *
 * Fetches the opportunity directly from Supabase by id, so this
 * works whether it's rendered standalone (deep link / page refresh)
 * or from inside OpportunityBoard.
 *
 * `currentUserId`: same assumption as OpportunityBoard — pass the
 * logged-in student's id from your auth context.
 */
export default function OpportunityDetails({ opportunityId, currentUserId, onBack }) {
  const [opportunity, setOpportunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { savedIds, toggleSave } = useSavedOpportunities(currentUserId);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);
    getOpportunityById(opportunityId)
      .then((data) => {
        if (!cancelled) setOpportunity(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20 text-slate-400 text-sm">
        Loading opportunity…
      </div>
    );
  }

  if (notFound || !opportunity) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <p className="text-slate-400 mb-4">This opportunity could not be found.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold"
        >
          Back to Opportunity Board
        </button>
      </div>
    );
  }

  const derivedStatus = getDerivedStatus(opportunity);
  const isExpired = derivedStatus === "expired";
  const saved = savedIds.has(opportunity.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Opportunity Board
      </button>

      {/* Header card */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-semibold text-white text-base shrink-0">
            {(opportunity.organization || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <span
              className={`inline-block mb-2 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                OPPORTUNITY_TYPE_COLORS[opportunity.type]
              }`}
            >
              {OPPORTUNITY_TYPE_LABEL[opportunity.type]}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-1">
              {opportunity.title}
            </h1>
            <p className="text-sm text-slate-400">{opportunity.organization}</p>
          </div>
          <SavedOpportunityButton saved={saved} onToggle={() => toggleSave(opportunity)} />
        </div>

        {derivedStatus === "closing_soon" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs font-medium text-orange-300">
            <Info size={14} /> This opportunity is closing soon.
          </div>
        )}
        {isExpired && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300">
            <Info size={14} /> This opportunity has expired.
          </div>
        )}
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <MapPin size={13} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Location</span>
          </div>
          <p className="text-sm text-white font-medium">{opportunity.location}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Clock size={13} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Mode</span>
          </div>
          <p className="text-sm text-white font-medium">
            {MODE_DB_TO_LABEL[opportunity.mode] || opportunity.mode}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Calendar size={13} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Deadline</span>
          </div>
          <p className="text-sm text-white font-medium">
            {opportunity.deadline
              ? new Date(opportunity.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Rolling"}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Info size={13} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Source</span>
          </div>
          <p className="text-sm text-white font-medium">
            {opportunity.is_external ? opportunity.source : "CampusConnect"}
          </p>
        </div>
      </div>

      {/* Description */}
      <Section title="About this opportunity">
        <p className="text-sm text-slate-300 leading-relaxed">{opportunity.description}</p>
      </Section>

      {/* Eligibility + Skills */}
      <Section title="Eligibility & Skills">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <InfoBlock label="Eligibility" value={opportunity.eligibility} />
          <InfoBlock label="Stipend" value={opportunity.stipend} />
        </div>
        {(opportunity.skills || []).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Apply CTA */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mt-6">
        <p className="text-xs text-slate-400 mb-4">
          Application will open on the external organization's website. CampusConnect does
          not process this application directly.
        </p>
        <a
          href={isExpired ? undefined : opportunity.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={isExpired}
          onClick={(e) => isExpired && e.preventDefault()}
          className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
            isExpired
              ? "bg-white/5 text-slate-500 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-400 text-white"
          }`}
        >
          Apply Now
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}
