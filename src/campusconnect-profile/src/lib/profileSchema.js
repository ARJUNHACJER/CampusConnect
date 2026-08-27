// src/lib/profileSchema.js
//
// Shape of the in-app profile object. This mirrors the *separated* DB
// architecture (see src/lib/supabaseSchema.sql.txt) but flattened into one
// object for easy state management on the client. Each top-level key maps
// to its own Supabase table when profileService.js is wired up for real.

export const EMPTY_PROFILE = {
  userId: null,
  authProvider: null, // "google" | "sso" | "email"

  basic: {
    photo: "",
    fullName: "",
    displayName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    altPhone: "",
    preferredLanguage: "",
  },
  education: {
    type: "", // one of EDUCATION_TYPES values
    fields: {}, // dynamic, keyed by educationConfig field keys
  },
  contact: {
    collegeEmail: "",
    city: "",
    state: "",
    country: "",
    emergencyName: "",
    emergencyPhone: "",
  },
  institution: {
    name: "",
    type: "",
    universityBoard: "",
    campusLocation: "",
    city: "",
    state: "",
    country: "",
    website: "",
    code: "",
  },
  skills: {
    technical: [],
    soft: [],
    languages: [],
    tools: [],
    interests: [],
    hobbies: [],
    certifications: [],
  },
  career: {
    goal: "",
    roles: [],
    industry: "",
    lookingFor: [],
    preferredLocation: "",
  },
  achievements: {
    academic: [],
    hackathons: [],
    competitions: [],
    awards: [],
    projects: [],
    certifications: [],
    leadership: [],
    volunteer: [],
  },
  portfolio: {
    github: "",
    linkedin: "",
    website: "",
    behance: "",
    leetcode: "",
    codechef: "",
    hackerrank: "",
    other: "",
  },
  preferences: {
    eventInterests: [],
    notifications: [],
  },
};

// Used only for local development / Storybook-style preview of the UI
// before Supabase is connected. Swap out via profileService.js.
export const DUMMY_NEW_GOOGLE_USER_PROFILE = {
  ...EMPTY_PROFILE,
  userId: "dummy-user-001",
  authProvider: "google",
  basic: {
    ...EMPTY_PROFILE.basic,
    // Auto-populated from the Google account on first login:
    fullName: "Sai Priya Reddy",
    email: "saipriya.reddy@gmail.com",
  },
};

export const DUMMY_PARTIAL_PROFILE = {
  ...EMPTY_PROFILE,
  userId: "dummy-user-002",
  authProvider: "email",
  basic: {
    ...EMPTY_PROFILE.basic,
    fullName: "Arjun Varma",
    email: "arjun.varma@college.edu",
    phone: "9876543210",
    gender: "Male",
  },
  education: {
    type: "engineering",
    fields: {
      branch: "CSE",
      currentYear: "3rd Year",
      universityBoard: "JNTUH",
    },
  },
  institution: {
    ...EMPTY_PROFILE.institution,
    name: "Vasavi College of Engineering",
    type: "Engineering College",
  },
  skills: {
    ...EMPTY_PROFILE.skills,
    technical: ["React", "Python"],
    interests: ["Web Development", "AI/ML"],
  },
};
