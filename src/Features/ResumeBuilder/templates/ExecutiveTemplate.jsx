import React from "react";
import { SECTION_KEYS } from "../defaultResumeData";
import { buildSectionRenderers } from "./sharedSections";

const cx = {
  title: "text-[12px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2 mt-4 first:mt-0",
  text: "text-[11px] leading-relaxed text-slate-700 break-words",
  muted: "text-slate-500 font-normal break-words",
  heading: "font-semibold text-slate-900 break-words",
};

export default function ExecutiveTemplate({ data }) {
  const renderers = buildSectionRenderers(data, cx);
  const order = data.sectionOrder || [];
  const visible = data.visibleSections || {};
  const personal = data.personal || {};

  return (
    <div className="font-sans text-slate-800">
      <header className="mb-5 grid grid-cols-[1fr_auto] gap-5 border-b-4 border-emerald-700 pb-4">
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-bold tracking-tight text-slate-900">{personal.fullName || "Your Name"}</h1>
          {personal.title && <p className="mt-1 break-words text-sm font-medium text-emerald-700">{personal.title}</p>}
        </div>
        <div className="max-w-[230px] break-words text-right text-[10px] leading-relaxed text-slate-600">
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join(" | ")}
        </div>
      </header>
      {order.filter((key) => key !== SECTION_KEYS.personal && visible[key]).map((key) => (
        <React.Fragment key={key}>{renderers[key]?.()}</React.Fragment>
      ))}
    </div>
  );
}
