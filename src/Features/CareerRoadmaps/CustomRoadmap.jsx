import React, { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  fetchRoadmaps,
  fetchRoadmapStructure,
  selectTopicsForCustomRoadmap,
  createCustomRoadmap,
} from "../../services/roadmapService";

const experienceLevels = ["Beginner", "Intermediate", "Advanced"];

export default function CustomRoadmap({ userId, onBack, onCreated }) {
  const [form, setForm] = useState({
    careerGoal: "",
    currentSkills: "",
    experienceLevel: "Beginner",
    hoursPerDay: 2,
    targetDuration: "3 months",
    targetRole: "",
    baseRoadmapTitle: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError("Log in to create a custom roadmap.");
      return;
    }
    if (!form.careerGoal.trim() || !form.targetRole.trim()) {
      setError("Career goal and target role are required.");
      return;
    }
    if (!Number.isFinite(Number(form.hoursPerDay)) || Number(form.hoursPerDay) <= 0) {
      setError("Hours per day must be greater than 0.");
      return;
    }
    if (!/^[0-9]+\s*(day|week|month)s?$/i.test(form.targetDuration.trim())) {
      setError("Use a duration such as 3 months, 6 weeks, or 30 days.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Match the closest existing roadmap by title/category as the content source.
      const roadmaps = await fetchRoadmaps();
      const base =
        roadmaps.find((r) =>
          r.title.toLowerCase().includes(form.targetRole.toLowerCase())
        ) || roadmaps[0];

      if (!base) throw new Error("No base roadmap available");

      const structure = await fetchRoadmapStructure(base.id);

      // Rough day-budget from target duration (weeks/months -> days).
      const durationMatch = form.targetDuration.match(/(\d+)\s*(day|week|month)/i);
      let targetDurationDays = 90;
      if (durationMatch) {
        const n = parseInt(durationMatch[1], 10);
        const unit = durationMatch[2].toLowerCase();
        targetDurationDays = unit.startsWith("day") ? n : unit.startsWith("week") ? n * 7 : n * 30;
      }

      const topicIds = selectTopicsForCustomRoadmap(structure, {
        hoursPerDay: Number(form.hoursPerDay) || 1,
        targetDurationDays,
      });

      const created = await createCustomRoadmap(userId, form, base.id, topicIds);
      onCreated?.(created, base);
    } catch (e) {
      console.error(e);
      setError("Unable to create your custom roadmap. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4"
      >
        <ArrowLeft size={16} /> Back to Roadmaps
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-indigo-400" />
          <h1 className="text-lg font-bold text-white">Create Custom Roadmap</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Tell us your goal and we'll build a personalized path from our existing roadmap content.
        </p>

        {!userId ? (
          <p className="text-sm text-slate-500">Log in to create a custom roadmap.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Career Goal">
              <input
                required
                value={form.careerGoal}
                onChange={update("careerGoal")}
                placeholder="e.g. Become a backend developer"
                className="input"
              />
            </Field>

            <Field label="Target Job / Role">
              <input
                required
                value={form.targetRole}
                onChange={update("targetRole")}
                placeholder="e.g. Full Stack Developer"
                className="input"
              />
            </Field>

            <Field label="Current Skills">
              <textarea
                value={form.currentSkills}
                onChange={update("currentSkills")}
                placeholder="e.g. HTML, CSS, basic JavaScript"
                rows={2}
                className="input resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Experience Level">
                <select value={form.experienceLevel} onChange={update("experienceLevel")} className="input">
                  {experienceLevels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Hours per Day">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={form.hoursPerDay}
                  onChange={update("hoursPerDay")}
                  className="input"
                />
              </Field>
            </div>

            <Field label="Target Duration">
              <input
                value={form.targetDuration}
                onChange={update("targetDuration")}
                placeholder="e.g. 3 months"
                className="input"
              />
            </Field>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-sm font-medium px-4 py-2.5 rounded-xl text-white bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Creating your roadmap..." : "Generate My Roadmap"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.6rem 0.9rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
        .input:focus { border-color: rgba(99,102,241,0.5); }
        .input::placeholder { color: rgb(100,116,139); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
