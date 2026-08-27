import React, { forwardRef } from "react";
import ModernTemplate from "./templates/ModernTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";

const TEMPLATE_COMPONENTS = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
};

// A4 at 96dpi ≈ 794 x 1123px. We render at that fixed width and let the
// container scale it down responsively so it always looks like a real page.
const ResumePreview = forwardRef(function ResumePreview({ data, template }, ref) {
  const Template = TEMPLATE_COMPONENTS[template] || ModernTemplate;

  return (
    <div className="w-full overflow-x-auto">
      <div
        ref={ref}
        id="resume-preview-page"
        className="mx-auto box-border min-h-[1123px] bg-white shadow-2xl shadow-black/40"
        style={{ width: "794px", padding: "48px" }}
      >
        <Template data={data} />
      </div>
    </div>
  );
});

export default ResumePreview;
