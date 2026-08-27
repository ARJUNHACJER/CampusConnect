import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyCertification } from "../defaultResumeData";
import { FIELD_CLASS, LABEL_CLASS, CARD_CLASS, ADD_BUTTON_CLASS, DELETE_BUTTON_CLASS } from "./formStyles";

export default function CertificationsSection({ data, onChange }) {
  const entries = data || [];

  const updateEntry = (id, key, value) =>
    onChange(entries.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const addEntry = () => onChange([...entries, emptyCertification()]);
  const removeEntry = (id) => onChange(entries.filter((e) => e.id !== id));

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className={CARD_CLASS}>
          <button className={DELETE_BUTTON_CLASS} onClick={() => removeEntry(entry.id)} aria-label="Delete certification">
            <Trash2 size={16} />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
            <div>
              <label className={LABEL_CLASS}>Certification Name</label>
              <input className={FIELD_CLASS} value={entry.name} onChange={(e) => updateEntry(entry.id, "name", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Issuing Organization</label>
              <input className={FIELD_CLASS} value={entry.organization} onChange={(e) => updateEntry(entry.id, "organization", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Date</label>
              <input className={FIELD_CLASS} value={entry.date} onChange={(e) => updateEntry(entry.id, "date", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Credential URL</label>
              <input className={FIELD_CLASS} value={entry.credentialUrl} onChange={(e) => updateEntry(entry.id, "credentialUrl", e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      {entries.length === 0 && <p className="text-sm text-slate-500">No certifications added yet.</p>}

      <button className={ADD_BUTTON_CLASS} onClick={addEntry}>
        <Plus size={16} /> Add Certification
      </button>
    </div>
  );
}
