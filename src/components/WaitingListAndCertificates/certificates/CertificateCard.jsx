import React from "react";
import { Eye, Download } from "lucide-react";
import { Card, Badge, Button, formatDate } from "../shared/ui";
import { CERTIFICATE_TYPE_LABELS } from "../shared/mockData";

/**
 * Single certificate card for the CertificatesHub grid.
 * Desktop: 3/row · Tablet: 2/row · Mobile: 1/row full-width buttons
 * (grid classes live on the parent grid container in CertificatesHub.jsx).
 */
export default function CertificateCard({
  certificate,
  onView,
  onDownload,
  downloading = false,
}) {
  const typeInfo =
    CERTIFICATE_TYPE_LABELS[certificate.type] ||
    CERTIFICATE_TYPE_LABELS.participation;

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <div className="relative flex h-32 items-center justify-center bg-linear-to-br from-indigo-500/20 via-purple-600/10 to-transparent">
        <span className="text-4xl">{typeInfo.icon}</span>
        <div className="absolute bottom-2 right-2">
          <Badge tone={certificate.status}>{certificate.status}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold text-white">
            {certificate.eventName}
          </h3>
          <p className="mt-1 text-xs font-medium text-indigo-300">
            {typeInfo.icon} {typeInfo.label}
          </p>
        </div>

        <div className="space-y-1 text-xs text-slate-500">
          <p>Issued: {formatDate(certificate.issueDate)}</p>
          <p className="truncate">
            Certificate ID:{" "}
            <span className="font-mono text-slate-400">
              {certificate.certificateId}
            </span>
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
          <Button
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => onView?.(certificate)}
          >
            <Eye size={14} />
            View Certificate
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onDownload?.(certificate)}
            disabled={downloading}
          >
            <Download size={14} />
            {downloading ? "Preparing…" : "Download PDF"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
