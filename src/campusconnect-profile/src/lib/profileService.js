// src/lib/profileService.js
//
// Every function here currently returns/updates DUMMY, in-memory data so the
// UI is fully demoable without a live Supabase connection. Each function
// also has the equivalent real Supabase query written as a comment directly
// below it — uncomment + delete the dummy line when you're ready to go live.
// The function signatures are the "contract" the rest of the app relies on,
// so they won't need to change when you swap the implementation.

import { supabase } from "./supabaseClient";
import { EMPTY_PROFILE } from "./profileSchema";

// ---- Fetch the full profile (joins all tables into one object) ------------
export async function fetchProfile(userId) {
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const [education, contact, institution, career, portfolio, preferences, extraSections] = await Promise.all([
    supabase.from("education_records").select("*").eq("user_id", userId).eq("is_current", true).maybeSingle(),
    supabase.from("contact_info").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_institutions").select("campus_location, institutions(*)").eq("user_id", userId).maybeSingle(),
    supabase.from("career_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("social_links").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("profile_sections").select("section_key, data").eq("user_id", userId),
  ]);

  for (const result of [education, contact, institution, career, portfolio, preferences, extraSections]) {
    if (result.error) throw result.error;
  }

  const institutionRow = institution.data;
  const institutionData = institutionRow?.institutions || {};
  const savedSections = Object.fromEntries((extraSections.data || []).map((row) => [row.section_key, row.data]));
  return {
    ...EMPTY_PROFILE,
    userId,
    authProvider: profile.auth_provider,
    basic: { ...EMPTY_PROFILE.basic, photo: profile.photo_url || "", fullName: profile.full_name || "", displayName: profile.display_name || "", dob: profile.dob || "", gender: profile.gender || "", email: profile.email || "", phone: profile.phone || "", altPhone: profile.alt_phone || "", preferredLanguage: profile.preferred_language || "" },
    education: { ...EMPTY_PROFILE.education, type: education.data?.education_type || "", fields: education.data?.fields || {} },
    contact: { ...EMPTY_PROFILE.contact, collegeEmail: contact.data?.college_email || "", city: contact.data?.city || "", state: contact.data?.state || "", country: contact.data?.country || "", emergencyName: contact.data?.emergency_name || "", emergencyPhone: contact.data?.emergency_phone || "" },
    institution: { ...EMPTY_PROFILE.institution, name: institutionData.name || "", type: institutionData.institution_type || "", universityBoard: institutionData.university_board || "", campusLocation: institutionRow?.campus_location || "", city: institutionData.city || "", state: institutionData.state || "", country: institutionData.country || "", website: institutionData.website || "", code: institutionData.code || "" },
    skills: { ...EMPTY_PROFILE.skills, ...(savedSections.skills || {}) },
    career: { ...EMPTY_PROFILE.career, goal: career.data?.goal || savedSections.career?.goal || "", roles: career.data?.roles || savedSections.career?.roles || [], industry: career.data?.industry || savedSections.career?.industry || "", lookingFor: career.data?.looking_for || savedSections.career?.lookingFor || [], preferredLocation: career.data?.preferred_location || savedSections.career?.preferredLocation || "" },
    achievements: { ...EMPTY_PROFILE.achievements, ...(savedSections.achievements || {}) },
    portfolio: { ...EMPTY_PROFILE.portfolio, ...portfolio.data },
    preferences: { ...EMPTY_PROFILE.preferences, eventInterests: preferences.data?.event_interests || [], notifications: preferences.data?.notification_settings || [] },
  };
}

// ---- Called right after first Google/SSO/email signup ----------------------
// Auto-populates whatever the auth provider already gave us (name, email).
export async function createProfileFromAuth({ userId, authProvider, fullName, email }) {
  const { error } = await supabase.from("profiles").insert({ user_id: userId, auth_provider: authProvider, full_name: fullName || "", email: email || "" });
  if (error && error.code !== "23505") throw error;
  return fetchProfile(userId);
}

// ---- Save one section at a time (matches the wizard's "Save & Continue") --
export async function saveProfileSection(userId, sectionKey, sectionData) {
  switch (sectionKey) {
    case "basic": {
      const { error } = await supabase.from("profiles").update({ photo_url: sectionData.photo || null, full_name: sectionData.fullName, display_name: sectionData.displayName || null, dob: sectionData.dob || null, gender: sectionData.gender || null, email: sectionData.email, phone: sectionData.phone, alt_phone: sectionData.altPhone || null, preferred_language: sectionData.preferredLanguage || null, updated_at: new Date().toISOString() }).eq("user_id", userId);
      if (error) throw error;
      break;
    }
    case "education": {
      const { error: deleteError } = await supabase.from("education_records").delete().eq("user_id", userId).eq("is_current", true);
      if (deleteError) throw deleteError;
      const { error: insertError } = await supabase.from("education_records").insert({ user_id: userId, education_type: sectionData.type, fields: sectionData.fields, is_current: true });
      if (insertError) throw insertError;
      break;
    }
    case "institution": {
      const institutionPayload = { name: sectionData.name, institution_type: sectionData.type, university_board: sectionData.universityBoard || null, city: sectionData.city || null, state: sectionData.state || null, country: sectionData.country || null, website: sectionData.website || null, code: sectionData.code || null };
      const institutionQuery = sectionData.code
        ? supabase.from("institutions").upsert(institutionPayload, { onConflict: "code" }).select("id").single()
        : supabase.from("institutions").insert(institutionPayload).select("id").single();
      const { data: institution, error: institutionError } = await institutionQuery;
      if (institutionError) throw institutionError;
      const { error: linkError } = await supabase.from("user_institutions").upsert({ user_id: userId, institution_id: institution.id, campus_location: sectionData.campusLocation || null });
      if (linkError) throw linkError;
      break;
    }
    case "contact": {
      const { error } = await supabase.from("contact_info").upsert({ user_id: userId, college_email: sectionData.collegeEmail || null, city: sectionData.city || null, state: sectionData.state || null, country: sectionData.country || null, emergency_name: sectionData.emergencyName || null, emergency_phone: sectionData.emergencyPhone || null });
      if (error) throw error;
      break;
    }
    case "career": {
      const { error } = await supabase.from("career_profiles").upsert({ user_id: userId, goal: sectionData.goal || null, roles: sectionData.roles, industry: sectionData.industry || null, looking_for: sectionData.lookingFor, preferred_location: sectionData.preferredLocation || null });
      if (error) throw error;
      break;
    }
    case "portfolio": {
      const { error } = await supabase.from("social_links").upsert({ user_id: userId, ...sectionData });
      if (error) throw error;
      break;
    }
    case "preferences": {
      const { error } = await supabase.from("user_preferences").upsert({ user_id: userId, event_interests: sectionData.eventInterests, notification_settings: sectionData.notifications });
      if (error) throw error;
      break;
    }
    default:
      {
        const { error } = await supabase.from("profile_sections").upsert({ user_id: userId, section_key: sectionKey, data: sectionData, updated_at: new Date().toISOString() });
        if (error) throw error;
      }
      break;
  }
  return fetchProfile(userId);

  /*
  // switch (sectionKey) {
  //   case "basic":
  //     await supabase.from("profiles").update({
  //       photo_url: sectionData.photo, full_name: sectionData.fullName,
  //       display_name: sectionData.displayName, dob: sectionData.dob || null,
  //       gender: sectionData.gender, email: sectionData.email, phone: sectionData.phone,
  //       alt_phone: sectionData.altPhone, preferred_language: sectionData.preferredLanguage,
  //       updated_at: new Date().toISOString(),
  //     }).eq("user_id", userId);
  //     break;
  //   case "education":
  //     await supabase.from("education_records").upsert({
  //       user_id: userId, education_type: sectionData.type, fields: sectionData.fields, is_current: true,
  //     }, { onConflict: "user_id" });
  //     break;
  //   case "contact":
  //     await supabase.from("contact_info").upsert({ user_id: userId, ...sectionData });
  //     break;
  //   case "institution":
  //     // upsert into institutions, then link via user_institutions — see supabaseSchema.sql.txt
  //     break;
  //   case "skills":
  //     // upsert skill rows + user_skills join rows
  //     break;
  //   case "career":
  //     await supabase.from("career_profiles").upsert({ user_id: userId, ...sectionData });
  //     break;
  //   case "achievements":
  //     // delete + re-insert rows in `achievements` for this user
  //     break;
  //   case "portfolio":
  //     await supabase.from("social_links").upsert({ user_id: userId, ...sectionData });
  //     break;
  //   case "preferences":
  //     await supabase.from("user_preferences").upsert({
  //       user_id: userId, event_interests: sectionData.eventInterests,
  //       notification_settings: sectionData.notifications,
  //     });
  //     break;
  // }
  // return fetchProfile(userId);
  */
}
