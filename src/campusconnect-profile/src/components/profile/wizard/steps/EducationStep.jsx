// src/components/profile/wizard/steps/EducationStep.jsx
//
// This is the step that makes the profile work for every student type.
// Selecting an education type swaps in only the fields relevant to it —
// nothing is hardcoded for B.Tech/Diploma.

import React from "react";
import FormField from "../../ui/FormField";
import { EDUCATION_TYPES, getEducationFields } from "../../../../lib/educationConfig";

export default function EducationStep({ data, errors, onChange }) {
  const setType = (type) => onChange({ type, fields: {} }); // reset fields when type changes
  const setField = (key) => (val) => onChange({ ...data, fields: { ...data.fields, [key]: val } });

  const fields = data.type ? getEducationFields(data.type) : [];

  return (
    <div className="space-y-5">
      <FormField
        label="Education Type"
        as="select"
        required
        value={data.type}
        onChange={setType}
        error={errors.type}
        options={EDUCATION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
        help="Choose the level that best describes what you're currently studying."
      />

      {data.type && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 sm:p-5 space-y-5">
          <p className="text-xs text-violet-300">
            Showing fields for: <strong>{EDUCATION_TYPES.find((t) => t.value === data.type)?.label}</strong>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields.map((f) => (
              <FormField
                key={f.key}
                label={f.label}
                required={f.required}
                type={f.type}
                options={f.options}
                placeholder={f.placeholder}
                suggestions={f.suggestions}
                value={data.fields?.[f.key]}
                onChange={setField(f.key)}
                error={errors[f.key]}
                inputMode={f.key === "cgpaPercentage" ? "decimal" : undefined}
                pattern={f.key === "cgpaPercentage" ? "[0-9]+(\\.[0-9]{1,2})?" : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
