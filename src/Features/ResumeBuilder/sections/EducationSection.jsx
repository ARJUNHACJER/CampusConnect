import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyEducation } from "../defaultResumeData";
import { FIELD_CLASS, LABEL_CLASS, CARD_CLASS, ADD_BUTTON_CLASS, DELETE_BUTTON_CLASS } from "./formStyles";

const FIELDS = [
  ["institution", "Institution"],
  ["degree", "Degree / Course"],
  ["branch", "Branch / Specialization"],
  ["startYear", "Start Year"],
  ["endYear", "End Year"],
  ["grade", "CGPA / Percentage"],
];

export default function EducationSection({ data, onChange }) {
  const entries = data || [];

  const updateEntry = (id, key, value) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const addEntry = () => onChange([...entries, emptyEducation()]);
  const removeEntry = (id) => onChange(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className={CARD_CLASS}>
          <button className={DELETE_BUTTON_CLASS} onClick={() => removeEntry(entry.id)} aria-label="Delete education entry">
            <Trash2 size={16} />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
            {FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className={LABEL_CLASS}>{label}</label>
                <input
                  className={FIELD_CLASS}
                  value={entry[key] || ""}
                  placeholder={label}
                  onChange={(e) => updateEntry(entry.id, key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <p className="text-sm text-slate-500">No education added yet.</p>
      )}

      <button className={ADD_BUTTON_CLASS} onClick={addEntry}>
        <Plus size={16} /> Add Education
      </button>
    </div>
  );
}
