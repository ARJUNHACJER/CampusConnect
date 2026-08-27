import React from "react";
import { AlertCircle } from "lucide-react";
import { calculateCompletion } from "./utils/completion";

export default function ResumeCompletion({ data }) {
  const { percentage, suggestions } = calculateCompletion(data);

  const barColor =
    percentage >= 80 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-white">Resume Completion</p>
        <span className="text-sm font-bold text-white">{percentage}%</span>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {suggestions.map((s) => (
            <li key={s} className="flex items-start gap-1.5 text-xs text-slate-400">
              <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
