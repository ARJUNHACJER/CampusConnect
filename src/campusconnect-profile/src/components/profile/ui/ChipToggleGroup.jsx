// src/components/profile/ui/ChipToggleGroup.jsx
//
// A grid of tappable chips for multi-select checkbox-style choices
// (Looking For: Internship/Job/..., Event Interests, Notification prefs).

import React from "react";
import { theme } from "./theme";

export default function ChipToggleGroup({ label, options, value = [], onChange, help }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };

  return (
    <div>
      <label className={theme.label}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              className={
                active
                  ? "rounded-full border border-violet-500 bg-violet-500/20 px-4 py-2 text-xs font-medium text-violet-200 transition-colors"
                  : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
      {help && <p className={theme.helpText}>{help}</p>}
    </div>
  );
}
