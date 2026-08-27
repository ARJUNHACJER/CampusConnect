import React from "react";
import { CheckCircle2, XCircle, ShieldOff, Search } from "lucide-react";
import { Card, Badge, LoadingState, formatDate } from "../shared/ui";

/**
 * Route: /certificates/verify/:certificateId
 * Public-facing (no auth) — pass the resolved certificate in as a prop
 * from whatever data-loader your router uses, e.g.:
 *
 *   const { certificateId } = useParams();
 *   const certificate = getByCertificateId(certificateId); // from useCertificates()
 */
export default function CertificateVerification({ certificateId, certificate, loading = false }) {
  if (loading) return <LoadingState label="Verifying certificate…" />;

  if (!certificate) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <XCircle size={36} className="text-red-400" />
          <h1 className="text-lg font-semibold text-white">
            Certificate Not Found
          </h1>
          <p className="text-sm text-slate-400">
            We couldn't find a certificate matching{" "}
            <span className="font-mono text-slate-300">{certificateId}</span>.
            Double-check the ID and try again.
          </p>
        </Card>
      </div>
    );
  }

  const isRevoked = certificate.status === "revoked";

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        {isRevoked ? (
          <ShieldOff size={36} className="text-red-400" />
        ) : (
          <CheckCircle2 size={36} className="text-emerald-400" />
        )}

        <h1 className="text-lg font-semibold text-white">
          {isRevoked ? "Certificate Revoked" : "Certificate Verified ✓"}
        </h1>

        <div className="w-full space-y-3 rounded-xl bg-white/5 p-5 text-left text-sm">
          <Row label="Certificate ID" value={certificate.certificateId} mono />
          <Row label="Recipient" value={certificate.recipientName} />
          <Row label="Event" value={certificate.eventName} />
          <Row label="Issued" value={formatDate(certificate.issueDate)} />
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Status</span>
            <Badge tone={isRevoked ? "revoked" : "registered"}>
              {isRevoked ? "Revoked" : "Valid"}
            </Badge>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Search size={12} />
          Verified against CampusConnect's certificate records
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right text-slate-200 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
