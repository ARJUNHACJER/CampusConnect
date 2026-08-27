import React from "react";

/**
 * Shared skeleton-loading kit for CampusConnect (Admin + Student).
 * -----------------------------------------------------------------------
 * Matches the existing design system used across the app:
 *   - shimmer blocks: `bg-white/10` on `animate-pulse` containers
 *   - cards:          `rounded-2xl border border-white/10 bg-white/5`
 *   - dark surface:   #0b0f1a / #0d1220
 *
 * These components are intentionally presentational and `aria-hidden`, so
 * screen readers announce the real content once it loads instead of the
 * placeholder. Use them ONLY while data is loading; on error, render a real
 * error state (never an infinite skeleton).
 */

/** Base shimmer block. Compose everything else from this. */
export function Skeleton({ className = "" }) {
  return <div className={`rounded bg-white/10 ${className}`} />;
}

/** A pulsing wrapper — put Skeleton blocks inside it. */
export function SkeletonPulse({ className = "", children }) {
  return (
    <div className={`animate-pulse ${className}`} aria-hidden="true">
      {children}
    </div>
  );
}

/** N lines of fake text; the last line is shorter to look natural. */
export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** A generic content card skeleton (title + body + footer meta). */
export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-3 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

/** A stat/KPI tile skeleton (icon + number + label). */
export function SkeletonStatCard() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/** A row of stat cards. */
export function SkeletonStatGrid({ count = 4, className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

/** A grid of content cards (events, opportunities, certificates...). */
export function SkeletonCardGrid({ count = 6, columns = "sm:grid-cols-2 lg:grid-cols-3", className = "" }) {
  return (
    <div className={`grid grid-cols-1 ${columns} gap-4 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** A stacked list of card skeletons. */
export function SkeletonList({ count = 4, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * A table skeleton with a header row and body rows.
 * Wrapped in the same card chrome the real admin tables use.
 */
export function SkeletonTable({ rows = 6, columns = 5, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${className}`}
      aria-hidden="true"
    >
      {/* header */}
      <div className="animate-pulse border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      {/* body */}
      <div className="animate-pulse divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-3 flex-1 ${c === 0 ? "max-w-[40%]" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A profile skeleton (avatar + fields). */
export function SkeletonProfile({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
