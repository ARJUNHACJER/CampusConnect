import React from "react";
import { Modal, Button } from "../shared/ui";

/**
 * "Generate certificates for N eligible participants?" confirmation used
 * from AdminCertificates.jsx before bulk-generating.
 */
export default function CertificateGenerationModal({
  open,
  eligibleCount,
  eventTitle,
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Generate Certificates?"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? "Generating…" : "Generate"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-400">
        Generate certificates for{" "}
        <span className="font-medium text-slate-200">
          {eligibleCount} eligible participants
        </span>{" "}
        {eventTitle ? (
          <>
            in <span className="font-medium text-slate-200">{eventTitle}</span>
          </>
        ) : null}
        ? Certificates are created as <span className="text-slate-300">drafts</span> —
        you'll publish them separately to notify students.
      </p>
    </Modal>
  );
}
