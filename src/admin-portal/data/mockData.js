/**
 * mockData.js
 * -----------------------------------------------------------------------
 * Centralized mock data for the CampusConnect Admin Portal.
 *
 * SUPABASE READINESS
 * Every entity below is shaped the way its corresponding Postgres table
 * would be: flat objects with an `id` primary key and foreign keys that
 * point at other entities by id (event.id, registration.event_id,
 * registration.student_id, result.event_id, certificate.event_id, ...).
 *
 * When wiring up Supabase, these arrays can be replaced 1:1 with the
 * result of `supabase.from('<table>').select('*')` calls — no component
 * should need to change its prop shape, only where the data comes from.
 * -----------------------------------------------------------------------
 */

/* ============================= ADMIN USER ============================= */

export const currentAdmin = {
  id: "admin_001",
  name: "Meera Nair",
  email: "meera.nair@campusconnect.edu",
  role: "admin",
  department: "Student Affairs Office",
  organization: "CampusConnect University",
  avatarInitials: "MN",
};

/* =============================== STUDENTS =============================== */

export const departments = [
  "Computer Science",
  "Electronics & Comm.",
  "Mechanical",
  "Civil",
  "Information Technology",
  "Electrical",
  "Biotechnology",
  "Business Administration",
];

export const students = [
  { id: "stu_001", name: "Arjun Kumar", email: "arjun.kumar@campus.edu", collegeId: "CS2021001", department: "Computer Science", year: "3rd Year", registrations: 4, status: "Active" },
  { id: "stu_002", name: "Priya Sharma", email: "priya.sharma@campus.edu", collegeId: "EC2021014", department: "Electronics & Comm.", year: "3rd Year", registrations: 2, status: "Active" },
  { id: "stu_003", name: "Rohit Verma", email: "rohit.verma@campus.edu", collegeId: "ME2022032", department: "Mechanical", year: "2nd Year", registrations: 1, status: "Active" },
  { id: "stu_004", name: "Sneha Reddy", email: "sneha.reddy@campus.edu", collegeId: "CS2020007", department: "Computer Science", year: "4th Year", registrations: 6, status: "Active" },
  { id: "stu_005", name: "Karthik Iyer", email: "karthik.iyer@campus.edu", collegeId: "IT2021019", department: "Information Technology", year: "3rd Year", registrations: 3, status: "Active" },
  { id: "stu_006", name: "Ananya Das", email: "ananya.das@campus.edu", collegeId: "CV2022041", department: "Civil", year: "2nd Year", registrations: 0, status: "Inactive" },
  { id: "stu_007", name: "Vikram Singh", email: "vikram.singh@campus.edu", collegeId: "EE2021028", department: "Electrical", year: "3rd Year", registrations: 2, status: "Active" },
  { id: "stu_008", name: "Diya Menon", email: "diya.menon@campus.edu", collegeId: "BT2023005", department: "Biotechnology", year: "1st Year", registrations: 1, status: "Active" },
  { id: "stu_009", name: "Aditya Rao", email: "aditya.rao@campus.edu", collegeId: "CS2020018", department: "Computer Science", year: "4th Year", registrations: 5, status: "Active" },
  { id: "stu_010", name: "Ishita Gupta", email: "ishita.gupta@campus.edu", collegeId: "BA2021033", department: "Business Administration", year: "3rd Year", registrations: 2, status: "Active" },
  { id: "stu_011", name: "Manoj Pillai", email: "manoj.pillai@campus.edu", collegeId: "ME2021009", department: "Mechanical", year: "3rd Year", registrations: 1, status: "Active" },
  { id: "stu_012", name: "Kavya Krishnan", email: "kavya.krishnan@campus.edu", collegeId: "EC2022022", department: "Electronics & Comm.", year: "2nd Year", registrations: 3, status: "Active" },
  { id: "stu_013", name: "Rahul Chatterjee", email: "rahul.chatterjee@campus.edu", collegeId: "IT2020011", department: "Information Technology", year: "4th Year", registrations: 4, status: "Active" },
  { id: "stu_014", name: "Neha Joshi", email: "neha.joshi@campus.edu", collegeId: "CS2022045", department: "Computer Science", year: "2nd Year", registrations: 2, status: "Active" },
  { id: "stu_015", name: "Siddharth Bhat", email: "siddharth.bhat@campus.edu", collegeId: "CV2021016", department: "Civil", year: "3rd Year", registrations: 0, status: "Inactive" },
  { id: "stu_016", name: "Pooja Nair", email: "pooja.nair@campus.edu", collegeId: "BT2022008", department: "Biotechnology", year: "2nd Year", registrations: 1, status: "Active" },
  { id: "stu_017", name: "Yash Malhotra", email: "yash.malhotra@campus.edu", collegeId: "EE2020024", department: "Electrical", year: "4th Year", registrations: 3, status: "Active" },
  { id: "stu_018", name: "Tanvi Deshpande", email: "tanvi.deshpande@campus.edu", collegeId: "BA2022029", department: "Business Administration", year: "2nd Year", registrations: 2, status: "Active" },
  { id: "stu_019", name: "Harsh Agarwal", email: "harsh.agarwal@campus.edu", collegeId: "CS2021052", department: "Computer Science", year: "3rd Year", registrations: 5, status: "Active" },
  { id: "stu_020", name: "Meghana Rao", email: "meghana.rao@campus.edu", collegeId: "IT2022037", department: "Information Technology", year: "2nd Year", registrations: 1, status: "Active" },
  { id: "stu_021", name: "Devansh Kapoor", email: "devansh.kapoor@campus.edu", collegeId: "ME2020013", department: "Mechanical", year: "4th Year", registrations: 2, status: "Active" },
  { id: "stu_022", name: "Riya Saxena", email: "riya.saxena@campus.edu", collegeId: "EC2021039", department: "Electronics & Comm.", year: "3rd Year", registrations: 3, status: "Active" },
];

/* ================================ EVENTS ================================ */

export const eventCategories = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Hackathon",
  "Seminar",
];

export const eventStatuses = [
  "Draft",
  "Published",
  "Registration Open",
  "Registration Closed",
  "Ongoing",
  "Completed",
  "Cancelled",
];

export const events = [
  {
    id: "evt_001",
    name: "Web Development Hackathon 2026",
    banner: "🖥️",
    category: "Hackathon",
    description: "A 24-hour build sprint where teams ship a working full-stack web app from scratch, judged on functionality, design, and originality.",
    date: "2026-03-14",
    startTime: "09:00",
    endTime: "09:00 (+1 day)",
    venue: "CS Block – Innovation Lab",
    organizer: "Computer Science Department",
    eligibility: "All UG/PG students",
    department: "Computer Science",
    maxParticipants: 150,
    registrationDeadline: "2026-03-10",
    rules: "Teams of 2–4. Bring your own laptops. Use of AI coding assistants is allowed but must be disclosed.",
    highlights: "Live judging panel, mentor check-ins every 6 hours, midnight snacks.",
    prizeInfo: "₹50,000 total prize pool across top 3 teams.",
    status: "Completed",
    registrationCount: 124,
  },
  {
    id: "evt_002",
    name: "Rhythm & Rhyme — Annual Cultural Fest",
    banner: "🎤",
    category: "Cultural",
    description: "The flagship cultural night featuring music, dance, and spoken word performances from every department.",
    date: "2026-04-02",
    startTime: "17:00",
    endTime: "22:00",
    venue: "Main Auditorium",
    organizer: "Cultural Committee",
    eligibility: "All students",
    department: "All Departments",
    maxParticipants: 400,
    registrationDeadline: "2026-03-28",
    rules: "Solo and group entries accepted. Original compositions encouraged.",
    highlights: "Guest performance by alumni band, open mic segment.",
    prizeInfo: "Trophies for Best Performance, Best Original Composition.",
    status: "Registration Open",
    registrationCount: 87,
  },
  {
    id: "evt_003",
    name: "Robotics Arena — Bot Wars",
    banner: "🤖",
    category: "Technical",
    description: "Combat robotics competition where teams design and battle remote-controlled bots in a sealed arena.",
    date: "2026-03-22",
    startTime: "10:00",
    endTime: "18:00",
    venue: "Mechanical Workshop Ground",
    organizer: "Robotics Club",
    eligibility: "Engineering students only",
    department: "Mechanical",
    maxParticipants: 60,
    registrationDeadline: "2026-03-15",
    rules: "Bot weight limit 15kg. Safety inspection mandatory before each match.",
    highlights: "Knockout bracket, fan-favorite bot award.",
    prizeInfo: "₹20,000 for the winning team.",
    status: "Registration Open",
    registrationCount: 34,
  },
  {
    id: "evt_004",
    name: "FinLit Summit — Careers in Finance",
    banner: "📈",
    category: "Seminar",
    description: "Panel discussion and networking session with alumni working across investment banking, fintech, and consulting.",
    date: "2026-02-28",
    startTime: "14:00",
    endTime: "17:00",
    venue: "Business School Seminar Hall",
    organizer: "Business Administration Dept.",
    eligibility: "BA & final-year students",
    department: "Business Administration",
    maxParticipants: 120,
    registrationDeadline: "2026-02-24",
    rules: "Formal dress code recommended.",
    highlights: "Resume review desk, alumni networking mixer.",
    prizeInfo: "N/A",
    status: "Completed",
    registrationCount: 96,
  },
  {
    id: "evt_005",
    name: "Sprint Cup — Inter-Department Athletics",
    banner: "🏃",
    category: "Sports",
    description: "Track and field meet across sprints, relays, and field events, with department-wise team scoring.",
    date: "2026-03-05",
    startTime: "07:00",
    endTime: "12:00",
    venue: "University Sports Complex",
    organizer: "Sports Committee",
    eligibility: "All students",
    department: "All Departments",
    maxParticipants: 300,
    registrationDeadline: "2026-02-27",
    rules: "Medical fitness declaration required at registration.",
    highlights: "Department relay finals, live scoreboard.",
    prizeInfo: "Overall champion department trophy.",
    status: "Completed",
    registrationCount: 210,
  },
  {
    id: "evt_006",
    name: "UI/UX Design Workshop",
    banner: "🎨",
    category: "Workshop",
    description: "Hands-on workshop covering user research, wireframing, and prototyping in Figma, led by a senior product designer.",
    date: "2026-04-18",
    startTime: "10:00",
    endTime: "16:00",
    venue: "IT Block – Seminar Room 2",
    organizer: "Information Technology Dept.",
    eligibility: "All UG students",
    department: "Information Technology",
    maxParticipants: 80,
    registrationDeadline: "2026-04-12",
    rules: "Bring a laptop with Figma installed.",
    highlights: "Portfolio review at the end of the session.",
    prizeInfo: "N/A",
    status: "Draft",
    registrationCount: 0,
  },
  {
    id: "evt_007",
    name: "Circuitry Challenge — Embedded Systems Meet",
    banner: "🔌",
    category: "Technical",
    description: "Build-and-debug competition on embedded systems, from sensor interfacing to real-time control logic.",
    date: "2026-04-25",
    startTime: "09:30",
    endTime: "17:00",
    venue: "Electronics Lab Complex",
    organizer: "Electronics & Comm. Dept.",
    eligibility: "EC & EE students",
    department: "Electronics & Comm.",
    maxParticipants: 90,
    registrationDeadline: "2026-04-19",
    rules: "Teams of up to 3. Component kits provided on-site.",
    highlights: "Live debugging rounds judged by faculty panel.",
    prizeInfo: "₹15,000 for the winning team.",
    status: "Published",
    registrationCount: 18,
  },
  {
    id: "evt_008",
    name: "Startup Pitch Night",
    banner: "💡",
    category: "Seminar",
    description: "Student founders pitch early-stage ideas to a panel of local investors and alumni entrepreneurs.",
    date: "2026-03-30",
    startTime: "16:00",
    endTime: "19:30",
    venue: "Innovation & Incubation Cell",
    organizer: "E-Cell",
    eligibility: "All students with a registered idea",
    department: "All Departments",
    maxParticipants: 50,
    registrationDeadline: "2026-03-24",
    rules: "5-minute pitch + 3-minute Q&A per team.",
    highlights: "Feedback session with investors after pitches.",
    prizeInfo: "Seed grant of ₹1,00,000 for the top idea.",
    status: "Registration Closed",
    registrationCount: 22,
  },
];

/* ============================= REGISTRATIONS ============================= */

const regStatusPool = ["Registered", "Attended", "Absent", "Cancelled"];

function buildRegistrations() {
  const pairs = [
    ["evt_001", "stu_001"], ["evt_001", "stu_004"], ["evt_001", "stu_005"], ["evt_001", "stu_009"],
    ["evt_001", "stu_013"], ["evt_001", "stu_019"], ["evt_001", "stu_014"], ["evt_001", "stu_020"],
    ["evt_002", "stu_002"], ["evt_002", "stu_006"], ["evt_002", "stu_010"], ["evt_002", "stu_018"],
    ["evt_002", "stu_022"], ["evt_002", "stu_012"],
    ["evt_003", "stu_003"], ["evt_003", "stu_011"], ["evt_003", "stu_021"], ["evt_003", "stu_017"],
    ["evt_004", "stu_010"], ["evt_004", "stu_018"], ["evt_004", "stu_009"],
    ["evt_005", "stu_007"], ["evt_005", "stu_015"], ["evt_005", "stu_021"], ["evt_005", "stu_003"],
    ["evt_007", "stu_012"], ["evt_007", "stu_022"], ["evt_007", "stu_007"],
    ["evt_008", "stu_005"], ["evt_008", "stu_013"],
  ];

  return pairs.map(([eventId, studentId], idx) => {
    const student = students.find((s) => s.id === studentId);
    const event = events.find((e) => e.id === eventId);
    const isPast = event.status === "Completed";
    const status = isPast
      ? regStatusPool[idx % 3 === 0 ? 1 : idx % 5 === 0 ? 2 : 0] // mostly Attended/Registered, sprinkle Absent
      : idx % 7 === 0
      ? "Cancelled"
      : "Registered";

    return {
      id: `reg_${String(idx + 1).padStart(3, "0")}`,
      eventId,
      studentId,
      studentName: student.name,
      email: student.email,
      collegeId: student.collegeId,
      department: student.department,
      year: student.year,
      registeredAt: `2026-0${(idx % 3) + 1}-${String((idx % 27) + 1).padStart(2, "0")}`,
      status,
    };
  });
}

export const registrations = buildRegistrations();

/* ============================= ANNOUNCEMENTS ============================= */

export const announcementCategories = ["Event", "Academic", "Facility", "General", "Placement"];
export const announcementPriorities = ["Normal", "Important", "Urgent"];

export const announcements = [
  {
    id: "ann_001",
    title: "Web Development Hackathon 2026 — Results Out Now",
    description: "The results for the 24-hour hackathon have been published. Congratulations to all participating teams!",
    category: "Event",
    priority: "Important",
    publishDate: "2026-03-16",
    status: "Published",
    attachment: null,
  },
  {
    id: "ann_002",
    title: "Registrations Open: Rhythm & Rhyme Cultural Fest",
    description: "Sign up for solo or group performances before March 28th. Slots are limited and filling up fast.",
    category: "Event",
    priority: "Normal",
    publishDate: "2026-03-01",
    status: "Published",
    attachment: null,
  },
  {
    id: "ann_003",
    title: "Mid-Semester Exam Schedule Released",
    description: "The mid-semester examination timetable for all departments is now available on the academic portal.",
    category: "Academic",
    priority: "Urgent",
    publishDate: "2026-02-20",
    status: "Published",
    attachment: "exam-schedule.pdf",
  },
  {
    id: "ann_004",
    title: "Library Extended Hours During Exam Week",
    description: "The central library will remain open until 1 AM from March 18th–25th to support exam preparation.",
    category: "Facility",
    priority: "Normal",
    publishDate: "2026-03-12",
    status: "Published",
    attachment: null,
  },
  {
    id: "ann_005",
    title: "Campus Placement Drive — Pre-Placement Talks Next Week",
    description: "Three companies will conduct pre-placement talks for final-year students. Details and RSVP link inside.",
    category: "Placement",
    priority: "Important",
    publishDate: "2026-03-08",
    status: "Published",
    attachment: null,
  },
  {
    id: "ann_006",
    title: "UI/UX Design Workshop — Draft Announcement",
    description: "Draft announcement for the upcoming design workshop, pending final venue confirmation.",
    category: "Event",
    priority: "Normal",
    publishDate: "2026-04-10",
    status: "Draft",
    attachment: null,
  },
];

/* ================================ RESULTS ================================ */

export const results = [
  {
    id: "res_001",
    eventId: "evt_001",
    eventName: "Web Development Hackathon 2026",
    status: "Published",
    publishedDate: "2026-03-16",
    placements: [
      { position: "1st Place", name: "Team Alpha", department: "Computer Science", prize: "₹25,000", achievement: "Built a real-time campus carpooling platform." },
      { position: "2nd Place", name: "Team CodeX", department: "Information Technology", prize: "₹15,000", achievement: "AI-assisted note-sharing app with OCR." },
      { position: "3rd Place", name: "Team Innovators", department: "Computer Science", prize: "₹10,000", achievement: "Accessibility-first event check-in tool." },
    ],
  },
  {
    id: "res_002",
    eventId: "evt_004",
    eventName: "FinLit Summit — Careers in Finance",
    status: "Published",
    publishedDate: "2026-03-01",
    placements: [
      { position: "Best Question Award", name: "Ishita Gupta", department: "Business Administration", prize: "Amazon voucher", achievement: "Sharpest audience question on fintech regulation." },
    ],
  },
  {
    id: "res_003",
    eventId: "evt_005",
    eventName: "Sprint Cup — Inter-Department Athletics",
    status: "Published",
    publishedDate: "2026-03-06",
    placements: [
      { position: "Overall Champions", name: "Computer Science Dept.", department: "Computer Science", prize: "Rotating Trophy", achievement: "Highest aggregate points across all events." },
      { position: "1st Runner-up", name: "Mechanical Dept.", department: "Mechanical", prize: "—", achievement: "Strongest relay performance." },
    ],
  },
];

/* ============================== CERTIFICATES ============================== */

export const certificateSummary = [
  { eventId: "evt_001", eventName: "Web Development Hackathon 2026", participants: 124, generated: 124, status: "Generated" },
  { eventId: "evt_004", eventName: "FinLit Summit — Careers in Finance", participants: 96, generated: 0, status: "Not Generated" },
  { eventId: "evt_005", eventName: "Sprint Cup — Inter-Department Athletics", participants: 210, generated: 210, status: "Generated" },
];

/* =============================== DASHBOARD =============================== */

export const dashboardStats = {
  totalStudents: students.length,
  totalEvents: events.length,
  upcomingEvents: events.filter((e) =>
    ["Published", "Registration Open", "Registration Closed"].includes(e.status)
  ).length,
  totalRegistrations: registrations.length,
};
