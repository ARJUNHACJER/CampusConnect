import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Modal, Button } from "../../shared/ui/primitives";
import ConflictEventList from "./ConflictEventList";

/**
 * EventConflictModal
 * ---------------------------------------------------------------------------
 * Drives the full "Register" clash flow described in the spec:
 *
 *  Step 1 ("warning"): ⚠️ Event Clash Detected
 *    Buttons: View My Schedule · View Existing Event · Cancel
 *    (or, in strict mode: Registration is blocked — no "Register Anyway")
 *
 *  Step 2 ("confirm"): Confirm Registration
 *    "This event overlaps with another event in your schedule..."
 *    Buttons: Go Back · Register Anyway
 *
 * Registration is only ever created after the Step 2 confirmation
 * (handled by the caller via onConfirmRegister) — this component never
 * auto-registers the student.
 *
 * Props:
 *  - open, onClose
 *  - newEvent: the event the student is trying to register for
 *  - conflicts: array of existing registered events that overlap
 *  - mode: "warning" | "strict"  (admin-configurable, default "warning")
 *  - onConfirmRegister(): called only after explicit "Register Anyway" confirm
 *  - onViewSchedule(): navigate to Schedule
 *  - onViewEvent(event): navigate to an existing event's details
 * ---------------------------------------------------------------------------
 */
export default function EventConflictModal({
  open,
  onClose,
  newEvent,
  conflicts = [],
  mode = "warning",
  onConfirmRegister,
  onViewSchedule,
  onViewEvent,
}) {
  const [step, setStep] = useState("warning");

  useEffect(() => {
    if (open) setStep("warning");
  }, [open]);

  const isStrict = mode === "strict";

  if (step === "confirm") {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Confirm Registration"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStep("warning")}>
              Go Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onConfirmRegister?.();
                onClose?.();
              }}
            >
              Register Anyway
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300 leading-relaxed">
          This event overlaps with another event in your schedule. Are you
          sure you want to continue?
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Event Clash Detected"
      footer={
        isStrict ? (
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setStep("confirm")}>
              Register Anyway
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {isStrict ? (
            <ShieldAlert size={20} className="text-red-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-slate-300 leading-relaxed">
            {isStrict
              ? "You already have another event scheduled during this time. Registration is blocked for overlapping events."
              : "You already have another event scheduled during this time."}
          </p>
        </div>

        <ConflictEventList
          label="Existing Event"
          events={conflicts}
          onViewEvent={onViewEvent}
        />

        {newEvent ? (
          <ConflictEventList label="New Event" events={[newEvent]} />
        ) : null}

        {onViewSchedule ? (
          <button
            onClick={onViewSchedule}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            View My Schedule
          </button>
        ) : null}
      </div>
    </Modal>
  );
}
