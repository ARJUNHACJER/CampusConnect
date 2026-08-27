import React from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "../../shared/ui/primitives";
import { formatTimeRange } from "./ConflictEventList";

/**
 * EventClashWarning
 * ---------------------------------------------------------------------------
 * Two presentation modes:
 *
 *  <EventClashWarning.Banner conflicts={[...]} onViewSchedule={...} />
 *    Proactive warning shown on Event Details, above the Register button,
 *    before the student even clicks Register.
 *
 *  <EventClashWarning.Badge />
 *    Subtle inline badge for Browse Events cards / My Registrations rows.
 * ---------------------------------------------------------------------------
 */
function Banner({ conflicts = [], onViewSchedule }) {
  if (!conflicts.length) return null;
  const first = conflicts[0];

  return (
    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 px-4 py-3.5 flex items-start gap-3">
      <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-300">Schedule Conflict</p>
        <p className="text-xs text-amber-200/80 mt-1">
          You have another registered event from{" "}
          <span className="font-medium">
            {formatTimeRange(first.startTime, first.endTime)}
          </span>
          {conflicts.length > 1 ? ` (and ${conflicts.length - 1} more)` : ""}.
        </p>
        {onViewSchedule ? (
          <button
            onClick={onViewSchedule}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 mt-2 underline underline-offset-2"
          >
            View Schedule
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InlineBadge({ className = "" }) {
  return (
    <Badge tone="amber" className={className}>
      <AlertTriangle size={11} />
      Conflicts with your schedule
    </Badge>
  );
}

const EventClashWarning = { Banner, Badge: InlineBadge };
export default EventClashWarning;
