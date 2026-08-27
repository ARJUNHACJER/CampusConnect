// src/components/events/EventRegistrationGuard.jsx
//
// Usage:
//   <EventRegistrationGuard
//     isAuthenticated={!!user}
//     onRegister={() => actuallyRegisterFor(event)}
//     onGoToProfile={(section) => openWizardAt(section)}
//   >
//     {(handleClick) => (
//       <button onClick={handleClick} className="...">Register for Event</button>
//     )}
//   </EventRegistrationGuard>
//
// The dashboard and event browsing stay fully open regardless of profile
// completion — this guard only sits in front of the "Register" action.

import React, { useState } from "react";
import { useProfile } from "../../context/useProfile";
import { theme } from "../profile/ui/theme";

export default function EventRegistrationGuard({ isAuthenticated, onRegister, onGoToProfile, children }) {
  const { registrationReady, registrationBlockReason } = useProfile();
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      // Real app: redirect to login/signup, preserving the intended event.
      setShowBlockedMessage(true);
      return;
    }
    if (!registrationReady) {
      setShowBlockedMessage(true);
      return;
    }
    onRegister?.();
  };

  return (
    <>
      {children(handleClick)}

      {showBlockedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowBlockedMessage(false)}>
          <div className={`${theme.card} w-full max-w-md p-6 sm:p-8`} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Complete your profile to register</h3>
            <p className="text-sm text-slate-400 mb-6">
              {isAuthenticated
                ? registrationBlockReason?.message || "Complete your profile to register for this event."
                : "Please sign in first to register for events."}
            </p>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <button
                  type="button"
                  className={theme.primaryBtn}
                  onClick={() => {
                    setShowBlockedMessage(false);
                    onGoToProfile?.(registrationBlockReason?.section || "basic");
                  }}
                >
                  Complete Profile
                </button>
              )}
              <button type="button" className={theme.secondaryBtn} onClick={() => setShowBlockedMessage(false)}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
