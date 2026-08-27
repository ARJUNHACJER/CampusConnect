/* ==========================================================================
   MOCK DATA
   Shaped 1:1 with the suggested Supabase tables so swapping this module
   for real `supabase.from(...)` calls later is a drop-in replacement.
   Tables: events, registrations, waitlist_entries, notifications,
           certificates, certificate_templates, users
   ========================================================================== */

export const CURRENT_STUDENT = {
  id: "student_001",
  name: "Nandu G",
  email: "nandu.g@campusconnect.edu",
};

export const EVENTS = [
  {
    id: "event_001",
    title: "AI & ML Workshop",
    maxParticipants: 100,
    registeredCount: 100,
    waitlistEnabled: true,
    waitlistLimit: 50,
    seatOfferDurationHours: 12,
    status: "upcoming", // upcoming | ongoing | completed
    date: "2026-09-05",
  },
  {
    id: "event_002",
    title: "Web Development Hackathon 2026",
    maxParticipants: 150,
    registeredCount: 124,
    waitlistEnabled: true,
    waitlistLimit: 30,
    seatOfferDurationHours: 12,
    status: "completed",
    date: "2026-08-30",
  },
];

export const WAITLIST_ENTRIES = [
  {
    id: "wait_001",
    eventId: "event_001",
    studentId: "student_001",
    studentName: "Nandu G",
    position: 12,
    joinedAt: "2026-08-22T10:30:00",
    status: "waiting", // waiting | offered | registered | cancelled | expired
    offerExpiresAt: null,
  },
  {
    id: "wait_002",
    eventId: "event_001",
    studentId: "student_010",
    studentName: "Student A",
    position: 1,
    joinedAt: "2026-08-20T09:00:00",
    status: "waiting",
    offerExpiresAt: null,
  },
  {
    id: "wait_003",
    eventId: "event_001",
    studentId: "student_011",
    studentName: "Student B",
    position: 2,
    joinedAt: "2026-08-20T09:15:00",
    status: "waiting",
    offerExpiresAt: null,
  },
];

export const CERTIFICATES = [
  {
    id: "cert_001",
    certificateId: "CC-CERT-2026-00124",
    eventId: "event_002",
    eventName: "Web Development Hackathon 2026",
    studentId: "student_001",
    recipientName: "Nandu G",
    type: "winner", // participation | winner | runner_up | achievement | volunteer
    issueDate: "2026-08-30",
    status: "published", // draft | generated | published | revoked
    pdfUrl: null,
  },
  {
    id: "cert_002",
    certificateId: "CC-CERT-2026-00098",
    eventId: "event_003",
    eventName: "Startup Pitch Day",
    studentId: "student_001",
    recipientName: "Nandu G",
    type: "participation",
    issueDate: "2026-07-14",
    status: "published",
    pdfUrl: null,
  },
  {
    id: "cert_003",
    certificateId: "CC-CERT-2026-00071",
    eventId: "event_004",
    eventName: "Volunteer Week 2026",
    studentId: "student_001",
    recipientName: "Nandu G",
    type: "volunteer",
    issueDate: "2026-06-02",
    status: "published",
    pdfUrl: null,
  },
];

export const CERTIFICATE_TYPE_LABELS = {
  participation: { label: "Participation Certificate", icon: "🎓" },
  winner: { label: "Winner Certificate", icon: "🏆" },
  runner_up: { label: "Runner-up Certificate", icon: "🥈" },
  achievement: { label: "Achievement Certificate", icon: "⭐" },
  volunteer: { label: "Volunteer Certificate", icon: "🤝" },
};

export function generateCertificateId(year = new Date().getFullYear()) {
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `CC-CERT-${year}-${seq}`;
}
