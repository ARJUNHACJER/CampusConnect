import React from "react";

const FIELD_CLASS =
  "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60";

const LABEL_CLASS = "block text-xs font-medium text-slate-400 mb-1";

const FIELDS = [
  ["fullName", "Full Name", "text"],
  ["title", "Professional Title", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone", "text"],
  ["location", "Location", "text"],
  ["linkedin", "LinkedIn URL", "text"],
  ["github", "GitHub URL", "text"],
  ["portfolio", "Portfolio URL", "text"],
];

export default function PersonalInfoSection({ data, onChange }) {
  const update = (key, value) => onChange({ ...data, [key]: value });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FIELDS.map(([key, label, type]) => (
        <div key={key}>
          <label className={LABEL_CLASS}>{label}</label>
          <input
            type={type}
            className={FIELD_CLASS}
            value={data[key] || ""}
            placeholder={label}
            onChange={(e) => update(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
