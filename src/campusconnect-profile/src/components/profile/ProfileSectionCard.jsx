// src/components/profile/ProfileSectionCard.jsx
import React from "react";
import ProgressBar from "./ui/ProgressBar";
import { theme } from "./ui/theme";
import { SECTION_LABELS, MANDATORY_SECTIONS, OPTIONAL_SECTIONS } from "../../lib/profileCompletion";

// Short human summary of what's already saved, per section — used on the
// card so the user doesn't have to open the wizard just to check.
function summarize(sectionKey, profile) {
  const s = profile[sectionKey] || {};
  switch (sectionKey) {
    case "basic":
      return s.fullName ? `${s.fullName}${s.phone ? " · " + s.phone : ""}` : "Not added yet";
    case "education":
      return s.type ? `${s.type}${s.fields?.branch ? " · " + s.fields.branch : ""}` : "Not selected yet";
    case "contact":
      return s.city ? `${s.city}${s.state ? ", " + s.state : ""}` : "City & address not added yet";
    case "institution":
      return s.name || "Not added yet";
    case "skills":
      return s.technical?.length ? s.technical.slice(0, 3).join(", ") : "No skills added yet";
    case "career":
      return s.goal || (s.lookingFor?.length ? s.lookingFor.join(", ") : "Not set yet");
    case "achievements": {
      const count = ["academic", "hackathons", "competitions", "awards", "projects", "certifications", "leadership", "volunteer"]
        .reduce((sum, k) => sum + (s[k]?.length || 0), 0);
      return count > 0 ? `${count} item${count > 1 ? "s" : ""} added` : "Nothing added yet";
    }
    case "portfolio": {
      const count = Object.values(s).filter(Boolean).length;
      return count > 0 ? `${count} link${count > 1 ? "s" : ""} added` : "No links added yet";
    }
    case "preferences":
      return s.eventInterests?.length ? s.eventInterests.join(", ") : "Not set yet";
    default:
      return "";
  }
}

export default function ProfileSectionCard({ stats, profile, onEdit }) {
  const isMandatory = MANDATORY_SECTIONS.includes(stats.key);
  const isOptional = OPTIONAL_SECTIONS.includes(stats.key);
  const complete = stats.percent >= 90 && stats.requiredComplete;

  return (
    <div className={`${theme.subCard} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={complete ? "text-emerald-400" : "text-slate-600"}>{complete ? "✓" : "○"}</span>
            <h4 className="text-sm font-semibold text-white">{SECTION_LABELS[stats.key]}</h4>
          </div>
          <span
            className={
              "inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full " +
              (isMandatory
                ? "bg-orange-500/10 text-orange-300"
                : isOptional
                ? "bg-white/5 text-slate-400"
                : "bg-violet-500/10 text-violet-300")
            }
          >
            {isMandatory ? "Required" : isOptional ? "Optional" : "Recommended"}
          </span>
        </div>
        <span className="text-sm font-bold text-slate-300">{stats.percent}%</span>
      </div>

      <ProgressBar percent={stats.percent} height="h-1.5" />

      <p className="text-xs text-slate-400 mt-3 mb-4 line-clamp-2">{summarize(stats.key, profile)}</p>

      <button type="button" onClick={() => onEdit(stats.key)} className="text-xs font-medium text-violet-400 hover:text-violet-300">
        Edit →
      </button>
    </div>
  );
}
