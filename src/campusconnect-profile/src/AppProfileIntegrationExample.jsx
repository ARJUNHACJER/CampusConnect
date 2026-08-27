// src/AppProfileIntegrationExample.jsx
//
// This file is a WIRING EXAMPLE, not a drop-in replacement for your App.jsx.
// It shows how the pieces connect: auth -> ProfileProvider -> completion
// check -> gate screen OR dashboard -> wizard modal -> profile page ->
// event registration guard. Copy the parts you need into your real router.

import React, { useState } from "react";
import { ProfileProvider } from "./context/ProfileContext";
import { useProfile } from "./context/useProfile";
import ProfileCompletionGate from "./components/profile/ProfileCompletionGate";
import ProfileWizard from "./components/profile/wizard/ProfileWizard";
import ProfilePage from "./components/profile/ProfilePage";
import EventRegistrationGuard from "./components/events/EventRegistrationGuard";
import { theme } from "./components/profile/ui/theme";

// Screens this example flips between. Swap for your real router (react-router, etc).
const VIEWS = { DASHBOARD: "dashboard", PROFILE: "profile", WIZARD: "wizard" };

function AppShell({ currentUser }) {
  // `overallCompletion` decides whether the gate shows on first load. Once
  // the user has clicked "Browse dashboard instead" or "Complete My Profile"
  // once, don't force the gate again this session — it should nudge once,
  // not nag on every navigation.
  const { overallCompletion } = useProfile();
  const [dismissedGate, setDismissedGate] = useState(false);
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [wizardStartSection, setWizardStartSection] = useState("basic");

  const openWizard = (section) => {
    setWizardStartSection(section || "basic");
    setView(VIEWS.WIZARD);
  };

  if (overallCompletion < 90 && !dismissedGate && view === VIEWS.DASHBOARD) {
    return (
      <ProfileCompletionGate
        onCompleteProfile={(section) => {
          setDismissedGate(true);
          openWizard(section);
        }}
        onBrowseDashboard={() => setDismissedGate(true)}
      />
    );
  }

  if (view === VIEWS.WIZARD) {
    return (
      <ProfileWizard
        startAtSection={wizardStartSection}
        onFinish={() => setView(VIEWS.PROFILE)}
        onCancel={() => setView(VIEWS.PROFILE)}
      />
    );
  }

  if (view === VIEWS.PROFILE) {
    return <ProfilePage onEditSection={openWizard} onExploreEvents={() => setView(VIEWS.DASHBOARD)} />;
  }

  // ---- Dashboard (illustrative — replace with your real dashboard) --------
  return (
    <div className={`${theme.page} p-6`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <button type="button" onClick={() => setView(VIEWS.PROFILE)} className={theme.secondaryBtn}>
            My Profile
          </button>
        </div>

        {/* Example event card using the registration guard */}
        <div className={`${theme.card} p-6 flex items-center justify-between`}>
          <div>
            <h3 className="text-white font-semibold">Hackfest 2026</h3>
            <p className="text-sm text-slate-400">24-hour hackathon · Aug 30</p>
          </div>
          <EventRegistrationGuard
            isAuthenticated={!!currentUser}
            onRegister={() => alert("Registered! (wire this to your real registration call)")}
            onGoToProfile={(section) => openWizard(section)}
          >
            {(handleClick) => (
              <button type="button" onClick={handleClick} className={theme.primaryBtn}>
                Register for Event
              </button>
            )}
          </EventRegistrationGuard>
        </div>
      </div>
    </div>
  );
}

// ---- Entry point ------------------------------------------------------------
// Replace `currentUser` with whatever your real Supabase auth session gives
// you (from GoogleLogin / College SSO / email signup).
export default function AppProfileIntegrationExample() {
  const currentUser = {
    id: "dummy-user-002", // supabase auth user.id
    authProvider: "email", // "google" | "sso" | "email"
    name: "Arjun Varma", // from Google/SSO profile, or entered at signup
    email: "arjun.varma@college.edu",
  };

  return (
    <ProfileProvider userId={currentUser.id} authProvider={currentUser.authProvider} authName={currentUser.name} authEmail={currentUser.email}>
      <AppShell currentUser={currentUser} />
    </ProfileProvider>
  );
}
