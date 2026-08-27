// src/components/profile/ProfileCompletionGate.jsx
//
// Render this once, right after login/signup, when overallCompletion < 90.
// It does NOT block navigation — "Browse dashboard instead" always works,
// per the requirement that the dashboard stays accessible even with an
// incomplete profile. Only event registration itself is gated (see
// EventRegistrationGuard.jsx).

import React from "react";
import ProgressBar from "./ui/ProgressBar";
import { theme } from "./ui/theme";
import { useProfile } from "../../context/useProfile";
import { getFirstIncompleteMandatorySection, SECTION_LABELS } from "../../lib/profileCompletion";

export default function ProfileCompletionGate({ onCompleteProfile, onBrowseDashboard }) {
  const { profile, sectionStats, overallCompletion } = useProfile();

  const displayName = profile.basic?.fullName || "there";
  const firstIncomplete = getFirstIncompleteMandatorySection(profile);

  return (
    <div className={`${theme.page} flex items-center justify-center p-3 sm:p-6`}>
      <div className={`${theme.card} w-full max-w-2xl p-6 sm:p-10`}>
        <p className="text-sm text-slate-400 mb-1">Welcome, {displayName} 👋</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Let's finish setting up your profile</h1>

        <div className="flex items-end justify-between mb-2">
          <span className="text-sm text-slate-300">Profile Completion</span>
          <span className="text-2xl font-bold text-white">{overallCompletion}%</span>
        </div>
        <ProgressBar percent={overallCompletion} />

        <p className="text-sm text-slate-400 mt-4 mb-8">
          You need at least <strong className="text-white">90%</strong> completion, with all required fields filled in
          Basic Information, Education, Contact and Institution, before you can register for events.
        </p>

        <ul className="space-y-2.5 mb-8">
          {sectionStats.map((s) => (
            <li key={s.key} className="flex items-center gap-2.5 text-sm">
              <span className={s.percent >= 90 && s.requiredComplete ? "text-emerald-400" : "text-slate-600"}>
                {s.percent >= 90 && s.requiredComplete ? "✓" : "○"}
              </span>
              <span className={s.percent >= 90 && s.requiredComplete ? "text-slate-300" : "text-slate-500"}>
                {SECTION_LABELS[s.key]}
              </span>
              {s.isMandatorySection && !s.requiredComplete && (
                <span className="text-xs text-orange-400 ml-auto">Required fields missing</span>
              )}
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => onCompleteProfile?.(firstIncomplete || "basic")}
            className={`${theme.primaryBtn} w-full sm:w-auto`}
          >
            Complete My Profile
          </button>
          <button type="button" onClick={onBrowseDashboard} className={`${theme.ghostBtn} w-full sm:w-auto`}>
            Browse dashboard instead
          </button>
        </div>
      </div>
    </div>
  );
}
