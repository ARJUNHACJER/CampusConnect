import React from "react";
import { formatDate } from "../shared/ui";

/**
 * Prominent "Your Position: #N" display. Used in the post-join success
 * state and on the My Registrations "Waitlisted" cards.
 */
export default function WaitlistPosition({ position, joinedAt, size = "md" }) {
  const big = size === "lg";
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/5 px-6 py-4 text-center">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Your Position
      </span>
      <span
        className={`font-bold text-white ${big ? "text-4xl" : "text-2xl"}`}
      >
        #{position}
      </span>
      {joinedAt ? (
        <span className="text-xs text-slate-500">
          Joined {formatDate(joinedAt)}
        </span>
      ) : null}
    </div>
  );
}
