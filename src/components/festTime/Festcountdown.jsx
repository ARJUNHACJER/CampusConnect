import React from "react";
import { useCountdown } from "./useCountdown";

/* =========================================================
   FEST CONFIG
   -----------------------------------------------------------
   Single configurable source of truth for fest timing. Nothing
   else in the app should hardcode this date — when this becomes
   admin/Supabase-configured, only this block (or the props
   passed into <FestCountdown />) needs to change.

   Offset is baked into the string as Asia/Kolkata (IST, UTC+5:30)
   so the countdown is correct regardless of the viewer's device
   timezone.
========================================================= */

export const FEST_START_TIME = "2026-09-11T10:00:00+05:30";
// Not known yet — wire this up once the fest's end time is finalized,
// e.g. "2026-09-13T20:00:00+05:30". Leaving it null keeps the
// countdown in the "upcoming" -> "live" cycle only.
export const FEST_END_TIME = null;

const FEST_START_LABEL = "September 11, 2026 • 10:00 AM";

/* =========================================================
   COUNTDOWN BLOCK
   -----------------------------------------------------------
   Unchanged from the original dashboard — same classes, same
   sizing, same spacing.
========================================================= */

function CountdownBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center px-2">
      <span className="text-lg sm:text-xl font-bold tabular-nums bg-slate-800/80 rounded-md px-2 py-0.5 min-w-[2.5rem] text-center">
        {String(value).padStart(2, "0")}
      </span>

      <span className="text-[10px] uppercase tracking-wide text-slate-400 mt-1">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   FEST COUNTDOWN
   -----------------------------------------------------------
   Drop-in replacement for the old hardcoded countdown markup.
   Same outer container classes/design as before — only the
   values are now live, and a "Sec" block was added since a
   real-time countdown needs to visibly tick.

   startTime / endTime are props so this can later be swapped
   from the hardcoded constants above to an admin/Supabase value,
   e.g. <FestCountdown startTime={fest.start_time} endTime={fest.end_time} />
========================================================= */

export default function FestCountdown({
  startTime = FEST_START_TIME,
  endTime = FEST_END_TIME,
  startLabel = FEST_START_LABEL,
}) {
  const start = useCountdown(startTime);
  const end = useCountdown(endTime);

  const festHasEnded = Boolean(endTime) && end.isOver;
  const festIsLive = start.isOver && !festHasEnded;

  // ---- FEST ENDED ----
  if (festHasEnded) {
    return (
      <div className="flex items-center gap-3 bg-[#131a2b] border border-white/10 rounded-2xl px-4 py-2.5">
        <span className="text-sm font-semibold text-white whitespace-nowrap">
          ✨ FEST ENDED
        </span>
        <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
          Thank you for participating!
        </span>
      </div>
    );
  }

  // ---- FEST LIVE ----
  if (festIsLive) {
    return (
      <div className="flex items-center gap-3 bg-[#131a2b] border border-white/10 rounded-2xl px-4 py-2.5">
        <span className="text-sm font-semibold text-emerald-400 whitespace-nowrap">
          🎉 FEST IS LIVE!
        </span>
        <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
          Welcome to Campus Fest 2026
        </span>
      </div>
    );
  }

  // ---- UPCOMING (default) ----
  return (
    <div className="flex items-center gap-3 bg-[#131a2b] border border-white/10 rounded-2xl px-4 py-2.5">
      <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
        Fest starts in
      </span>

      <div className="flex items-center gap-1">
        <CountdownBlock value={start.days} label="Days" />

        <span className="text-slate-500 pb-4">:</span>

        <CountdownBlock value={start.hours} label="Hrs" />

        <span className="text-slate-500 pb-4">:</span>

        <CountdownBlock value={start.minutes} label="Min" />

        <span className="text-slate-500 pb-4">:</span>

        <CountdownBlock value={start.seconds} label="Sec" />
      </div>

      <span className="text-[10px] text-slate-500 whitespace-nowrap hidden xl:inline ml-1">
        {startLabel}
      </span>
    </div>
  );
}