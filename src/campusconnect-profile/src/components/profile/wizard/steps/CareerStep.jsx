// src/components/profile/wizard/steps/CareerStep.jsx
import React from "react";
import FormField from "../../ui/FormField";
import TagInput from "../../ui/TagInput";
import ChipToggleGroup from "../../ui/ChipToggleGroup";

const LOOKING_FOR_OPTIONS = [
  "Internship",
  "Job",
  "Hackathon",
  "Workshop",
  "Competition",
  "Seminar",
  "Networking",
  "Higher Studies",
  "Entrepreneurship",
];

export default function CareerStep({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-6">
      <FormField label="Career Goal" as="textarea" value={data.goal} onChange={set("goal")} placeholder="What are you working towards?" />
      <TagInput label="Interested Career Roles" value={data.roles} onChange={set("roles")} placeholder="e.g. Software Engineer, Product Designer" />
      <FormField label="Preferred Industry" value={data.industry} onChange={set("industry")} placeholder="e.g. IT, Healthcare, Finance" />
      <ChipToggleGroup label="Looking For" options={LOOKING_FOR_OPTIONS} value={data.lookingFor} onChange={set("lookingFor")} />
      <FormField label="Preferred Work Location" value={data.preferredLocation} onChange={set("preferredLocation")} />
    </div>
  );
}
