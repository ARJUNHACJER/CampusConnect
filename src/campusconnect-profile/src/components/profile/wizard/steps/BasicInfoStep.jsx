// src/components/profile/wizard/steps/BasicInfoStep.jsx
import React from "react";
import FormField from "../../ui/FormField";

const PROFILE_AVATARS = ["👤", "🎓", "💻", "🎨", "🚀", "📚", "🧑‍💼", "🌟"];

export default function BasicInfoStep({ data, errors, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Profile Photo</label>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-slate-500">
            {data.photo || "👤"}
          </div>
          <div className="flex flex-wrap gap-2">
            {PROFILE_AVATARS.map((avatar) => (
              <button key={avatar} type="button" onClick={() => set("photo")(avatar)} className={`h-9 w-9 rounded-full border text-lg ${data.photo === avatar ? "border-violet-400 bg-violet-500/20" : "border-white/10 bg-white/5"}`} aria-label={`Choose ${avatar} avatar`}>
                {avatar}
              </button>
            ))}
          </div>
        </div>
      </div>

      <FormField label="Full Name" required value={data.fullName} onChange={set("fullName")} error={errors.fullName} placeholder="As per college records" />
      <FormField label="Display Name" value={data.displayName} onChange={set("displayName")} help="How your name appears to others on CampusConnect." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Date of Birth" type="date" value={data.dob} onChange={set("dob")} />
        <FormField label="Gender" as="select" value={data.gender} onChange={set("gender")} options={["Female", "Male", "Non-binary", "Prefer not to say"]} />
      </div>

      <FormField label="Email" type="email" required value={data.email} onChange={set("email")} error={errors.email} placeholder="something@college.edu" />
      <FormField label="Phone Number" required value={data.phone} onChange={set("phone")} error={errors.phone} placeholder="10-digit mobile number" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Alternate Phone" value={data.altPhone} onChange={set("altPhone")} />
        <FormField
          label="Preferred Language"
          as="select"
          value={data.preferredLanguage}
          onChange={set("preferredLanguage")}
          options={["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Other"]}
        />
      </div>
    </div>
  );
}
