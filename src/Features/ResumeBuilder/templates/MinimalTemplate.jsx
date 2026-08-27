import React from "react";
import { SECTION_KEYS } from "../defaultResumeData";
import { buildSectionRenderers } from "./sharedSections";

const cx = {
  title: "text-[12px] font-bold uppercase tracking-wide text-black mb-1.5 mt-3.5 first:mt-0",
  text: "text-[12px] leading-relaxed text-black",
  muted: "text-black font-normal",
  heading: "font-semibold text-black",
};

function Header({ personal }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-black">{personal.fullName || "Your Name"}</h1>
      {personal.title && <p className="text-black mt-0.5">{personal.title}</p>}
      <p className="mt-1.5 text-[11px] text-black">
        {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.portfolio]
          .filter(Boolean)
          .join(" | ")}
      </p>
    </div>
  );
}

// Deliberately plain: no color, no icons, no multi-column layout, so
// applicant tracking systems can parse it reliably.
export default function MinimalTemplate({ data }) {
  const order = data.sectionOrder || [];
  const visible = data.visibleSections || {};
  const renderers = buildSectionRenderers(data, cx);

  return (
    <div className="text-black font-sans">
      <Header personal={data.personal || {}} />
      {order.filter((k) => k !== SECTION_KEYS.personal && visible[k]).map((key) => (
        <React.Fragment key={key}>{renderers[key]?.()}</React.Fragment>
      ))}
    </div>
  );
}
