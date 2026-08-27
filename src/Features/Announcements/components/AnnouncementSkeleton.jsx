import React from "react";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-48 rounded bg-white/10" />
      </div>
      <div className="h-3 w-full rounded bg-white/10" />
      <div className="h-3 w-2/3 rounded bg-white/10" />
      <div className="flex gap-4 pt-1">
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="h-3 w-16 rounded bg-white/10" />
        <div className="h-3 w-14 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function AnnouncementSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
