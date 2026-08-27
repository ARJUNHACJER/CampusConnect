import React from "react";
import { Modal, Button } from "../shared/ui";

/**
 * Shared confirmation modal for both the "Join Waitlist" and
 * "Leave Waitlist" flows — the copy and button labels flip based on `mode`.
 */
export default function WaitlistConfirmationModal({
  open,
  mode = "join", // "join" | "leave"
  eventTitle,
  loading = false,
  onCancel,
  onConfirm,
}) {
  const isJoin = mode === "join";

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isJoin ? "Join Waitlist?" : "Leave Waitlist?"}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {isJoin ? "Cancel" : "Keep My Position"}
          </Button>
          <Button
            variant={isJoin ? "primary" : "danger"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? "Please wait…"
              : isJoin
              ? "Join Waitlist"
              : "Leave Waitlist"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-400">
        {isJoin ? (
          <>
            You'll be added to the waiting list for{" "}
            <span className="text-slate-200 font-medium">{eventTitle}</span>.
            If a seat becomes available, you'll be notified.
          </>
        ) : (
          <>
            You will lose your current position in the waitlist for{" "}
            <span className="text-slate-200 font-medium">{eventTitle}</span>.
          </>
        )}
      </p>
    </Modal>
  );
}
