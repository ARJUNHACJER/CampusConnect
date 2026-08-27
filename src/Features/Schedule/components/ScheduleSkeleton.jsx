import React from "react";

export default function ScheduleSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="h-14 w-full rounded-xl bg-white/10" />
        </div>
      ))}
    </div>
  );
}
