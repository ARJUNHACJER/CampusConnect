import React, { useState } from "react";
import { Trophy, Award, Medal, Sparkles } from "lucide-react";
import { Card, EmptyState, LoadingState } from "../shared/ui";
import CertificateCard from "./CertificateCard";
import CertificateDetails from "./CertificateDetails";
import { useCertificates } from "../hooks/useCertificates";
import { generateCertificatePDF } from "./CertificatePDFGenerator";

/**
 * Route: /certificates
 * Top-level student page. Add a "🏆 Certificates" item to the existing
 * sidebar NAV_SECTIONS (STUDENT TOOLKIT or its own group) pointing here —
 * do not nest this inside ProfilePage.
 */
export default function CertificatesHub({ studentId }) {
  const { myCertificates, summary, loading } = useCertificates(studentId);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (certificate) => {
    setDownloadingId(certificate.id);
    try {
      await generateCertificatePDF(certificate);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Certificates</h1>
        <p className="mt-1 text-sm text-slate-400">
          View and download certificates you've earned through CampusConnect.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard icon={Trophy} label="Total Certificates" value={summary.total} />
        <SummaryCard icon={Award} label="Participation" value={summary.participation} />
        <SummaryCard icon={Medal} label="Achievements" value={summary.achievements} />
        <SummaryCard
          icon={Sparkles}
          label="Latest Certificate"
          value={summary.latest?.eventName || "—"}
          small
        />
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingState label="Loading your certificates…" />
      ) : myCertificates.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No certificates yet"
          description="Certificates you earn from CampusConnect events will show up here once they're published."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myCertificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onView={setActiveCertificate}
              onDownload={handleDownload}
              downloading={downloadingId === cert.id}
            />
          ))}
        </div>
      )}

      <CertificateDetails
        open={!!activeCertificate}
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
        onDownload={handleDownload}
        downloading={downloadingId === activeCertificate?.id}
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, small = false }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
        <Icon size={16} className="text-indigo-400" />
      </div>
      <p
        className={`font-bold text-white ${
          small ? "truncate text-sm" : "text-2xl"
        }`}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </Card>
  );
}
