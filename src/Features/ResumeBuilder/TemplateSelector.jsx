import React from "react";
import { Check } from "lucide-react";

export const TEMPLATES = [
  { id: "modern", name: "Modern", description: "Bold heading, indigo accents" },
  { id: "professional", name: "Professional", description: "Traditional, centered header" },
  { id: "minimal", name: "Minimal / ATS", description: "Single column, no graphics" },
  { id: "executive", name: "Executive", description: "Compact, structured, modern" },
];

export default function TemplateSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TEMPLATES.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative rounded-xl border p-3 text-left transition-colors ${
              active
                ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/40"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
            }`}
          >
            {active && (
              <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center">
                <Check size={11} className="text-white" />
              </span>
            )}
            <p className="text-sm font-semibold text-white">{t.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
