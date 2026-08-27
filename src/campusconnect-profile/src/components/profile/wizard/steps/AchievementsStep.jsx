// src/components/profile/wizard/steps/AchievementsStep.jsx
import React from "react";
import TagInput from "../../ui/TagInput";

export default function AchievementsStep({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400 -mt-1">
        This section is optional, but it helps you stand out for competitive events. Add as much or as little as you like.
      </p>
      <TagInput label="Academic Achievements" value={data.academic} onChange={set("academic")} placeholder="e.g. University Rank 3" />
      <TagInput label="Hackathons" value={data.hackathons} onChange={set("hackathons")} placeholder="e.g. Smart India Hackathon Finalist" />
      <TagInput label="Competitions" value={data.competitions} onChange={set("competitions")} />
      <TagInput label="Awards" value={data.awards} onChange={set("awards")} />
      <TagInput label="Projects" value={data.projects} onChange={set("projects")} placeholder="e.g. Campus Event App" />
      <TagInput label="Certifications" value={data.certifications} onChange={set("certifications")} />
      <TagInput label="Leadership Roles" value={data.leadership} onChange={set("leadership")} placeholder="e.g. Club Secretary" />
      <TagInput label="Volunteer Experience" value={data.volunteer} onChange={set("volunteer")} />
    </div>
  );
}
