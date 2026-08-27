// Default shape for a resume's editable data.
// This is intentionally separate from the CampusConnect profile object —
// resumes are a *copy* of profile data that the student can freely edit
// without ever touching their original profile.

export const SECTION_KEYS = {
  personal: "personal",
  summary: "summary",
  education: "education",
  skills: "skills",
  projects: "projects",
  experience: "experience",
  certifications: "certifications",
  achievements: "achievements",
  activities: "activities",
  languages: "languages",
};

export const SECTION_LABELS = {
  [SECTION_KEYS.personal]: "Personal Information",
  [SECTION_KEYS.summary]: "Professional Summary",
  [SECTION_KEYS.education]: "Education",
  [SECTION_KEYS.skills]: "Skills",
  [SECTION_KEYS.projects]: "Projects",
  [SECTION_KEYS.experience]: "Experience / Internships",
  [SECTION_KEYS.certifications]: "Certifications",
  [SECTION_KEYS.achievements]: "Achievements",
  [SECTION_KEYS.activities]: "Workshops / Activities",
  [SECTION_KEYS.languages]: "Languages",
};

export const DEFAULT_SECTION_ORDER = [
  SECTION_KEYS.personal,
  SECTION_KEYS.summary,
  SECTION_KEYS.education,
  SECTION_KEYS.skills,
  SECTION_KEYS.projects,
  SECTION_KEYS.experience,
  SECTION_KEYS.certifications,
  SECTION_KEYS.achievements,
  SECTION_KEYS.activities,
  SECTION_KEYS.languages,
];

export const DEFAULT_VISIBLE_SECTIONS = DEFAULT_SECTION_ORDER.reduce(
  (acc, key) => ({ ...acc, [key]: true }),
  {}
);

let idCounter = 0;
export function makeId(prefix = "item") {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function emptyResumeData() {
  return {
    personal: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    education: [],
    skills: {
      languages: [],
      frameworks: [],
      databases: [],
      tools: [],
      other: [],
    },
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
    activities: [],
    languagesSpoken: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    visibleSections: { ...DEFAULT_VISIBLE_SECTIONS },
  };
}

export function emptyEducation() {
  return {
    id: makeId("edu"),
    institution: "",
    degree: "",
    branch: "",
    startYear: "",
    endYear: "",
    grade: "",
  };
}

export function emptyProject() {
  return {
    id: makeId("proj"),
    name: "",
    description: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
  };
}

export function emptyExperience() {
  return {
    id: makeId("exp"),
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

export function emptyCertification() {
  return {
    id: makeId("cert"),
    name: "",
    organization: "",
    date: "",
    credentialUrl: "",
  };
}

export function emptyAchievement() {
  return { id: makeId("ach"), title: "" };
}

export function emptyActivity() {
  return { id: makeId("act"), title: "", type: "Workshop" };
}

export function emptyLanguage() {
  return { id: makeId("lang"), name: "", proficiency: "Fluent" };
}
