import React from "react";

export default function SummarySection({ data, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">
        Professional Summary
      </label>
      <textarea
        rows={4}
        maxLength={400}
        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60"
        placeholder="A 2–4 line summary of who you are and what you're looking for..."
        value={data || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-1 text-[11px] text-slate-500">{(data || "").length}/400</p>
    </div>
  );
}
