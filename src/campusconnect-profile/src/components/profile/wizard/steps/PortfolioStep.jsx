// src/components/profile/wizard/steps/PortfolioStep.jsx
import React from "react";
import FormField from "../../ui/FormField";

export default function PortfolioStep({ data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-400 -mt-1">Optional — link anything you'd like other students to see.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="GitHub" value={data.github} onChange={set("github")} placeholder="https://github.com/username" />
        <FormField label="LinkedIn" value={data.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/username" />
        <FormField label="Portfolio Website" value={data.website} onChange={set("website")} placeholder="https://" />
        <FormField label="Behance" value={data.behance} onChange={set("behance")} />
        <FormField label="LeetCode" value={data.leetcode} onChange={set("leetcode")} />
        <FormField label="CodeChef" value={data.codechef} onChange={set("codechef")} />
        <FormField label="HackerRank" value={data.hackerrank} onChange={set("hackerrank")} />
        <FormField label="Other Link" value={data.other} onChange={set("other")} />
      </div>
    </div>
  );
}
