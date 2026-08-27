import React, { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, X } from "lucide-react";
import { OPPORTUNITY_TYPES, WORK_MODES, MODE_LABEL_TO_DB, MODE_DB_TO_LABEL } from "../../../data/opportunityConstants";
import { getOpportunityById } from "../../../services/opportunitiesService";

const EMPTY_FORM = {
  title: "",
  type: "internship",
  organization: "",
  logoInitials: "",
  description: "",
  responsibilities: "",
  eligibility: "",
  requiredSkills: "",
  preferredSkills: "",
  duration: "",
  stipend: "",
  prize: "",
  location: "",
  mode: "Online",
  deadline: "",
  applicationUrl: "",
  contact: "",
};

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-colors";

/**
 * CreateOpportunity
 * Route: /admin/opportunities/create
 *
 * Local form state — on submit this is mapped onto the `opportunities`
 * table columns (see supabase/migrations/001_opportunities.sql). The
 * caller's onSaveDraft/onPublish should pass the payload straight to
 * opportunitiesService.createOpportunity() (or updateOpportunity() when
 * editing).
 */
export default function CreateOpportunity({ onBack, onSaveDraft, onPublish, opportunityId }) {
  const isEditing = Boolean(opportunityId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState("");

  // When editing, hydrate the form from the existing row. Without this the
  // form would open blank and "Save Changes" would wipe the opportunity.
  useEffect(() => {
    if (!opportunityId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getOpportunityById(opportunityId)
      .then((row) => {
        if (cancelled || !row) return;
        setForm({
          ...EMPTY_FORM,
          title: row.title || "",
          type: row.type || "internship",
          organization: row.organization || "",
          description: row.description || "",
          eligibility: row.eligibility && row.eligibility !== "All Students" ? row.eligibility : "",
          requiredSkills: Array.isArray(row.skills) ? row.skills.join(", ") : "",
          stipend: row.stipend && row.stipend !== "Not specified" ? row.stipend : "",
          location: row.location && row.location !== "Not specified" ? row.location : "",
          mode: MODE_DB_TO_LABEL[row.mode] || "Online",
          deadline: row.deadline || "",
          applicationUrl: row.apply_url || "",
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Could not load this opportunity.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [opportunityId]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const buildPayload = (status) => {
    const skills = [
      ...form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      ...form.preferredSkills.split(",").map((s) => s.trim()).filter(Boolean),
    ];
    return {
      title: form.title,
      type: form.type,
      organization: form.organization,
      description: form.description,
      eligibility: form.eligibility || "All Students",
      skills,
      stipend: form.stipend || form.prize || "Not specified",
      location: form.location || "Not specified",
      mode: MODE_LABEL_TO_DB[form.mode] || "onsite",
      deadline: form.deadline || null,
      apply_url: form.applicationUrl || null,
      status,
      is_active: status !== "draft",
    };
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.organization.trim()) next.organization = "Organization is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.deadline) next.deadline = "Application deadline is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(buildPayload("draft"));
  };

  const handlePublish = () => {
    if (!validate()) return;
    onPublish?.(buildPayload("published"));
  };

  const BackButton = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
    >
      <ArrowLeft size={16} />
      Back to Manage Opportunities
    </button>
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        {BackButton}
        <div className="py-20 text-center text-sm text-slate-400">Loading opportunity…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        {BackButton}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {BackButton}

      <div className="flex items-center gap-2 mb-6">
        <Briefcase size={20} className="text-indigo-400" />
        <h1 className="text-2xl font-bold text-white">{isEditing ? "Edit Opportunity" : "Create Opportunity"}</h1>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
        {/* Basics */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Opportunity Title" required>
            <input
              className={inputClass}
              value={form.title}
              onChange={update("title")}
              placeholder="e.g. Frontend Developer Intern"
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </Field>
          <Field label="Opportunity Type" required>
            <select className={inputClass} value={form.type} onChange={update("type")}>
              {OPPORTUNITY_TYPES.filter((t) => t.id !== "all").map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0d1220]">
                  {t.label.replace(/s$/, "")}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Organization" required>
            <input
              className={inputClass}
              value={form.organization}
              onChange={update("organization")}
              placeholder="e.g. Nimbus Technologies"
            />
            {errors.organization && <p className="text-xs text-red-400 mt-1">{errors.organization}</p>}
          </Field>
          <Field label="Logo / Banner" hint="Upload wiring is UI-only for now.">
            <input type="file" className={`${inputClass} py-2 cursor-pointer`} />
          </Field>
        </div>

        <Field label="Description" required>
          <textarea
            rows={4}
            className={inputClass}
            value={form.description}
            onChange={update("description")}
            placeholder="What is this opportunity about?"
          />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
        </Field>

        <Field label="Responsibilities" hint="One responsibility per line.">
          <textarea
            rows={3}
            className={inputClass}
            value={form.responsibilities}
            onChange={update("responsibilities")}
            placeholder={"Build and maintain React components\nCollaborate with the design team"}
          />
        </Field>

        <Field label="Eligibility">
          <input
            className={inputClass}
            value={form.eligibility}
            onChange={update("eligibility")}
            placeholder="e.g. All Students, or 3rd & 4th Year Students"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Required Skills" hint="Comma-separated.">
            <input
              className={inputClass}
              value={form.requiredSkills}
              onChange={update("requiredSkills")}
              placeholder="React, JavaScript, HTML/CSS"
            />
          </Field>
          <Field label="Preferred Skills" hint="Comma-separated.">
            <input
              className={inputClass}
              value={form.preferredSkills}
              onChange={update("preferredSkills")}
              placeholder="TypeScript, Tailwind CSS"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Duration">
            <input
              className={inputClass}
              value={form.duration}
              onChange={update("duration")}
              placeholder="e.g. 3 months"
            />
          </Field>
          <Field label="Stipend">
            <input
              className={inputClass}
              value={form.stipend}
              onChange={update("stipend")}
              placeholder="e.g. ₹15,000/month"
            />
          </Field>
          <Field label="Prize / Package">
            <input
              className={inputClass}
              value={form.prize}
              onChange={update("prize")}
              placeholder="e.g. ₹50,000 prize pool"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Location">
            <input
              className={inputClass}
              value={form.location}
              onChange={update("location")}
              placeholder="e.g. Remote, or Bengaluru, India"
            />
          </Field>
          <Field label="Work Mode">
            <select className={inputClass} value={form.mode} onChange={update("mode")}>
              {WORK_MODES.map((m) => (
                <option key={m} value={m} className="bg-[#0d1220]">
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Application Deadline" required>
            <input
              type="date"
              className={inputClass}
              value={form.deadline}
              onChange={update("deadline")}
            />
            {errors.deadline && <p className="text-xs text-red-400 mt-1">{errors.deadline}</p>}
          </Field>
          <Field label="Application URL">
            <input
              className={inputClass}
              value={form.applicationUrl}
              onChange={update("applicationUrl")}
              placeholder="https://"
            />
          </Field>
        </div>

        <Field label="Contact Information">
          <input
            className={inputClass}
            value={form.contact}
            onChange={update("contact")}
            placeholder="e.g. careers@company.com"
          />
        </Field>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-200"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-200"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold text-white transition-colors"
        >
          {isEditing ? "Save Changes" : "Publish Opportunity"}
        </button>
      </div>
    </div>
  );
}
