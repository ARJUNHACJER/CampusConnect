import React, { useEffect, useState } from "react";
import { useProfile } from "../../campusconnect-profile/src/context/useProfile";
import { supabase } from "../../supabaseClient";
import ResumeDashboard from "./ResumeDashboard";
import ResumeEditor from "./ResumeEditor";

/**
 * Drop this in as the page rendered for the "Resume Builder" nav item, e.g.
 * inside CampusConnectDashboard.jsx:
 *
 *   {currentPage === "resume-builder" && <ResumeBuilder />}
 *
 * See ../../../resume-builder-integration.md for the full wiring steps.
 */
export default function ResumeBuilder({ onNavigateToProfile }) {
  const { profile } = useProfile();
  const [userId, setUserId] = useState(null);
  const [view, setView] = useState("dashboard"); // "dashboard" | "editor"
  const [activeResume, setActiveResume] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);

  const openNewResume = () => {
    setActiveResume(null);
    setView("editor");
  };

  const openExistingResume = (resume) => {
    setActiveResume(resume);
    setView("editor");
  };

  const backToDashboard = () => {
    setActiveResume(null);
    setView("dashboard");
  };

  if (view === "editor") {
    return (
      <ResumeEditor
        resume={activeResume}
        profile={profile}
        userId={userId}
        onBack={backToDashboard}
        onEditProfile={onNavigateToProfile}
        onSaved={backToDashboard}
      />
    );
  }

  return (
    <ResumeDashboard
      userId={userId}
      onCreateNew={openNewResume}
      onEditResume={openExistingResume}
    />
  );
}
