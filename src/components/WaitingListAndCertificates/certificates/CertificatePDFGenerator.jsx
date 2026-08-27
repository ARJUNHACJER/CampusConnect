import { CERTIFICATE_TYPE_LABELS } from "../shared/mockData";

/* ==========================================================================
   CertificatePDFGenerator
   Generates an actual landscape PDF (via jsPDF) — vector text and shapes,
   not a screenshot of the HTML preview. Mirrors the layout of
   CertificatePreview.jsx so the on-screen and downloaded versions match.

   Install once in the host project:
     npm install jspdf
   ========================================================================== */

const TITLE_BY_TYPE = {
  participation: "Certificate of Participation",
  winner: "Certificate of Achievement - Winner",
  runner_up: "Certificate of Achievement - Runner-up",
  achievement: "Certificate of Achievement",
  volunteer: "Certificate of Volunteering",
};

/**
 * Builds and triggers a download of the certificate as a landscape A4 PDF.
 * Returns the generated Blob in case the caller wants to also upload it
 * to Supabase Storage and persist `pdfUrl`.
 */
export async function generateCertificatePDF(certificate) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageW = doc.internal.pageSize.getWidth(); // 297
  const pageH = doc.internal.pageSize.getHeight(); // 210
  const margin = 12;

  const indigo = [49, 46, 129]; // approx indigo-950
  const slate500 = [100, 116, 139];
  const slate700 = [51, 65, 85];

  // Outer border
  doc.setDrawColor(...indigo);
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, pageW - margin * 2, pageH - margin * 2);

  // Inner border (double-line effect)
  const inner = margin + 3;
  doc.setLineWidth(0.4);
  doc.rect(inner, inner, pageW - inner * 2, pageH - inner * 2);

  const centerX = pageW / 2;

  // Brand
  doc.setTextColor(...indigo);
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("CAMPUSCONNECT", centerX, margin + 16, { align: "center" });

  doc.setLineWidth(0.3);
  doc.line(centerX - 20, margin + 20, centerX + 20, margin + 20);

  // Title
  const typeInfo =
    CERTIFICATE_TYPE_LABELS[certificate.type] ||
    CERTIFICATE_TYPE_LABELS.participation;
  const title = TITLE_BY_TYPE[certificate.type] || TITLE_BY_TYPE.participation;
  doc.setFontSize(24);
  doc.text(title.toUpperCase(), centerX, margin + 34, { align: "center" });

  // Body copy
  doc.setTextColor(...slate500);
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text("This certificate is proudly presented to", centerX, pageH / 2 - 16, {
    align: "center",
  });

  doc.setTextColor(...indigo);
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.text(certificate.recipientName, centerX, pageH / 2 - 2, {
    align: "center",
  });

  doc.setTextColor(...slate500);
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text(
    `for ${typeInfo.label.toLowerCase()} in`,
    centerX,
    pageH / 2 + 10,
    { align: "center" }
  );

  doc.setTextColor(...slate700);
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.text(certificate.eventName, centerX, pageH / 2 + 20, {
    align: "center",
  });

  // Footer: signatures + date/id
  const footerY = pageH - margin - 16;
  doc.setDrawColor(...slate500);
  doc.setLineWidth(0.2);

  // Organizer signature (left)
  doc.line(margin + 14, footerY, margin + 74, footerY);
  doc.setFontSize(8.5);
  doc.setTextColor(...slate500);
  doc.text("Organizer Signature", margin + 44, footerY + 5, {
    align: "center",
  });

  // Faculty signature (right)
  doc.line(pageW - margin - 74, footerY, pageW - margin - 14, footerY);
  doc.text("Faculty Signature", pageW - margin - 44, footerY + 5, {
    align: "center",
  });

  // Date + Certificate ID (center)
  const issueDate = new Date(certificate.issueDate).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );
  doc.setTextColor(...slate700);
  doc.setFontSize(10);
  doc.text(issueDate, centerX, footerY - 2, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...slate500);
  doc.text(certificate.certificateId, centerX, footerY + 5, {
    align: "center",
  });

  const filename = `${certificate.certificateId}.pdf`;
  doc.save(filename);

  return doc.output("blob");
}

/**
 * Convenience hook-like wrapper for components that need loading state
 * around the (async, dynamically-imported) PDF generation call.
 */
export function useCertificatePDFDownload() {
  return async function download(certificate, { onStart, onFinish } = {}) {
    onStart?.();
    try {
      await generateCertificatePDF(certificate);
    } finally {
      onFinish?.();
    }
  };
}
