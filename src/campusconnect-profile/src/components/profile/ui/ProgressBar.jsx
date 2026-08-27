// src/components/profile/ui/ProgressBar.jsx
import React from "react";
import { progressBarColor } from "./theme";

export default function ProgressBar({ percent, height = "h-3" }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`w-full ${height} rounded-full bg-white/5 overflow-hidden`}>
      <div
        className={`h-full rounded-full bg-linear-to-r ${progressBarColor(clamped)} transition-all duration-500`}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
