// src/components/profile/wizard/ProfileWizard.jsx
//
// Usage: <ProfileWizard startAtSection="education" onFinish={...} onCancel={...} />
// Reads/writes through useProfile(), so it works whether it's launched from
// the post-login ProfileCompletionGate or from an "Edit" button on a
// ProfilePage section card.

import React, { useState } from "react";
import WizardShell from "./WizardShell";
import BasicInfoStep from "./steps/BasicInfoStep";
import EducationStep from "./steps/EducationStep";
import InstitutionStep from "./steps/InstitutionStep";
import ContactStep from "./steps/ContactStep";
import SkillsStep from "./steps/SkillsStep";
import CareerStep from "./steps/CareerStep";
import AchievementsStep from "./steps/AchievementsStep";
import PortfolioStep from "./steps/PortfolioStep";
import PreferencesStep from "./steps/PreferencesStep";
import { useProfile } from "../../../context/useProfile";
import { SECTION_VALIDATORS } from "../../../lib/profileValidation";
import { OPTIONAL_SECTIONS } from "../../../lib/profileCompletion";

// Wizard order exactly as specified: Basic -> Education -> Institution ->
// Contact -> Skills -> Career -> Achievements -> Portfolio -> Preferences.
const STEPS = [
  { key: "basic", label: "Basic Information", Component: BasicInfoStep },
  { key: "education", label: "Education", Component: EducationStep },
  { key: "institution", label: "Institution", Component: InstitutionStep },
  { key: "contact", label: "Contact", Component: ContactStep },
  { key: "skills", label: "Skills & Interests", Component: SkillsStep },
  { key: "career", label: "Career & Goals", Component: CareerStep },
  { key: "achievements", label: "Achievements", Component: AchievementsStep },
  { key: "portfolio", label: "Portfolio", Component: PortfolioStep },
  { key: "preferences", label: "Preferences", Component: PreferencesStep },
];

export default function ProfileWizard({ startAtSection, onFinish, onCancel }) {
  const { profile, updateSection, saving, saveError } = useProfile();

  const startIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === startAtSection)
  );
  const [stepIndex, setStepIndex] = useState(startIndex === -1 ? 0 : startIndex);

  // Local drafts, seeded from the current profile, kept alive for the whole
  // wizard session so navigating back and forth never loses unsaved edits.
  const [drafts, setDrafts] = useState(() => {
    const seed = {};
    STEPS.forEach(({ key }) => {
      seed[key] = profile[key];
    });
    return seed;
  });
  const [errors, setErrors] = useState({});

  const step = STEPS[stepIndex];
  const isOptionalStep = OPTIONAL_SECTIONS.includes(step.key);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  const setDraft = (sectionData) => {
    setDrafts((prev) => ({ ...prev, [step.key]: sectionData }));
  };

  const validateCurrentStep = () => {
    const validator = SECTION_VALIDATORS[step.key];
    const stepErrors =
      step.key === "contact" ? validator(drafts.contact, drafts.basic) : validator(drafts[step.key]);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goTo = (index) => setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));

  const handleBack = () => {
    setErrors({});
    goTo(stepIndex - 1);
  };

  const handleSkip = () => {
    setErrors({});
    if (isLastStep) {
      onFinish?.();
    } else {
      goTo(stepIndex + 1);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateCurrentStep()) return;

    try {
      await updateSection(step.key, drafts[step.key]);
    } catch {
      return;
    }

    if (isLastStep) {
      onFinish?.();
    } else {
      setErrors({});
      goTo(stepIndex + 1);
    }
  };

  const StepComponent = step.Component;

  return (
    <WizardShell
      stepIndex={stepIndex}
      totalSteps={STEPS.length}
      stepLabel={step.label}
      isOptionalStep={isOptionalStep}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      saving={saving}
      saveError={saveError}
      onBack={handleBack}
      onSkip={handleSkip}
      onSaveAndContinue={handleSaveAndContinue}
      onCancel={onCancel}
    >
      <StepComponent
        data={drafts[step.key]}
        errors={errors}
        onChange={setDraft}
        // ContactStep needs read-only visibility into Basic's email/phone.
        basicData={step.key === "contact" ? drafts.basic : undefined}
      />
    </WizardShell>
  );
}
