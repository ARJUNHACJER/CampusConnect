import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  Info,
} from "lucide-react";
import {
  MOCK_OPPORTUNITIES,
  MOCK_SAVED_OPPORTUNITY_IDS,
  OPPORTUNITY_TYPE_LABEL,
  OPPORTUNITY_TYPE_COLORS,
  getDerivedStatus,
} from "../../data/mockOpportunities";
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
 * Can be rendered as a full page or inside a modal shell — this
 * component itself only renders the content + its own back control.
 */
export default function OpportunityDetails({
  opportunityId,
  opportunities = MOCK_OPPORTUNITIES,
  onBack,
}) {
  const opportunity = opportunities.find((o) => o.id === opportunityId);
  const [saved, setSaved] = useState(MOCK_SAVED_OPPORTUNITY_IDS.includes(opportunityId));

  if (!opportunity) {
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
            {opportunity.logoInitials}
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
          <SavedOpportunityButton saved={saved} onToggle={() => setSaved((s) => !s)} />
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
          <p className="text-sm text-white font-medium">{opportunity.mode}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Calendar size={13} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Deadline</span>
          </div>
          <p className="text-sm text-white font-medium">
            {new Date(opportunity.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Info size={13} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Duration</span>
          </div>
          <p className="text-sm text-white font-medium">{opportunity.duration || "—"}</p>
        </div>
      </div>

      {/* Description */}
      <Section title="About this opportunity">
        <p className="text-sm text-slate-300 leading-relaxed">{opportunity.description}</p>
      </Section>

      {/* Responsibilities */}
      {opportunity.responsibilities?.length > 0 && (
        <Section title="Responsibilities">
          <ul className="space-y-2">
            {opportunity.responsibilities.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-indigo-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Eligibility + Skills */}
      <Section title="Eligibility & Skills">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <InfoBlock label="Eligibility" value={opportunity.eligibility} />
          <InfoBlock
            label="Stipend / Prize / Package"
            value={opportunity.stipend || opportunity.prize}
          />
        </div>
        {opportunity.requiredSkills.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.requiredSkills.map((s) => (
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
        {opportunity.preferredSkills?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Preferred Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.preferredSkills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 text-xs border border-white/10"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Application process */}
      <Section title="Application Process">
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          {opportunity.applicationProcess}
        </p>
        {opportunity.contact && (
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Mail size={14} />
            {opportunity.contact}
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
          href={isExpired ? undefined : opportunity.applicationUrl}
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
