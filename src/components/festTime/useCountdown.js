import { useEffect, useState } from "react";

/* =========================================================
   useCountdown
   -----------------------------------------------------------
   Generic, reusable countdown hook.

   Pass an ISO datetime string that includes its own UTC offset
   (e.g. "2026-09-11T10:00:00+05:30" for IST) and this hook will
   return the remaining time, ticking once per second.

   Because the target string carries its own offset, the diff
   against Date.now() (which is timezone-agnostic, always UTC
   under the hood) is correct no matter what timezone the
   viewer's device/browser is set to — no timezone library
   required, and no DST concerns since IST has none.
========================================================= */

function getRemainingMs(targetTime) {
  if (!targetTime) return 0;
  const targetMs = new Date(targetTime).getTime();
  if (Number.isNaN(targetMs)) return 0;
  return Math.max(0, targetMs - Date.now());
}

export function useCountdown(targetTime) {
  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(targetTime)
  );

  useEffect(() => {
    // Re-sync immediately whenever the target changes (e.g. fest date
    // gets swapped in later from an admin/Supabase source).
    setRemainingMs(getRemainingMs(targetTime));

    if (!targetTime) {
      return undefined;
    }

    // Single interval, cleared on unmount / target change — no leaks,
    // no duplicate timers.
    const intervalId = setInterval(() => {
      setRemainingMs(getRemainingMs(targetTime));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetTime]);

  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
    isOver: remainingMs <= 0,
  };
}