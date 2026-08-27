// src/components/profile/wizard/steps/InstitutionStep.jsx
import React from "react";
import FormField from "../../ui/FormField";

const INDIAN_CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kochi", "Bhopal", "Visakhapatnam", "Chandigarh"];
const INDIAN_STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

export default function InstitutionStep({ data, errors, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-5">
      <FormField label="College / School Name" required value={data.name} onChange={set("name")} error={errors.name} />
      <FormField label="Campus Location" value={data.campusLocation} onChange={set("campusLocation")} placeholder="e.g. North Campus" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FormField label="City" value={data.city} onChange={set("city")} suggestions={INDIAN_CITIES} />
        <FormField label="State" value={data.state} onChange={set("state")} suggestions={INDIAN_STATES} />
      </div>

      <FormField label="Institution Website" value={data.website} onChange={set("website")} placeholder="https://" />
      <FormField label="Institution Code / ID" value={data.code} onChange={set("code")} help="If your institution has an official code (AISHE, AICTE, etc.)" />
    </div>
  );
}
