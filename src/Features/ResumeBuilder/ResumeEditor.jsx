import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Printer, Save, CheckCircle2, Eye, PenSquare } from "lucide-react";

import {
  emptyResumeData,
  SECTION_KEYS,
  SECTION_LABELS,
} from "./defaultResumeData";
import { importProfileIntoResume } from "./utils/profileImport";
import { calculateCompletion } from "./utils/completion";
import { downloadResumePdf, printResumeNode } from "./utils/pdfExport";
import { saveResume } from "./resumeService";

import TemplateSelector from "./TemplateSelector";
import ResumePreview from "./ResumePreview";
import ResumeCompletion from "./ResumeCompletion";
import SectionReorder from "./SectionReorder";

import PersonalInfoSection from "./sections/PersonalInfoSection";
import SummarySection from "./sections/SummarySection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import ProjectsSection from "./sections/ProjectsSection";
import ExperienceSection from "./sections/ExperienceSection";
import CertificationsSection from "./sections/CertificationsSection";
import AchievementsSection from "./sections/AchievementsSection";
import ActivitiesSection from "./sections/ActivitiesSection";
import LanguagesSection from "./sections/LanguagesSection";

const SECTION_DATA_KEY = {
  [SECTION_KEYS.summary]: "summary",
  [SECTION_KEYS.education]: "education",
  [SECTION_KEYS.skills]: "skills",
  [SECTION_KEYS.projects]: "projects",
  [SECTION_KEYS.experience]: "experience",
  [SECTION_KEYS.certifications]: "certifications",
  [SECTION_KEYS.achievements]: "achievements",
  [SECTION_KEYS.activities]: "activities",
  [SECTION_KEYS.languages]: "languagesSpoken",
};

const SECTION_COMPONENT = {
  [SECTION_KEYS.summary]: SummarySection,
  [SECTION_KEYS.education]: EducationSection,
  [SECTION_KEYS.skills]: SkillsSection,
  [SECTION_KEYS.projects]: ProjectsSection,
  [SECTION_KEYS.experience]: ExperienceSection,
  [SECTION_KEYS.certifications]: CertificationsSection,
  [SECTION_KEYS.achievements]: AchievementsSection,
  [SECTION_KEYS.activities]: ActivitiesSection,
  [SECTION_KEYS.languages]: LanguagesSection,
};

export default function ResumeEditor({ resume, profile, userId, onBack, onEditProfile, onSaved }) {
  const isNew = !resume?.id;

  const [step, setStep] = useState(isNew ? "import" : "edit");
  const [resumeName, setResumeName] = useState(resume?.resume_name || "");
  const [template, setTemplate] = useState(resume?.template || "modern");
  const [data, setData] = useState(() => resume?.resume_data || emptyResumeData());
  const [mobileView, setMobileView] = useState("edit");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const previewRef = useRef(null);

  const importedFromProfile = useMemo(() => importProfileIntoResume(profile), [profile]);

  const startImport = () => {
    setData(importedFromProfile);
    if (!resumeName) setResumeName("General Resume");
  };

  // Run the import once, lazily, the first time the import step renders.
  useEffect(() => {
    if (isNew) startImport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  const { percentage } = calculateCompletion(data);

  const updateData = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const orderableSections = data.sectionOrder?.filter((k) => k !== SECTION_KEYS.personal) || [];

  const moveSection = (key, direction) => {
    const order = [...data.sectionOrder];
    const idx = order.indexOf(key);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= order.length) return;
    [order[idx], order[swapWith]] = [order[swapWith], order[idx]];
    updateData({ sectionOrder: order });
  };

  const toggleVisible = (key) => {
    updateData({ visibleSections: { ...data.visibleSections, [key]: !data.visibleSections[key] } });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveResume({
        id: resume?.id,
        userId,
        resumeName: resumeName || "Untitled Resume",
        template,
        resumeData: data,
        completionPercentage: percentage,
      });
      setSavedAt(new Date());
      onSaved?.(saved);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    downloadResumePdf(previewRef.current, `${(resumeName || "resume").replace(/\s+/g, "_")}.pdf`);
  };

  const handlePrint = () => printResumeNode(previewRef.current);

  /* ---------------- Step 1: Import Profile ---------------- */

  if (step === "import") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
            <CheckCircle2 size={26} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Profile data imported successfully</h2>
          <p className="text-sm text-slate-400 mt-2">
            We've pulled in your name, contact details, education, skills and more from your
            CampusConnect profile. You can edit anything before your resume is saved — your
            original profile stays untouched.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={onEditProfile || onBack}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setStep("edit")}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Step 2: Edit + Preview ---------------- */

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
          <ArrowLeft size={18} />
        </button>

        <input
          value={resumeName}
          onChange={(e) => setResumeName(e.target.value)}
          placeholder="Resume name"
          className="flex-1 min-w-[180px] bg-transparent text-lg font-semibold text-white focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5"
        />

        <div className="flex items-center gap-2">
          {savedAt && <span className="text-xs text-emerald-400 hidden sm:inline">Saved</span>}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            <Printer size={16} /> <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            <Download size={16} /> <span className="hidden sm:inline">Download PDF</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Resume"}
          </button>
        </div>
      </div>

      {/* Mobile edit/preview toggle */}
      <div className="flex lg:hidden mb-4 rounded-lg bg-white/5 p-1">
        <button
          onClick={() => setMobileView("edit")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium ${
            mobileView === "edit" ? "bg-indigo-600 text-white" : "text-slate-400"
          }`}
        >
          <PenSquare size={14} /> Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium ${
            mobileView === "preview" ? "bg-indigo-600 text-white" : "text-slate-400"
          }`}
        >
          <Eye size={14} /> Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editing panel */}
        <div className={`space-y-4 ${mobileView === "preview" ? "hidden lg:block" : ""}`}>
          <ResumeCompletion data={data} />

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white mb-3">Template</p>
            <TemplateSelector value={template} onChange={setTemplate} />
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d1220] overflow-hidden">
            <div className="px-4 py-3 bg-white/[0.03]">
              <p className="text-sm font-semibold text-white">{SECTION_LABELS[SECTION_KEYS.personal]}</p>
            </div>
            <div className="p-4">
              <PersonalInfoSection data={data.personal} onChange={(v) => updateData({ personal: v })} />
            </div>
          </div>

          {orderableSections.map((key, idx) => {
            const Component = SECTION_COMPONENT[key];
            const dataKey = SECTION_DATA_KEY[key];
            if (!Component) return null;
            return (
              <SectionReorder
                key={key}
                title={SECTION_LABELS[key]}
                visible={data.visibleSections[key]}
                onToggleVisible={() => toggleVisible(key)}
                onMoveUp={() => moveSection(key, "up")}
                onMoveDown={() => moveSection(key, "down")}
                isFirst={idx === 0}
                isLast={idx === orderableSections.length - 1}
              >
                <Component data={data[dataKey]} onChange={(v) => updateData({ [dataKey]: v })} />
              </SectionReorder>
            );
          })}
        </div>

        {/* Live preview */}
        <div className={`${mobileView === "edit" ? "hidden lg:block" : ""} lg:sticky lg:top-6`}>
          <ResumePreview ref={previewRef} data={data} template={template} />
        </div>
      </div>
    </div>
  );
}
