import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyExperience } from "../defaultResumeData";
import { FIELD_CLASS, LABEL_CLASS, CARD_CLASS, ADD_BUTTON_CLASS, DELETE_BUTTON_CLASS } from "./formStyles";

export default function ExperienceSection({ data, onChange }) {
  const entries = data || [];

  const updateEntry = (id, key, value) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const addEntry = () => onChange([...entries, emptyExperience()]);
  const removeEntry = (id) => onChange(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className={CARD_CLASS}>
          <button className={DELETE_BUTTON_CLASS} onClick={() => removeEntry(entry.id)} aria-label="Delete experience entry">
            <Trash2 size={16} />
          </button>
          <div className="space-y-3 pr-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Company</label>
                <input className={FIELD_CLASS} value={entry.company} onChange={(e) => updateEntry(entry.id, "company", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Role</label>
                <input className={FIELD_CLASS} value={entry.role} onChange={(e) => updateEntry(entry.id, "role", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Start Date</label>
                <input className={FIELD_CLASS} placeholder="e.g. Jun 2025" value={entry.startDate} onChange={(e) => updateEntry(entry.id, "startDate", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS}>End Date</label>
                <input className={FIELD_CLASS} placeholder="e.g. Aug 2025 or Present" value={entry.endDate} onChange={(e) => updateEntry(entry.id, "endDate", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Description</label>
              <textarea rows={3} className={FIELD_CLASS} value={entry.description} onChange={(e) => updateEntry(entry.id, "description", e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      {entries.length === 0 && <p className="text-sm text-slate-500">No experience added yet.</p>}

      <button className={ADD_BUTTON_CLASS} onClick={addEntry}>
        <Plus size={16} /> Add Experience
      </button>
    </div>
  );
}
