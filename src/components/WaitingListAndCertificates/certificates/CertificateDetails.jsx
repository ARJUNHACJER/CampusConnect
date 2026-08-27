import React from "react";
import { Download } from "lucide-react";
import { Modal, Button, Badge, formatDate } from "../shared/ui";
import CertificatePreview from "./CertificatePreview";

/** "View Certificate" modal — full preview plus metadata and download CTA. */
export default function CertificateDetails({
  open,
  certificate,
  onClose,
  onDownload,
  downloading = false,
}) {
  if (!certificate) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Certificate"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onDownload?.(certificate)}
            disabled={downloading}
          >
            <Download size={16} />
            {downloading ? "Preparing…" : "Download PDF"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <CertificatePreview certificate={certificate} />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm">
          <div>
            <p className="text-slate-500">Certificate ID</p>
            <p className="font-mono text-slate-200">
              {certificate.certificateId}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Issued</p>
            <p className="text-slate-200">
              {formatDate(certificate.issueDate)}
            </p>
          </div>
          <Badge tone={certificate.status}>{certificate.status}</Badge>
        </div>
      </div>
    </Modal>
  );
}
