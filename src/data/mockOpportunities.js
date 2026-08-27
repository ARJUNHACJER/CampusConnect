/**
 * mockOpportunities.js
 * ------------------------------------------------------------------
 * Local mock data + constants for the Opportunity Board.
 *
 * Table shape mirrors the future Supabase `opportunities` table 1:1
 * so swapping this file for a `supabase.from("opportunities").select()`
 * call later is a drop-in replacement. Keep field names snake_case-safe
 * (camelCase here, but every field maps cleanly to a snake_case column).
 * ------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// TYPE / STATUS ENUMS (mirror future Postgres enums)
// ---------------------------------------------------------------------------

export const OPPORTUNITY_TYPES = [
  { id: "all", label: "All" },
  { id: "internship", label: "Internships" },
  { id: "hackathon", label: "Hackathons" },
  { id: "scholarship", label: "Scholarships" },
  { id: "competition", label: "Competitions" },
  { id: "workshop", label: "Workshops" },
  { id: "placement", label: "Placements" },
];

export const OPPORTUNITY_TYPE_LABEL = OPPORTUNITY_TYPES.reduce((acc, t) => {
  acc[t.id] = t.label.endsWith("s") && t.id !== "all" ? t.label.replace(/s$/, "") : t.label;
  return acc;
}, {});
// Explicit singular overrides for badge display
OPPORTUNITY_TYPE_LABEL.internship = "Internship";
OPPORTUNITY_TYPE_LABEL.hackathon = "Hackathon";
OPPORTUNITY_TYPE_LABEL.scholarship = "Scholarship";
OPPORTUNITY_TYPE_LABEL.competition = "Competition";
OPPORTUNITY_TYPE_LABEL.workshop = "Workshop";
OPPORTUNITY_TYPE_LABEL.placement = "Placement";

export const OPPORTUNITY_TYPE_COLORS = {
  internship: "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/30",
  hackathon: "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/30",
  scholarship: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  competition: "bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-500/30",
  workshop: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/30",
  placement: "bg-pink-500/15 text-pink-300 ring-1 ring-inset ring-pink-500/30",
};

export const WORK_MODES = ["Online", "Offline", "Hybrid"];

export const DEADLINE_FILTERS = [
  { id: "any", label: "Any" },
  { id: "closing_soon", label: "Closing Soon" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
];

export const ELIGIBILITY_FILTERS = [
  { id: "all", label: "All Students" },
  { id: "department", label: "Department-specific" },
  { id: "year", label: "Year-specific" },
];

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "newest", label: "Newest" },
  { id: "deadline", label: "Deadline Soon" },
  { id: "popular", label: "Most Popular" },
];

// Opportunity lifecycle status — students only ever see "published"
export const OPPORTUNITY_STATUSES = ["draft", "published", "closing_soon", "expired", "cancelled"];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntil(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / DAY_MS);
}

/** Derives a display status for a card from its deadline + stored status. */
export function getDerivedStatus(opportunity) {
  if (opportunity.status === "cancelled") return "cancelled";
  const days = daysUntil(opportunity.deadline);
  if (days < 0) return "expired";
  if (days <= 3) return "closing_soon";
  return "published";
}

// ---------------------------------------------------------------------------
// MOCK ROWS — shape matches the future `opportunities` table
// ---------------------------------------------------------------------------

export const MOCK_OPPORTUNITIES = [
  {
    id: "opp_001",
    title: "Frontend Developer Intern",
    type: "internship",
    organization: "Nimbus Technologies",
    logoInitials: "NT",
    description:
      "Work with our product team building customer-facing dashboards in React. Great first internship for students comfortable with modern JS.",
    responsibilities: [
      "Build and maintain React components for the customer dashboard",
      "Collaborate with designers to translate Figma files into UI",
      "Write unit tests for new features",
    ],
    eligibility: "All Students",
    eligibilityScope: "all",
    requiredSkills: ["React", "JavaScript", "HTML/CSS"],
    preferredSkills: ["TypeScript", "Tailwind CSS"],
    duration: "3 months",
    stipend: "₹15,000/month",
    prize: null,
    location: "Remote",
    mode: "Online",
    deadline: "2026-09-15",
    applicationUrl: "https://example.com/careers/nimbus-frontend-intern",
    applicationProcess: "Apply via the company careers page, then complete a short take-home task.",
    contact: "careers@nimbustech.example",
    status: "published",
    publishedAt: "2026-08-10",
    popularity: 312,
    savedCount: 41,
  },
  {
    id: "opp_002",
    title: "Web Development Hackathon 2026",
    type: "hackathon",
    organization: "CampusConnect Dev Guild",
    logoInitials: "CD",
    description:
      "A 24-hour build sprint for teams of up to 4. Build anything that solves a real campus problem. Prizes for top 3 teams.",
    responsibilities: [],
    eligibility: "All Students",
    eligibilityScope: "all",
    requiredSkills: ["Web Development"],
    preferredSkills: ["React", "Node.js", "Design"],
    duration: "24 hours",
    stipend: null,
    prize: "₹50,000 total prize pool",
    location: "Main Auditorium",
    mode: "Offline",
    deadline: "2026-09-02",
    applicationUrl: "https://example.com/events/webdev-hackathon-2026",
    applicationProcess: "Register your team of up to 4 members through the event page.",
    contact: "devguild@campusconnect.example",
    status: "published",
    publishedAt: "2026-08-01",
    popularity: 588,
    savedCount: 120,
  },
  {
    id: "opp_003",
    title: "Merit Scholarship for Engineering Students",
    type: "scholarship",
    organization: "Horizon Education Trust",
    logoInitials: "HE",
    description:
      "Annual scholarship covering up to 50% of tuition for third and fourth-year engineering students with strong academic records.",
    responsibilities: [],
    eligibility: "3rd & 4th Year Students",
    eligibilityScope: "year",
    requiredSkills: [],
    preferredSkills: [],
    duration: "1 academic year",
    stipend: "Up to 50% tuition coverage",
    prize: null,
    location: "N/A",
    mode: "Online",
    deadline: "2026-08-28",
    applicationUrl: "https://example.com/scholarships/horizon-merit",
    applicationProcess: "Submit transcripts and a 300-word essay through the trust's portal.",
    contact: "scholarships@horizonedu.example",
    status: "published",
    publishedAt: "2026-07-20",
    popularity: 204,
    savedCount: 76,
  },
  {
    id: "opp_004",
    title: "National Coding Championship",
    type: "competition",
    organization: "ByteSprint",
    logoInitials: "BS",
    description:
      "A competitive programming contest across three rounds. Top performers get direct interview referrals to partner companies.",
    responsibilities: [],
    eligibility: "All Students",
    eligibilityScope: "all",
    requiredSkills: ["Data Structures", "Algorithms"],
    preferredSkills: ["C++", "Python"],
    duration: "3 rounds over 2 weeks",
    stipend: null,
    prize: "₹1,00,000 + interview referrals",
    location: "Remote",
    mode: "Online",
    deadline: "2026-10-05",
    applicationUrl: "https://example.com/contests/bytesprint-championship",
    applicationProcess: "Create a ByteSprint account and register for the qualifying round.",
    contact: "contests@bytesprint.example",
    status: "published",
    publishedAt: "2026-08-15",
    popularity: 441,
    savedCount: 63,
  },
  {
    id: "opp_005",
    title: "UI/UX Design Workshop",
    type: "workshop",
    organization: "DesignLab Studio",
    logoInitials: "DL",
    description:
      "A hands-on weekend workshop covering design systems, prototyping in Figma, and usability testing basics.",
    responsibilities: [],
    eligibility: "All Students",
    eligibilityScope: "all",
    requiredSkills: [],
    preferredSkills: ["Figma"],
    duration: "2 days",
    stipend: null,
    prize: null,
    location: "Design Block, Room 204",
    mode: "Offline",
    deadline: "2026-08-30",
    applicationUrl: "https://example.com/workshops/designlab-uiux",
    applicationProcess: "Reserve a seat through the event page — limited to 40 students.",
    contact: "hello@designlabstudio.example",
    status: "published",
    publishedAt: "2026-08-05",
    popularity: 158,
    savedCount: 29,
  },
  {
    id: "opp_006",
    title: "Graduate Placement — Software Engineer",
    type: "placement",
    organization: "Orbit Systems",
    logoInitials: "OS",
    description:
      "Full-time placement opportunity for final-year students. Orbit Systems builds infrastructure tooling used by fintech companies.",
    responsibilities: [
      "Join a backend team building distributed systems in Go",
      "Participate in on-call rotation after onboarding",
    ],
    eligibility: "Final Year Students",
    eligibilityScope: "year",
    requiredSkills: ["Data Structures", "Algorithms", "Databases"],
    preferredSkills: ["Go", "Kubernetes"],
    duration: "Full-time",
    stipend: null,
    prize: null,
    location: "Bengaluru, India",
    mode: "Hybrid",
    deadline: "2026-09-20",
    applicationUrl: "https://example.com/careers/orbit-swe-grad",
    applicationProcess: "Apply on the careers page, followed by an online assessment.",
    contact: "campus.hiring@orbitsystems.example",
    status: "published",
    publishedAt: "2026-08-12",
    popularity: 267,
    savedCount: 54,
  },
  {
    id: "opp_007",
    title: "Data Analyst Intern",
    type: "internship",
    organization: "Lighthouse Analytics",
    logoInitials: "LA",
    description:
      "Support the analytics team with dashboarding, SQL queries, and lightweight statistical modeling for internal clients.",
    responsibilities: ["Build SQL queries and dashboards", "Assist with monthly reporting"],
    eligibility: "All Students",
    eligibilityScope: "all",
    requiredSkills: ["SQL", "Excel"],
    preferredSkills: ["Python", "Power BI"],
    duration: "2 months",
    stipend: "₹10,000/month",
    prize: null,
    location: "Remote",
    mode: "Online",
    deadline: "2026-08-27",
    applicationUrl: "https://example.com/careers/lighthouse-data-intern",
    applicationProcess: "Submit resume via the application form on the careers page.",
    contact: "internships@lighthouseanalytics.example",
    status: "published",
    publishedAt: "2026-07-28",
    popularity: 133,
    savedCount: 22,
  },
  {
    id: "opp_008",
    title: "AI Innovation Challenge",
    type: "competition",
    organization: "NeuraSpark Labs",
    logoInitials: "NS",
    description:
      "Build and pitch an AI-powered prototype addressing a social good theme announced on day one.",
    responsibilities: [],
    eligibility: "All Students",
    eligibilityScope: "all",
    requiredSkills: ["Machine Learning"],
    preferredSkills: ["Python", "PyTorch"],
    duration: "48 hours",
    stipend: null,
    prize: "₹75,000 + incubation offer",
    location: "Innovation Center",
    mode: "Offline",
    deadline: "2026-08-26",
    applicationUrl: "https://example.com/events/neuraspark-challenge",
    applicationProcess: "Register as a team of 2-3 through the event page.",
    contact: "events@neuraspark.example",
    status: "published",
    publishedAt: "2026-08-02",
    popularity: 372,
    savedCount: 88,
  },
];

/**
 * MOCK_SAVED_OPPORTUNITY_IDS
 * Placeholder for the future `saved_opportunities` join table
 * (student_id, opportunity_id). Local state in the UI mirrors this shape.
 */
export const MOCK_SAVED_OPPORTUNITY_IDS = ["opp_002", "opp_005"];
