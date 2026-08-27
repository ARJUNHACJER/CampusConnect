/**
 * mockFeedback.js
 * ------------------------------------------------------------------
 * Local mock data + constants for the Event Feedback feature.
 * Table shapes mirror the future Supabase `events`, `registrations`,
 * and `event_feedback` tables so this file is a drop-in stand-in.
 * ------------------------------------------------------------------
 */

export const FEEDBACK_CATEGORIES = [
  { id: "overallRating", label: "Overall Experience" },
  { id: "organizationRating", label: "Event Organization" },
  { id: "contentRating", label: "Content / Activities" },
  { id: "venueRating", label: "Venue" },
  { id: "coordinationRating", label: "Coordination" },
];

export const WOULD_ATTEND_AGAIN_OPTIONS = ["Yes", "Maybe", "No"];

export const FEEDBACK_STAR_FILTERS = [
  { id: "all", label: "All" },
  { id: "5", label: "5 Star" },
  { id: "4", label: "4 Star" },
  { id: "3", label: "3 Star" },
  { id: "2", label: "2 Star" },
  { id: "1", label: "1 Star" },
];

export const FEEDBACK_SENTIMENT_FILTERS = [
  { id: "all", label: "All" },
  { id: "positive", label: "Positive" },
  { id: "neutral", label: "Neutral" },
  { id: "needs_improvement", label: "Needs Improvement" },
];

/** A rating of 4-5 is positive, 3 is neutral, 1-2 needs improvement. */
export function sentimentForRating(rating) {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "needs_improvement";
}

// ---------------------------------------------------------------------------
// MOCK EVENTS (subset of fields relevant to the feedback feature)
// ---------------------------------------------------------------------------

export const MOCK_EVENTS = [
  {
    id: "event_001",
    title: "Web Development Hackathon 2026",
    status: "completed",
    registrations: 124,
    attendance: 108,
  },
  {
    id: "event_002",
    title: "AI Workshop",
    status: "completed",
    registrations: 86,
    attendance: 72,
  },
  {
    id: "event_003",
    title: "Cultural Fest",
    status: "completed",
    registrations: 320,
    attendance: 280,
  },
];

// ---------------------------------------------------------------------------
// MOCK REGISTRATIONS — used to determine student feedback eligibility
// ---------------------------------------------------------------------------

export const MOCK_MY_REGISTRATIONS = [
  {
    id: "reg_001",
    eventId: "event_001",
    eventTitle: "Web Development Hackathon 2026",
    status: "completed",
    attended: true,
    feedbackSubmitted: false,
  },
  {
    id: "reg_002",
    eventId: "event_002",
    eventTitle: "AI Workshop",
    status: "completed",
    attended: true,
    feedbackSubmitted: true,
  },
];

// ---------------------------------------------------------------------------
// MOCK FEEDBACK ROWS — shape matches the future `event_feedback` table
// ---------------------------------------------------------------------------

export const MOCK_EVENT_FEEDBACK = {
  event_001: [
    {
      id: "feedback_001",
      eventId: "event_001",
      studentIdHash: "anon_18f2",
      overallRating: 5,
      organizationRating: 4,
      contentRating: 5,
      venueRating: 4,
      coordinationRating: 5,
      comment: "The workshop was very useful and well organized. Loved the mentor support during the build.",
      wouldAttendAgain: "Yes",
      submittedAt: "2026-08-20",
    },
    {
      id: "feedback_002",
      eventId: "event_001",
      studentIdHash: "anon_92ab",
      overallRating: 3,
      organizationRating: 3,
      contentRating: 4,
      venueRating: 2,
      coordinationRating: 3,
      comment: "The venue was slightly crowded and the wifi struggled at peak hours.",
      wouldAttendAgain: "Maybe",
      submittedAt: "2026-08-20",
    },
    {
      id: "feedback_003",
      eventId: "event_001",
      studentIdHash: "anon_4c31",
      overallRating: 5,
      organizationRating: 5,
      contentRating: 5,
      venueRating: 4,
      coordinationRating: 5,
      comment: "Best hackathon on campus so far — great problem statements and judging.",
      wouldAttendAgain: "Yes",
      submittedAt: "2026-08-21",
    },
    {
      id: "feedback_004",
      eventId: "event_001",
      studentIdHash: "anon_7d09",
      overallRating: 2,
      organizationRating: 2,
      contentRating: 3,
      venueRating: 2,
      coordinationRating: 2,
      comment: "Registration and check-in took far too long, we lost an hour of build time.",
      wouldAttendAgain: "No",
      submittedAt: "2026-08-21",
    },
  ],
  event_002: [
    {
      id: "feedback_005",
      eventId: "event_002",
      studentIdHash: "anon_51ee",
      overallRating: 5,
      organizationRating: 5,
      contentRating: 5,
      venueRating: 5,
      coordinationRating: 4,
      comment: "Extremely well-paced content, the hands-on labs were the highlight.",
      wouldAttendAgain: "Yes",
      submittedAt: "2026-08-18",
    },
  ],
  event_003: [],
};

/**
 * Computes summary stats (average rating, response rate, etc.) for an event.
 * Mirrors an aggregate query you'd later run against `event_feedback`.
 */
export function getFeedbackSummary(eventId) {
  const event = MOCK_EVENTS.find((e) => e.id === eventId);
  const feedback = MOCK_EVENT_FEEDBACK[eventId] || [];
  const responses = feedback.length;

  const avg = (key) =>
    responses === 0 ? 0 : feedback.reduce((sum, f) => sum + f[key], 0) / responses;

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = feedback.filter((f) => f.overallRating === star).length;
    return {
      star,
      count,
      pct: responses === 0 ? 0 : Math.round((count / responses) * 100),
    };
  });

  return {
    event,
    responses,
    registrations: event?.registrations ?? 0,
    attendance: event?.attendance ?? 0,
    responseRate:
      event?.registrations ? Math.round((responses / event.registrations) * 100) : 0,
    overallAvg: Number(avg("overallRating").toFixed(1)),
    categoryAverages: {
      overallRating: Number(avg("overallRating").toFixed(1)),
      organizationRating: Number(avg("organizationRating").toFixed(1)),
      contentRating: Number(avg("contentRating").toFixed(1)),
      venueRating: Number(avg("venueRating").toFixed(1)),
      coordinationRating: Number(avg("coordinationRating").toFixed(1)),
    },
    distribution,
  };
}
