// src/components/profile/wizard/steps/SkillsStep.jsx
import React from "react";
import TagInput from "../../ui/TagInput";

export default function SkillsStep({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-6">
      <TagInput label="Technical Skills" value={data.technical} onChange={set("technical")} placeholder="e.g. Python, React, AutoCAD" />
      <TagInput label="Soft Skills" value={data.soft} onChange={set("soft")} placeholder="e.g. Public Speaking, Teamwork" />
      <TagInput label="Languages Known" value={data.languages} onChange={set("languages")} placeholder="e.g. English, Telugu" />
      <TagInput label="Tools / Technologies" value={data.tools} onChange={set("tools")} placeholder="e.g. Figma, MATLAB, Git" />
      <TagInput label="Areas of Interest" value={data.interests} onChange={set("interests")} placeholder="e.g. Web Development, Robotics" />
      <TagInput label="Hobbies" value={data.hobbies} onChange={set("hobbies")} placeholder="e.g. Photography, Chess" />
      <TagInput label="Certifications" value={data.certifications} onChange={set("certifications")} placeholder="e.g. AWS Cloud Practitioner" />
    </div>
  );
}
