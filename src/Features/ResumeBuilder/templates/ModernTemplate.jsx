import React from "react";
import { SECTION_KEYS } from "../defaultResumeData";
import { buildSectionRenderers } from "./sharedSections";

const cx = {
  title: "text-[13px] font-bold uppercase tracking-wider text-indigo-700 mb-2 mt-4 first:mt-0",
  text: "text-[12px] leading-relaxed text-gray-700",
  muted: "text-gray-500 font-normal",
  heading: "font-semibold text-[#1f2430]",
};

function Header({ personal }) {
  return (
    <div className="mb-5 pb-4 border-b-2 border-indigo-600">
      <h1 className="text-3xl font-bold tracking-tight text-[#1f2430]">{personal.fullName || "Your Name"}</h1>
      {personal.title && <p className="text-indigo-600 font-medium mt-0.5">{personal.title}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-600">
        {personal.email && <span>{personal.email}</span>}
        {personal.phone && <span>{personal.phone}</span>}
        {personal.location && <span>{personal.location}</span>}
        {personal.linkedin && <span>{personal.linkedin}</span>}
        {personal.github && <span>{personal.github}</span>}
        {personal.portfolio && <span>{personal.portfolio}</span>}
      </div>
    </div>
  );
}

export default function ModernTemplate({ data }) {
  const order = data.sectionOrder || [];
  const visible = data.visibleSections || {};
  const renderers = buildSectionRenderers(data, cx);

  return (
    <div className="text-[#1f2430] font-sans">
      <Header personal={data.personal || {}} />
      {order.filter((k) => k !== SECTION_KEYS.personal && visible[k]).map((key) => (
        <React.Fragment key={key}>{renderers[key]?.()}</React.Fragment>
      ))}
    </div>
  );
}
