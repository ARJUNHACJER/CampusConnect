import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyActivity } from "../defaultResumeData";
import { FIELD_CLASS, ADD_BUTTON_CLASS } from "./formStyles";

const TYPES = ["Workshop", "Hackathon", "Competition", "Club", "Volunteering", "Other"];

export default function ActivitiesSection({ data, onChange }) {
  const entries = data || [];

  const updateEntry = (id, key, value) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const addEntry = () => onChange([...entries, emptyActivity()]);
  const removeEntry = (id) => onChange(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-2">
          <select
            className={`${FIELD_CLASS} sm:w-40 shrink-0`}
            value={entry.type}
            onChange={(e) => updateEntry(entry.id, "type", e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            className={FIELD_CLASS}
            placeholder="Description"
            value={entry.title}
            onChange={(e) => updateEntry(entry.id, "title", e.target.value)}
          />
          <button onClick={() => removeEntry(entry.id)} className="text-slate-500 hover:text-red-400 shrink-0" aria-label="Delete activity">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {entries.length === 0 && <p className="text-sm text-slate-500">No workshops or activities added yet.</p>}

      <button className={ADD_BUTTON_CLASS} onClick={addEntry}>
        <Plus size={16} /> Add Activity
      </button>
    </div>
  );
}
