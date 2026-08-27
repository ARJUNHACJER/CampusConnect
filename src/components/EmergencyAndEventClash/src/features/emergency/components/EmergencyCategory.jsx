import React from "react";
import ContactCard from "./ContactCard";

const TONE_TEXT = {
  red: "text-red-400",
  amber: "text-amber-400",
  indigo: "text-indigo-400",
  neutral: "text-slate-400",
};

/**
 * EmergencyCategory
 * ---------------------------------------------------------------------------
 * Renders one category section (e.g. Security, Medical) with its contacts.
 * Returns null if the category has no active contacts — never shows an
 * empty/broken-looking section.
 * ---------------------------------------------------------------------------
 */
export default function EmergencyCategory({ category, contacts }) {
  if (!contacts || contacts.length === 0) return null;

  const Icon = category.icon;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={TONE_TEXT[category.tone] || "text-slate-400"} />
        <h2 className="text-sm font-semibold text-white">{category.label}</h2>
        <span className="text-xs text-slate-500">({contacts.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </section>
  );
}
