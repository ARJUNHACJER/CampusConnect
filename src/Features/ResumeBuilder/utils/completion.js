// Weighted completion score. Weights sum to 100.
const WEIGHTS = {
  personal: 20,
  summary: 15,
  education: 20,
  skills: 20,
  projects: 25,
};

function hasPersonal(p) {
  return Boolean(p?.fullName && p?.email && (p?.phone || p?.location));
}

function hasSkills(skills) {
  if (!skills) return false;
  return Object.values(skills).some((arr) => Array.isArray(arr) && arr.length > 0);
}

export function calculateCompletion(data) {
  if (!data) return { percentage: 0, suggestions: ["Start by importing your profile."] };

  let score = 0;
  const suggestions = [];

  if (hasPersonal(data.personal)) {
    score += WEIGHTS.personal;
  } else {
    suggestions.push("Complete your personal information (name, email, phone or location).");
  }

  if (data.summary && data.summary.trim().length >= 20) {
    score += WEIGHTS.summary;
  } else {
    suggestions.push("Add a short professional summary (2–4 lines).");
  }

  if (Array.isArray(data.education) && data.education.length > 0) {
    score += WEIGHTS.education;
  } else {
    suggestions.push("Add at least one education entry.");
  }

  if (hasSkills(data.skills)) {
    score += WEIGHTS.skills;
  } else {
    suggestions.push("List a few skills to show your strengths.");
  }

  if (Array.isArray(data.projects) && data.projects.length > 0) {
    score += WEIGHTS.projects;
  } else {
    suggestions.push("Add at least one project to strengthen your resume.");
  }

  return { percentage: Math.round(score), suggestions };
}
