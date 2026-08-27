import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyLanguage } from "../defaultResumeData";
import { FIELD_CLASS, ADD_BUTTON_CLASS } from "./formStyles";

const LEVELS = ["Basic", "Conversational", "Fluent", "Native"];

export default function LanguagesSection({ data, onChange }) {
  const entries = data || [];

  const updateEntry = (id, key, value) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const addEntry = () => onChange([...entries, emptyLanguage()]);
  const removeEntry = (id) => onChange(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-2">
          <input
            className={FIELD_CLASS}
            placeholder="e.g. Telugu"
            value={entry.name}
            onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
          />
          <select
            className={`${FIELD_CLASS} sm:w-40 shrink-0`}
            value={entry.proficiency}
            onChange={(e) => updateEntry(entry.id, "proficiency", e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button onClick={() => removeEntry(entry.id)} className="text-slate-500 hover:text-red-400 shrink-0" aria-label="Delete language">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {entries.length === 0 && <p className="text-sm text-slate-500">No languages added yet.</p>}

      <button className={ADD_BUTTON_CLASS} onClick={addEntry}>
        <Plus size={16} /> Add Language
      </button>
    </div>
  );
}
