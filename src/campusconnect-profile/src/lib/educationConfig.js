// src/lib/educationConfig.js
//
// Single source of truth for "which academic fields does this student see".
// Add a new education type by adding one entry here — no other file needs
// to change (wizard step, validation, and completion % all read this config).

// ---- Suggestions for common academic values -------------------------------
export const ACADEMIC_SUGGESTIONS = {
  course: ["B.Tech", "B.E", "B.Sc", "B.Com", "B.A", "B.Pharmacy", "M.Tech", "MBA", "MCA", "LLB"],
  branch: ["Computer Science and Engineering", "Information Technology", "Electronics and Communication", "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering", "MPC", "BiPC", "CEC"],
  specialization: ["Artificial Intelligence and Machine Learning", "Data Science", "Finance", "Marketing", "Criminal Law"],
  section: ["A", "B", "C", "D"],
  universityBoard: ["JNTUH", "JNTUK", "JNTUA", "Osmania University", "University of Delhi", "University of Mumbai", "CBSE", "ICSE", "State Board"],
};

// ---- All possible academic field definitions (superset) -------------------
export const EDU_FIELD_META = {
  course: { label: "Course / Program", type: "text", placeholder: "e.g. B.Tech, B.Pharmacy, LLB", suggestions: ACADEMIC_SUGGESTIONS.course },
  branch: { label: "Branch / Stream", type: "text", placeholder: "e.g. CSE, ECE, MPC, BiPC", suggestions: ACADEMIC_SUGGESTIONS.branch },
  specialization: { label: "Specialization", type: "text", placeholder: "e.g. AI & ML, Finance, Criminal Law", suggestions: ACADEMIC_SUGGESTIONS.specialization },
  currentYear: {
    label: "Current Year",
    type: "select",
    options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Final Year"],
  },
  semester: {
    label: "Semester",
    type: "select",
    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
  className: {
    label: "Class",
    type: "select",
    options: ["6", "7", "8", "9", "10", "11", "12"],
  },
  section: { label: "Section", type: "text", placeholder: "e.g. A", suggestions: ACADEMIC_SUGGESTIONS.section },
  rollNumber: { label: "Roll Number", type: "text" },
  registrationNumber: { label: "Registration Number", type: "text" },
  universityBoard: { label: "University / Board", type: "text", placeholder: "e.g. JNTUH, CBSE, State Board", suggestions: ACADEMIC_SUGGESTIONS.universityBoard },
  admissionYear: { label: "Admission Year", type: "text", placeholder: "e.g. 2023" },
  expectedGraduation: { label: "Expected Graduation Year", type: "text", placeholder: "e.g. 2027" },
  cgpaPercentage: { label: "CGPA / Percentage", type: "text", placeholder: "e.g. 8.5 CGPA or 85%" },
};

// ---- Education levels ------------------------------------------------------
// `fields`: [{ key, required }] — order controls render order.
export const EDUCATION_TYPES = [
  {
    value: "school",
    label: "School",
    fields: [
      { key: "className", required: true },
      { key: "section", required: false },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
    ],
  },
  {
    value: "intermediate",
    label: "Intermediate / Junior College",
    fields: [
      { key: "branch", required: true }, // stream e.g. MPC/BiPC/CEC
      { key: "className", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
    ],
  },
  {
    value: "polytechnic",
    label: "Polytechnic / Diploma",
    fields: [
      { key: "branch", required: true },
      { key: "currentYear", required: true },
      { key: "semester", required: false },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "engineering",
    label: "Engineering (B.Tech / B.E)",
    fields: [
      { key: "branch", required: true },
      { key: "currentYear", required: true },
      { key: "semester", required: false },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "registrationNumber", required: false },
      { key: "cgpaPercentage", required: false },
      { key: "expectedGraduation", required: false },
    ],
  },
  {
    value: "degree",
    label: "Degree (B.Sc / B.Com / B.A)",
    fields: [
      { key: "course", required: true },
      { key: "specialization", required: false },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "pharmacy",
    label: "Pharmacy (B.Pharmacy / M.Pharmacy)",
    fields: [
      { key: "course", required: true },
      { key: "currentYear", required: true },
      { key: "semester", required: false },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "medical",
    label: "Medical (MBBS)",
    fields: [
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "registrationNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "dental",
    label: "Dental (BDS)",
    fields: [
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "registrationNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "nursing",
    label: "Nursing",
    fields: [
      { key: "course", required: true },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
    ],
  },
  {
    value: "law",
    label: "Law",
    fields: [
      { key: "course", required: true }, // LLB / BA LLB / BBA LLB
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
    ],
  },
  {
    value: "management",
    label: "Management / Business (MBA & others)",
    fields: [
      { key: "course", required: true },
      { key: "specialization", required: false },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "agriculture",
    label: "Agriculture",
    fields: [
      { key: "course", required: true },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "arts",
    label: "Arts & Humanities",
    fields: [
      { key: "course", required: true },
      { key: "specialization", required: false },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
    ],
  },
  {
    value: "science",
    label: "Science",
    fields: [
      { key: "course", required: true },
      { key: "specialization", required: false },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "commerce",
    label: "Commerce",
    fields: [
      { key: "course", required: true },
      { key: "specialization", required: false },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "education",
    label: "Education (B.Ed & others)",
    fields: [
      { key: "course", required: true },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
    ],
  },
  {
    value: "vocational",
    label: "Vocational",
    fields: [
      { key: "course", required: true },
      { key: "currentYear", required: false },
      { key: "universityBoard", required: false },
      { key: "rollNumber", required: false },
    ],
  },
  {
    value: "postgraduate",
    label: "Postgraduate (M.Sc / M.A / M.Com / M.Tech & others)",
    fields: [
      { key: "course", required: true },
      { key: "specialization", required: false },
      { key: "currentYear", required: true },
      { key: "universityBoard", required: true },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
  {
    value: "other",
    label: "Other",
    fields: [
      { key: "course", required: true },
      { key: "currentYear", required: false },
      { key: "universityBoard", required: false },
      { key: "rollNumber", required: false },
      { key: "cgpaPercentage", required: false },
    ],
  },
];

export function getEducationTypeConfig(typeValue) {
  return EDUCATION_TYPES.find((t) => t.value === typeValue) || null;
}

// Fields shown for a given education type, resolved against EDU_FIELD_META.
// Always includes admissionYear + expectedGraduation as optional extras
// (skipped for "school" since they aren't meaningful there).
export function getEducationFields(typeValue) {
  const config = getEducationTypeConfig(typeValue);
  if (!config) return [];

  const fields = config.fields.map((f) => ({ ...f, ...EDU_FIELD_META[f.key], key: f.key }));

  if (typeValue !== "school") {
    const extras = ["admissionYear", "expectedGraduation"].filter(
      (key) => !config.fields.some((f) => f.key === key)
    );
    extras.forEach((key) => fields.push({ key, required: false, ...EDU_FIELD_META[key] }));
  }

  return fields;
}
