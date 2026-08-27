import React from "react";
import { CERTIFICATE_TYPE_LABELS } from "../shared/mockData";
import { formatDate } from "../shared/ui";

const TITLE_BY_TYPE = {
  participation: "Certificate of Participation",
  winner: "Certificate of Achievement — Winner",
  runner_up: "Certificate of Achievement — Runner-up",
  achievement: "Certificate of Achievement",
  volunteer: "Certificate of Volunteering",
};

/**
 * The visual certificate itself — landscape, bordered, branded. Used both
 * for on-screen preview (CertificateDetails) and as the layout reference
 * for CertificatePDFGenerator. Kept purely presentational / print-safe
 * (no dark theme here — certificates render on a light background).
 */
export default function CertificatePreview({ certificate }) {
  const typeInfo =
    CERTIFICATE_TYPE_LABELS[certificate.type] ||
    CERTIFICATE_TYPE_LABELS.participation;
  const title = TITLE_BY_TYPE[certificate.type] || TITLE_BY_TYPE.participation;
  const templateClass = certificate.template === "modern" ? "border-emerald-700" : certificate.template === "minimal" ? "border-slate-700" : "border-indigo-900/80";

  return (
    <div
      className="relative mx-auto aspect-[1.414/1] w-full max-w-3xl bg-white p-3 text-slate-900 shadow-xl"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Outer + inner border */}
      <div className={`flex h-full flex-col items-center justify-between border-4 border-double p-8 text-center ${templateClass}`}>
        {/* Brand */}
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-700">
            CAMPUSCONNECT
          </p>
          <div className="mx-auto mt-3 mb-1 h-px w-24 bg-indigo-900/30" />
          <h1 className="mt-4 text-2xl font-bold uppercase tracking-wide text-indigo-950 sm:text-3xl">
            {title}
          </h1>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            This certificate is proudly presented to
          </p>
          <p className="my-2 text-3xl font-bold text-indigo-950 sm:text-4xl">
            {certificate.recipientName}
          </p>
          <p className="max-w-md text-sm text-slate-600">
            for {typeInfo.label.toLowerCase()} in
          </p>
          <p className="text-lg font-semibold text-slate-800">
            {certificate.eventName}
          </p>
        </div>

        {/* Footer */}
        <div className="grid w-full grid-cols-3 items-end gap-4 text-xs text-slate-500">
          <div className="text-left">
            <div className="mb-1 h-8 border-b border-slate-300" />
            Organizer Signature
          </div>
          <div>
            <p className="font-medium text-slate-700">
              {formatDate(certificate.issueDate, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
              {certificate.certificateId}
            </p>
          </div>
          <div className="text-right">
            <div className="mb-1 h-8 border-b border-slate-300" />
            Faculty Signature
          </div>
        </div>
      </div>
    </div>
  );
}
