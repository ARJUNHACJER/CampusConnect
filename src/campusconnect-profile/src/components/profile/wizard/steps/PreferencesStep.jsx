// src/components/profile/wizard/steps/PreferencesStep.jsx
import React from "react";
import ChipToggleGroup from "../../ui/ChipToggleGroup";

const EVENT_INTERESTS = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshops",
  "Hackathons",
  "Seminars",
  "Competitions",
  "Placements",
  "Clubs",
  "Entrepreneurship",
];

const NOTIFICATION_OPTIONS = [
  "Event Reminders",
  "Registration Deadlines",
  "Results",
  "Announcements",
  "Schedule Changes",
];

export default function PreferencesStep({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-8">
      <ChipToggleGroup
        label="What kind of events are you into?"
        options={EVENT_INTERESTS}
        value={data.eventInterests}
        onChange={set("eventInterests")}
        help="We'll use this to recommend events to you."
      />
      <ChipToggleGroup
        label="Notify me about"
        options={NOTIFICATION_OPTIONS}
        value={data.notifications}
        onChange={set("notifications")}
      />
    </div>
  );
}
