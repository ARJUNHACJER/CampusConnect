// src/context/ProfileContext.jsx
//
// Wrap your authenticated app in <ProfileProvider userId={...} authProvider={...}>.
// Everything downstream (ProfilePage, ProfileCompletionGate, wizard, event
// registration guard) reads from useProfile() instead of fetching separately.

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ProfileContext } from "./ProfileContextValue";
import { fetchProfile, createProfileFromAuth, saveProfileSection } from "../lib/profileService";
import { supabase } from "../lib/supabaseClient";
import { EMPTY_PROFILE } from "../lib/profileSchema";
import {
  getAllSectionStats,
  getOverallCompletion,
  isRegistrationReady,
  getRegistrationBlockReason,
} from "../lib/profileCompletion";


export function ProfileProvider({ userId, authProvider, authName, authEmail, children }) {
  const [profile, setProfile] = useState({ ...EMPTY_PROFILE, userId });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      let data;

      try {
        data = await fetchProfile(userId);
      } catch (error) {
        if (error?.code !== "PGRST303") throw error;

        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          await supabase.auth.signOut();
          return;
        }
        data = await fetchProfile(userId);
      }

      // First-ever login for this user: no profile row yet -> create one
      // and auto-populate whatever the auth provider already told us.
      const isBrandNew = !data;
      if (isBrandNew) {
        data = await createProfileFromAuth({ userId, authProvider, fullName: authName, email: authEmail });
      }

      if (!cancelled) {
        setProfile(data);
        setIsNewUser(isBrandNew);
        setLoading(false);
      }
    })().catch(async (error) => {
      console.error("Profile load failed:", error);
      if (error?.code === "PGRST303") await supabase.auth.signOut();
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId, authProvider, authName, authEmail]);

  const updateSection = useCallback(
    async (sectionKey, sectionData) => {
      setSaving(true);
      setSaveError("");
      // Optimistic update so the wizard feels instant.
      setProfile((prev) => ({ ...prev, [sectionKey]: sectionData }));
      try {
        const saved = await saveProfileSection(userId, sectionKey, sectionData);
        setProfile(saved);
      } catch (error) {
        const message = error?.message || "Could not save this profile section.";
        console.error(`Profile section save failed (${sectionKey}):`, error);
        setSaveError(message);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const sectionStats = useMemo(() => getAllSectionStats(profile), [profile]);
  const overallCompletion = useMemo(() => getOverallCompletion(profile), [profile]);
  const registrationReady = useMemo(() => isRegistrationReady(profile), [profile]);
  const registrationBlockReason = useMemo(() => getRegistrationBlockReason(profile), [profile]);

  const value = {
    profile,
    loading,
    saving,
    saveError,
    isNewUser,
    updateSection,
    sectionStats,
    overallCompletion,
    registrationReady,
    registrationBlockReason,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
