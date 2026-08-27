// mockEventData.js
// Shared mock data source for My Registrations + Schedule pages.
// Registrations reference events by eventId so Schedule can derive
// its timeline straight from the student's registered events instead
// of keeping a second, duplicate event list. Swapping this file for
// real Supabase queries later should not require touching the pages.

export const events = [
  {
    id: "event_001",
    title: "Web Development Hackathon 2026",
    category: "Technical",
    date: "2026-08-29",
    startTime: "10:00",
    endTime: "16:00",
    venue: "CSE Seminar Hall",
    organizer: "CSE Department Student Council",
    banner:
      "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
  },
  {
    id: "event_002",
    title: "AI & ML Workshop",
    category: "Technical",
    date: "2026-08-24",
    startTime: "10:00",
    endTime: "12:00",
    venue: "Innovation Lab",
    organizer: "AI Research Club",
    banner:
      "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
  },
  {
    id: "event_003",
    title: "UI/UX Design Workshop",
    category: "Design",
    date: "2026-08-26",
    startTime: "14:00",
    endTime: "16:30",
    venue: "Design Lab",
    organizer: "Design Guild",
    banner:
      "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
  },
  {
    id: "event_004",
    title: "Inter-College Photography Meet",
    category: "Cultural",
    date: "2026-08-15",
    startTime: "09:00",
    endTime: "13:00",
    venue: "Amphitheatre",
    organizer: "Media Club",
    banner:
      "linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)",
  },
  {
    id: "event_005",
    title: "Startup Pitch Night",
    category: "Entrepreneurship",
    date: "2026-08-10",
    startTime: "17:00",
    endTime: "19:30",
    venue: "Auditorium",
    organizer: "E-Cell",
    banner:
      "linear-gradient(135deg, #eab308 0%, #f97316 100%)",
  },
  {
    id: "event_006",
    title: "Robotics Bootcamp",
    category: "Technical",
    date: "2026-08-05",
    startTime: "09:30",
    endTime: "17:00",
    venue: "Robotics Lab",
    organizer: "Robotics Society",
    banner:
      "linear-gradient(135deg, #64748b 0%, #334155 100%)",
  },
  {
    id: "event_007",
    title: "Classical Dance Fest",
    category: "Cultural",
    date: "2026-07-28",
    startTime: "18:00",
    endTime: "21:00",
    venue: "Open Air Theatre",
    organizer: "Cultural Committee",
    banner:
      "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
  },
  {
    id: "event_008",
    title: "Cloud Computing Seminar",
    category: "Technical",
    date: "2026-08-24",
    startTime: "11:00",
    endTime: "12:30",
    venue: "Seminar Hall B",
    organizer: "CSE Department",
    banner:
      "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  },
];

export const registrations = [
  {
    id: "reg_001",
    registrationCode: "CC-HACK-2026-00124",
    studentId: "student_001",
    eventId: "event_001",
    registeredAt: "2026-08-18",
    status: "registered",
  },
  {
    id: "reg_002",
    registrationCode: "CC-WKSP-2026-00087",
    studentId: "student_001",
    eventId: "event_002",
    registeredAt: "2026-08-10",
    status: "registered",
  },
  {
    id: "reg_003",
    registrationCode: "CC-WKSP-2026-00091",
    studentId: "student_001",
    eventId: "event_003",
    registeredAt: "2026-08-12",
    status: "registered",
  },
  {
    id: "reg_004",
    registrationCode: "CC-CULT-2026-00052",
    studentId: "student_001",
    eventId: "event_004",
    registeredAt: "2026-08-01",
    status: "completed",
    result: "Certificate of Participation",
  },
  {
    id: "reg_005",
    registrationCode: "CC-PITCH-2026-00033",
    studentId: "student_001",
    eventId: "event_005",
    registeredAt: "2026-07-30",
    status: "completed",
    result: "Runner-up",
  },
  {
    id: "reg_006",
    registrationCode: "CC-ROBO-2026-00019",
    studentId: "student_001",
    eventId: "event_006",
    registeredAt: "2026-07-20",
    status: "completed",
    result: "Certificate of Completion",
  },
  {
    id: "reg_007",
    registrationCode: "CC-DANCE-2026-00061",
    studentId: "student_001",
    eventId: "event_007",
    registeredAt: "2026-07-15",
    status: "cancelled",
  },
  {
    id: "reg_008",
    registrationCode: "CC-CLOUD-2026-00104",
    studentId: "student_001",
    eventId: "event_008",
    registeredAt: "2026-08-14",
    status: "waitlisted",
  },
];

// Joins a registration with its event so components never have to
// look events up themselves.
export function getEnrichedRegistrations() {
  return registrations.map((reg) => ({
    ...reg,
    event: events.find((e) => e.id === reg.eventId) || null,
  }));
}