import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyProject } from "../defaultResumeData";
import { FIELD_CLASS, LABEL_CLASS, CARD_CLASS, ADD_BUTTON_CLASS, DELETE_BUTTON_CLASS } from "./formStyles";

export default function ProjectsSection({ data, onChange }) {
  const entries = data || [];

  const updateEntry = (id, key, value) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const addEntry = () => onChange([...entries, emptyProject()]);
  const removeEntry = (id) => onChange(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className={CARD_CLASS}>
          <button className={DELETE_BUTTON_CLASS} onClick={() => removeEntry(entry.id)} aria-label="Delete project">
            <Trash2 size={16} />
          </button>
          <div className="space-y-3 pr-6">
            <div>
              <label className={LABEL_CLASS}>Project Name</label>
              <input className={FIELD_CLASS} value={entry.name} onChange={(e) => updateEntry(entry.id, "name", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Short Description</label>
              <textarea
                rows={2}
                className={FIELD_CLASS}
                value={entry.description}
                onChange={(e) => updateEntry(entry.id, "description", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Technologies Used</label>
              <input
                className={FIELD_CLASS}
                placeholder="e.g. React, Node.js, Supabase"
                value={entry.technologies}
                onChange={(e) => updateEntry(entry.id, "technologies", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>GitHub URL</label>
                <input className={FIELD_CLASS} value={entry.githubUrl} onChange={(e) => updateEntry(entry.id, "githubUrl", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Live Demo URL</label>
                <input className={FIELD_CLASS} value={entry.liveUrl} onChange={(e) => updateEntry(entry.id, "liveUrl", e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {entries.length === 0 && <p className="text-sm text-slate-500">No projects added yet.</p>}

      <button className={ADD_BUTTON_CLASS} onClick={addEntry}>
        <Plus size={16} /> Add Project
      </button>
    </div>
  );
}
