// src/components/profile/wizard/WizardShell.jsx
import React from "react";
import ProgressBar from "../ui/ProgressBar";
import { theme } from "../ui/theme";

export default function WizardShell({
  stepIndex,
  totalSteps,
  stepLabel,
  isOptionalStep,
  isFirstStep,
  isLastStep,
  saving,
  onBack,
  onSkip,
  onSaveAndContinue,
  onCancel,
  saveError,
  children,
}) {
  return (
    <div className={`${theme.page} flex items-center justify-center p-3 sm:p-6`}>
      <div className={`${theme.card} w-full max-w-3xl overflow-hidden`}>
        {/* Header */}
        <div className="border-b border-white/10 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wide text-violet-400">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <button type="button" onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-300">
              Skip to dashboard
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            {stepLabel}
            {isOptionalStep && <span className="ml-2 align-middle text-xs font-normal text-slate-500">(Optional)</span>}
          </h2>

          <ProgressBar percent={((stepIndex + 1) / totalSteps) * 100} height="h-2" />
        </div>

        {/* Step body */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">{children}</div>

        {saveError && (
          <div className="mx-6 mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200 sm:mx-8">
            Could not save this section: {saveError}
          </div>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 p-6 sm:p-8">
          <button type="button" onClick={onBack} disabled={isFirstStep} className={theme.secondaryBtn}>
            Back
          </button>

          <div className="flex items-center gap-2">
            {isOptionalStep && (
              <button type="button" onClick={onSkip} className={theme.ghostBtn}>
                Skip for now
              </button>
            )}
            <button type="button" onClick={onSaveAndContinue} disabled={saving} className={theme.primaryBtn}>
              {saving ? "Saving…" : isLastStep ? "Finish" : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
