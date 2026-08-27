import React, { useState } from "react";
import { PartyPopper, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal, Button } from "../shared/ui";

/**
 * Covers the full "seat became available" flow:
 *   1. offer      – "A Seat Is Available!" with Accept Seat / View Event
 *   2. clash       – "Schedule Conflict" warning (warning-only policy: the
 *                    student must explicitly confirm to proceed)
 *   3. confirm     – "Confirm Registration"
 *   4. success     – "Registration Confirmed"
 *
 * `hasClash` is passed in by the parent after running the existing event
 * clash detector — this component never runs that check itself.
 */
export default function SeatOfferModal({
  open,
  onClose,
  eventTitle,
  hasClash = false,
  loading = false,
  onAccept, // called once the student has passed/acknowledged the clash step
  onViewEvent,
}) {
  const [step, setStep] = useState("offer"); // offer | clash | confirm | success

  if (!open) return null;

  const reset = () => {
    setStep("offer");
    onClose?.();
  };

  if (step === "offer") {
    return (
      <Modal
        open={open}
        onClose={reset}
        title="🎉 A Seat Is Available!"
        footer={
          <>
            <Button variant="secondary" onClick={onViewEvent}>
              View Event
            </Button>
            <Button
              onClick={() => setStep(hasClash ? "clash" : "confirm")}
            >
              Accept Seat
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-400">
          A seat has become available for{" "}
          <span className="font-medium text-slate-200">{eventTitle}</span>.
          You are next in the waitlist.
        </p>
      </Modal>
    );
  }

  if (step === "clash") {
    return (
      <Modal
        open={open}
        onClose={reset}
        title="⚠️ Schedule Conflict"
        footer={
          <>
            <Button variant="secondary" onClick={reset}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setStep("confirm")}>
              Register Anyway
            </Button>
          </>
        }
      >
        <div className="flex gap-3 rounded-xl bg-amber-500/10 p-3 ring-1 ring-inset ring-amber-500/20">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <p className="text-sm text-amber-100/90">
            You have another event scheduled at this time. You can still
            continue, but please confirm you want to accept this seat anyway.
          </p>
        </div>
      </Modal>
    );
  }

  if (step === "confirm") {
    return (
      <Modal
        open={open}
        onClose={reset}
        title="Confirm Registration"
        footer={
          <>
            <Button variant="secondary" onClick={reset} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await onAccept?.();
                setStep("success");
              }}
              disabled={loading}
            >
              {loading ? "Registering…" : "Confirm Registration"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-400">
          A seat is available for you. Would you like to register for{" "}
          <span className="font-medium text-slate-200">{eventTitle}</span>?
        </p>
      </Modal>
    );
  }

  // success
  return (
    <Modal
      open={open}
      onClose={reset}
      title="✓ Registration Confirmed"
      footer={
        <Button onClick={reset}>
          <PartyPopper size={16} />
          Done
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <CheckCircle2 size={32} className="text-emerald-400" />
        <p className="text-sm text-slate-400">
          You have successfully registered for{" "}
          <span className="font-medium text-slate-200">{eventTitle}</span>.
        </p>
      </div>
    </Modal>
  );
}
