// src/lib/profileCompletion.js
//
// This is the ONLY place completion percentages are calculated. Every screen
// (ProfilePage cards, ProfileCompletionGate, EventRegistrationGuard, wizard
// progress bar) imports from here so the number is always consistent.

import { getEducationFields } from "./educationConfig";

// ---- Section weights (must total 100) --------------------------------------
export const SECTION_WEIGHTS = {
  basic: 15,
  education: 25,
  contact: 10,
  institution: 15,
  skills: 10,
  career: 10,
  achievements: 5,
  portfolio: 5,
  preferences: 5,
};

export const MANDATORY_SECTIONS = ["basic", "education", "contact", "institution"];
export const RECOMMENDED_SECTIONS = ["skills", "career", "preferences"];
export const OPTIONAL_SECTIONS = ["achievements", "portfolio"];

export const SECTION_LABELS = {
  basic: "Basic Information",
  education: "Education & Academic Information",
  contact: "Contact Information",
  institution: "Institution / Campus Information",
  skills: "Skills & Interests",
  career: "Career & Goals",
  achievements: "Achievements",
  portfolio: "Portfolio & Social Links",
  preferences: "Preferences",
};

const isFilled = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
};

// ---- Field lists per section ------------------------------------------------
// Each returns [{ key, required, value }] for the given profile snapshot.
// `education` is dynamic — it reads whichever fields apply to the selected
// education type from educationConfig.js.

function basicFields(p) {
  const b = p.basic || {};
  return [
    { key: "photo", required: false, value: b.photo },
    { key: "fullName", required: true, value: b.fullName },
    { key: "displayName", required: false, value: b.displayName },
    { key: "dob", required: false, value: b.dob },
    { key: "gender", required: false, value: b.gender },
    { key: "email", required: true, value: b.email },
    { key: "phone", required: true, value: b.phone },
    { key: "altPhone", required: false, value: b.altPhone },
    { key: "preferredLanguage", required: false, value: b.preferredLanguage },
  ];
}

function educationFields(p) {
  const e = p.education || {};
  const typeField = { key: "type", required: true, value: e.type };
  if (!e.type) return [typeField];
  const dynamic = getEducationFields(e.type).map((f) => ({
    key: f.key,
    required: f.required,
    value: e.fields?.[f.key],
  }));
  return [typeField, ...dynamic];
}

function contactFields(p) {
  const c = p.contact || {};
  const b = p.basic || {};
  return [
    // Email & phone live on `basic`, but the Contact section is judged on them too.
    { key: "email", required: true, value: b.email },
    { key: "phone", required: true, value: b.phone },
    { key: "collegeEmail", required: false, value: c.collegeEmail },
    { key: "city", required: false, value: c.city },
    { key: "state", required: false, value: c.state },
    { key: "country", required: false, value: c.country },
    { key: "emergencyName", required: false, value: c.emergencyName },
    { key: "emergencyPhone", required: false, value: c.emergencyPhone },
  ];
}

function institutionFields(p) {
  const i = p.institution || {};
  return [
    { key: "name", required: true, value: i.name },
    { key: "campusLocation", required: false, value: i.campusLocation },
    { key: "city", required: false, value: i.city },
    { key: "state", required: false, value: i.state },
    { key: "website", required: false, value: i.website },
    { key: "code", required: false, value: i.code },
  ];
}

function skillsFields(p) {
  const s = p.skills || {};
  return [
    { key: "technical", required: false, value: s.technical },
    { key: "soft", required: false, value: s.soft },
    { key: "languages", required: false, value: s.languages },
    { key: "tools", required: false, value: s.tools },
    { key: "interests", required: false, value: s.interests },
    { key: "hobbies", required: false, value: s.hobbies },
    { key: "certifications", required: false, value: s.certifications },
  ];
}

function careerFields(p) {
  const c = p.career || {};
  return [
    { key: "goal", required: false, value: c.goal },
    { key: "roles", required: false, value: c.roles },
    { key: "industry", required: false, value: c.industry },
    { key: "lookingFor", required: false, value: c.lookingFor },
    { key: "preferredLocation", required: false, value: c.preferredLocation },
  ];
}

function achievementsFields(p) {
  const a = p.achievements || {};
  return [
    { key: "academic", required: false, value: a.academic },
    { key: "hackathons", required: false, value: a.hackathons },
    { key: "competitions", required: false, value: a.competitions },
    { key: "awards", required: false, value: a.awards },
    { key: "projects", required: false, value: a.projects },
    { key: "certifications", required: false, value: a.certifications },
    { key: "leadership", required: false, value: a.leadership },
    { key: "volunteer", required: false, value: a.volunteer },
  ];
}

function portfolioFields(p) {
  const l = p.portfolio || {};
  return [
    { key: "github", required: false, value: l.github },
    { key: "linkedin", required: false, value: l.linkedin },
    { key: "website", required: false, value: l.website },
    { key: "behance", required: false, value: l.behance },
    { key: "leetcode", required: false, value: l.leetcode },
    { key: "codechef", required: false, value: l.codechef },
    { key: "hackerrank", required: false, value: l.hackerrank },
    { key: "other", required: false, value: l.other },
  ];
}

function preferencesFields(p) {
  const pr = p.preferences || {};
  return [
    { key: "eventInterests", required: false, value: pr.eventInterests },
    { key: "notifications", required: false, value: pr.notifications },
  ];
}

const SECTION_FIELD_GETTERS = {
  basic: basicFields,
  education: educationFields,
  contact: contactFields,
  institution: institutionFields,
  skills: skillsFields,
  career: careerFields,
  achievements: achievementsFields,
  portfolio: portfolioFields,
  preferences: preferencesFields,
};

export function getSectionFields(profile, sectionKey) {
  const getter = SECTION_FIELD_GETTERS[sectionKey];
  return getter ? getter(profile || {}) : [];
}

// A section's own percentage: required fields are worth more than optional
// ones (2x), so filling all requireds gets you most of the way there.
export function getSectionStats(profile, sectionKey) {
  const fields = getSectionFields(profile, sectionKey);
  const REQUIRED_WEIGHT = 2;
  const OPTIONAL_WEIGHT = 1;

  let totalWeight = 0;
  let filledWeight = 0;
  let requiredTotal = 0;
  let requiredFilled = 0;

  fields.forEach((f) => {
    const w = f.required ? REQUIRED_WEIGHT : OPTIONAL_WEIGHT;
    totalWeight += w;
    if (f.required) requiredTotal += 1;
    if (isFilled(f.value)) {
      filledWeight += w;
      if (f.required) requiredFilled += 1;
    }
  });

  const percent = totalWeight === 0 ? 0 : Math.round((filledWeight / totalWeight) * 100);
  const requiredComplete = requiredTotal === 0 ? true : requiredFilled === requiredTotal;

  return {
    key: sectionKey,
    label: SECTION_LABELS[sectionKey],
    weight: SECTION_WEIGHTS[sectionKey],
    percent,
    requiredTotal,
    requiredFilled,
    requiredComplete,
    isMandatorySection: MANDATORY_SECTIONS.includes(sectionKey),
  };
}

export function getAllSectionStats(profile) {
  return Object.keys(SECTION_WEIGHTS).map((key) => getSectionStats(profile, key));
}

// Overall weighted completion percentage across all sections.
export function getOverallCompletion(profile) {
  const stats = getAllSectionStats(profile);
  const weighted = stats.reduce((sum, s) => sum + (s.percent / 100) * s.weight, 0);
  return Math.round(weighted);
}

// True only when >= 90% overall AND every mandatory section's required
// fields are filled. Hitting 90% alone is never enough — see spec.
export function isRegistrationReady(profile) {
  const overall = getOverallCompletion(profile);
  if (overall < 90) return false;
  const stats = getAllSectionStats(profile);
  return stats
    .filter((s) => s.isMandatorySection)
    .every((s) => s.requiredComplete);
}

// First mandatory section (in wizard order) that still needs required
// fields — used to deep-link "Complete your profile" CTAs.
export function getFirstIncompleteMandatorySection(profile) {
  const stats = getAllSectionStats(profile);
  const bySection = Object.fromEntries(stats.map((s) => [s.key, s]));
  for (const key of MANDATORY_SECTIONS) {
    if (!bySection[key].requiredComplete) return key;
  }
  return null;
}

export function getRegistrationBlockReason(profile) {
  if (isRegistrationReady(profile)) return null;
  const missingSection = getFirstIncompleteMandatorySection(profile);
  if (missingSection) {
    return {
      reason: "missing-mandatory-fields",
      section: missingSection,
      message: `Complete your profile to register for this event — "${SECTION_LABELS[missingSection]}" still needs required details.`,
    };
  }
  return {
    reason: "below-threshold",
    section: null,
    message: "Complete your profile to register for this event — you're almost there.",
  };
}
