import React from "react";

export default function ProgressBar({ percent = 0, size = "md", showLabel = false }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const height = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-400">Progress</span>
          <span className="text-xs font-semibold text-indigo-300">{clamped}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-white/10 overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
