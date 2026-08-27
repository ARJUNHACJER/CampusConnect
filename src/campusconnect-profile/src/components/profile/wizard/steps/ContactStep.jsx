// src/components/profile/wizard/steps/ContactStep.jsx
import React from "react";
import FormField from "../../ui/FormField";
import { theme } from "../../ui/theme";

export default function ContactStep({ data, errors, onChange, basicData }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={theme.label}>
            Email <span className="text-orange-400">*</span>
          </label>
          <div className={`${theme.inputWrap} opacity-70`}>
            <span className="text-slate-500 text-sm shrink-0">📧</span>
            <span className={theme.input}>{basicData?.email || "—"}</span>
          </div>
          {errors.email && <p className={theme.errorText}>{errors.email}</p>}
          <p className={theme.helpText}>Edit this in Basic Information.</p>
        </div>
        <div>
          <label className={theme.label}>Phone Number</label>
          <div className={`${theme.inputWrap} opacity-70`}>
            <span className="text-slate-500 text-sm shrink-0">📱</span>
            <span className={theme.input}>{basicData?.phone || "—"}</span>
          </div>
          {errors.phone && <p className={theme.errorText}>{errors.phone}</p>}
          <p className={theme.helpText}>Edit this in Basic Information. Optional here.</p>
        </div>
      </div>

      <FormField label="College / Institution Email" type="email" value={data.collegeEmail} onChange={set("collegeEmail")} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FormField label="City" value={data.city} onChange={set("city")} />
        <FormField label="State" value={data.state} onChange={set("state")} />
        <FormField label="Country" value={data.country} onChange={set("country")} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Emergency Contact Name" value={data.emergencyName} onChange={set("emergencyName")} help="Optional" />
        <FormField label="Emergency Contact Number" value={data.emergencyPhone} onChange={set("emergencyPhone")} help="Optional" />
      </div>
    </div>
  );
}
