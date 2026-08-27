import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyAchievement } from "../defaultResumeData";
import { FIELD_CLASS, ADD_BUTTON_CLASS } from "./formStyles";

export default function AchievementsSection({ data, onChange }) {
  const entries = data || [];

  const updateEntry = (id, value) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, title: value } : e)));

  const addEntry = () => onChange([...entries, emptyAchievement()]);
  const removeEntry = (id) => onChange(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-2">
          <input
            className={FIELD_CLASS}
            placeholder="e.g. Winner, Smart India Hackathon 2025"
            value={entry.title}
            onChange={(e) => updateEntry(entry.id, e.target.value)}
          />
          <button onClick={() => removeEntry(entry.id)} className="text-slate-500 hover:text-red-400 shrink-0" aria-label="Delete achievement">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {entries.length === 0 && <p className="text-sm text-slate-500">No achievements added yet.</p>}

      <button className={ADD_BUTTON_CLASS} onClick={addEntry}>
        <Plus size={16} /> Add Achievement
      </button>
    </div>
  );
}
