// src/components/profile/ui/TagInput.jsx
//
// Free-text "type + Enter to add" tag input. Used anywhere the spec calls
// for a list (Technical Skills, Hobbies, Interested Career Roles, etc).

import React, { useState } from "react";
import { theme } from "./theme";

export default function TagInput({ label, value = [], onChange, placeholder, help }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div>
      <label className={theme.label}>{label}</label>

      <div className={theme.inputWrap}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder || "Type and press Enter"}
          className={theme.input}
        />
        <button type="button" onClick={addTag} className="text-xs text-violet-400 hover:text-violet-300 shrink-0">
          Add
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((tag) => (
            <span key={tag} className={theme.chip}>
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className={theme.chipRemove} aria-label={`Remove ${tag}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {help && <p className={theme.helpText}>{help}</p>}
    </div>
  );
}
