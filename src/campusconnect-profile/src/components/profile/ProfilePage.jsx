// src/components/profile/ProfilePage.jsx
import React from "react";
import ProgressBar from "./ui/ProgressBar";
import ProfileSectionCard from "./ProfileSectionCard";
import { theme } from "./ui/theme";
import { useProfile } from "../../context/useProfile";
import { isRegistrationReady } from "../../lib/profileCompletion";

export default function ProfilePage({ onEditSection, onExploreEvents }) {
  const { profile, sectionStats, overallCompletion } = useProfile();
  const ready = isRegistrationReady(profile);

  const basic = profile.basic || {};
  const education = profile.education || {};
  const institution = profile.institution || {};

  return (
    <div className={`${theme.page} p-3 sm:p-6`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header summary */}
        <div className={`${theme.card} p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {basic.fullName ? basic.fullName.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{basic.fullName || "Complete your name"}</h1>
              <p className="text-sm text-slate-400 truncate">
                {education.type ? education.type : "Education not set"}
                {institution.name ? ` · ${institution.name}` : ""}
              </p>
            </div>
            <span
              className={
                "sm:ml-auto self-start rounded-full px-3 py-1.5 text-xs font-semibold " +
                (ready ? "bg-emerald-500/10 text-emerald-300" : "bg-orange-500/10 text-orange-300")
              }
            >
              {ready ? "Profile Ready ✓" : "Complete Profile"}
            </span>
          </div>

          <div className="flex items-end justify-between mb-2">
            <span className="text-sm text-slate-300">Profile Completion</span>
            <span className="text-3xl font-bold text-white">{overallCompletion}%</span>
          </div>
          <ProgressBar percent={overallCompletion} height="h-4" />

          {ready ? (
            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-emerald-200">Your profile is ready! 🎉 You can now register for CampusConnect events.</p>
              <button type="button" onClick={onExploreEvents} className={`${theme.primaryBtn} sm:ml-auto shrink-0`}>
                Explore Events
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400 mt-4">
              Reach 90% with all required sections complete to unlock event registration.
            </p>
          )}
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionStats.map((stats) => (
            <ProfileSectionCard key={stats.key} stats={stats} profile={profile} onEdit={onEditSection} />
          ))}
        </div>
      </div>
    </div>
  );
}
