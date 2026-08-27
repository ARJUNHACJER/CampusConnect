import React, { useState } from "react";
import { X } from "lucide-react";
import { LABEL_CLASS, FIELD_CLASS, CHIP_CLASS } from "./formStyles";

const CATEGORIES = [
  ["languages", "Programming Languages"],
  ["frameworks", "Frameworks"],
  ["databases", "Databases"],
  ["tools", "Tools"],
  ["other", "Other Skills"],
];

function SkillCategory({ label, values, onChange }) {
  const [draft, setDraft] = useState("");

  const addSkill = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!values.includes(trimmed)) onChange([...values, trimmed]);
    setDraft("");
  };

  const removeSkill = (skill) => onChange(values.filter((s) => s !== skill));

  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((skill) => (
          <span key={skill} className={CHIP_CLASS}>
            {skill}
            <button onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={FIELD_CLASS}
          placeholder={`Add a ${label.toLowerCase()} and press Enter`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <button
          onClick={addSkill}
          className="shrink-0 rounded-lg bg-indigo-500/15 text-indigo-300 text-sm font-medium px-3 hover:bg-indigo-500/25 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function SkillsSection({ data, onChange }) {
  const skills = data || {};

  const updateCategory = (key, values) => onChange({ ...skills, [key]: values });

  return (
    <div className="space-y-5">
      {CATEGORIES.map(([key, label]) => (
        <SkillCategory
          key={key}
          label={label}
          values={skills[key] || []}
          onChange={(values) => updateCategory(key, values)}
        />
      ))}
    </div>
  );
}
