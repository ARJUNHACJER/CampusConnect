import React from "react";
import { SECTION_KEYS } from "../defaultResumeData";
import { buildSectionRenderers } from "./sharedSections";

const cx = {
  title: "text-[12px] font-bold uppercase tracking-[0.15em] text-[#1f2430] border-b border-gray-300 pb-1 mb-2 mt-4 first:mt-0",
  text: "text-[12px] leading-relaxed text-gray-800",
  muted: "text-gray-500 font-normal",
  heading: "font-semibold text-[#1f2430]",
};

function Header({ personal }) {
  return (
    <div className="mb-4 text-center">
      <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1f2430]">{personal.fullName || "Your Name"}</h1>
      {personal.title && <p className="text-gray-600 mt-0.5 text-sm">{personal.title}</p>}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-600">
        {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.portfolio]
          .filter(Boolean)
          .map((item, i, arr) => (
            <span key={item}>
              {item}
              {i < arr.length - 1 && <span className="text-gray-400"> | </span>}
            </span>
          ))}
      </div>
    </div>
  );
}

export default function ProfessionalTemplate({ data }) {
  const order = data.sectionOrder || [];
  const visible = data.visibleSections || {};
  const renderers = buildSectionRenderers(data, cx);

  return (
    <div className="text-[#1f2430] font-serif">
      <Header personal={data.personal || {}} />
      {order.filter((k) => k !== SECTION_KEYS.personal && visible[k]).map((key) => (
        <React.Fragment key={key}>{renderers[key]?.()}</React.Fragment>
      ))}
    </div>
  );
}
