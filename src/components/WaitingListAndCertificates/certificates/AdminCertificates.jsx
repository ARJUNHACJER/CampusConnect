import React, { useMemo, useState } from "react";
import { Award, CheckCircle2, Clock, CalendarCheck, ShieldOff } from "lucide-react";
import { Card, Badge, Button, Modal, EmptyState } from "../shared/ui";
import CertificateGenerationModal from "./CertificateGenerationModal";
import { useCertificates } from "../hooks/useCertificates";

/**
 * Route: /admin/certificates — gate this route so students can't reach it
 * (see Role-Based Access notes in the README / Supabase RLS policies).
 *
 * `completedEvents` and each event's `roster` (attendance + result per
 * student) come from the host app's real event/attendance data — this
 * component only owns the certificate generation/publish/revoke UI.
 */
export default function AdminCertificates({ completedEvents = [] }) {
  const { certificates, generateCertificates, publishCertificates, revokeCertificate, loading } =
    useCertificates();

  const [selectedEventId, setSelectedEventId] = useState(
    completedEvents[0]?.id ?? null
  );
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);

  const selectedEvent = completedEvents.find((e) => e.id === selectedEventId);
  const roster = selectedEvent?.roster || [];
  const eligible = roster.filter((r) => r.attendance === "Present");

  const dashboardStats = useMemo(() => {
    const generated = certificates.filter((c) =>
      ["generated", "published"].includes(c.status)
    ).length;
    const pending = certificates.filter((c) => c.status === "draft").length;
    return {
      total: certificates.length,
      generated,
      pending,
      events: completedEvents.length,
    };
  }, [certificates, completedEvents.length]);

  const certForStudent = (studentId) =>
    certificates.find(
      (c) => c.eventId === selectedEventId && c.studentId === studentId
    );

  const handleGenerate = async () => {
    const typeByStudentId = Object.fromEntries(
      eligible.map((r) => [r.id, r.result === "Winner" ? "winner" : "participation"])
    );
    const created = await generateCertificates(
      selectedEventId,
      selectedEvent.title,
      eligible,
      typeByStudentId
    );
    await publishCertificates(created.map((c) => c.id));
    setShowGenerateModal(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">🏆 Certificates</h1>
        <p className="mt-1 text-sm text-slate-400">
          Generate, publish, and manage certificates for completed events.
        </p>
      </div>

      {/* Dashboard */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Award} label="Total Certificates" value={dashboardStats.total} />
        <StatCard icon={CheckCircle2} label="Generated" value={dashboardStats.generated} />
        <StatCard icon={Clock} label="Pending" value={dashboardStats.pending} />
        <StatCard icon={CalendarCheck} label="Events" value={dashboardStats.events} />
      </div>

      {completedEvents.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No completed events yet"
          description="Certificates can be generated once an event is marked completed."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
          {/* Event selector */}
          <Card className="h-fit divide-y divide-white/5 overflow-hidden">
            {completedEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`block w-full px-4 py-3 text-left text-sm transition-colors ${
                  ev.id === selectedEventId
                    ? "bg-indigo-500/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {ev.title}
              </button>
            ))}
          </Card>

          {/* Roster + actions */}
          {selectedEvent ? (
            <div className="space-y-4">
              <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {selectedEvent.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Participants: {roster.length} · Eligible: {eligible.length}
                  </p>
                </div>
                <Button onClick={() => setShowGenerateModal(true)}>
                  Generate Certificates
                </Button>
              </Card>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3 font-semibold">Student</th>
                        <th className="px-5 py-3 font-semibold">Attendance</th>
                        <th className="px-5 py-3 font-semibold">Result</th>
                        <th className="px-5 py-3 font-semibold">Certificate</th>
                        <th className="px-5 py-3 font-semibold text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((r) => {
                        const cert = certForStudent(r.id);
                        return (
                          <tr
                            key={r.id}
                            className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                          >
                            <td className="px-5 py-3 text-slate-200">
                              {r.name}
                            </td>
                            <td className="px-5 py-3 text-slate-400">
                              {r.attendance}
                            </td>
                            <td className="px-5 py-3 text-slate-400">
                              {r.result || "—"}
                            </td>
                            <td className="px-5 py-3">
                              {cert ? (
                                <Badge tone={cert.status}>{cert.status}</Badge>
                              ) : r.attendance === "Present" ? (
                                <Badge tone="draft">not generated</Badge>
                              ) : (
                                <Badge tone="cancelled">not eligible</Badge>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right">
                              {cert && cert.status !== "revoked" ? (
                                <button
                                  onClick={() => setRevokeTarget(cert)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                  title="Revoke Certificate"
                                  aria-label="Revoke Certificate"
                                >
                                  <ShieldOff size={16} />
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      )}

      <CertificateGenerationModal
        open={showGenerateModal}
        eligibleCount={eligible.length}
        eventTitle={selectedEvent?.title}
        loading={loading}
        onCancel={() => setShowGenerateModal(false)}
        onConfirm={handleGenerate}
      />

      <RevokeModal
        target={revokeTarget}
        loading={loading}
        onCancel={() => setRevokeTarget(null)}
        onConfirm={async () => {
          await revokeCertificate(revokeTarget.id);
          setRevokeTarget(null);
        }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
        <Icon size={16} className="text-indigo-400" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </Card>
  );
}

function RevokeModal({ target, loading, onCancel, onConfirm }) {
  return (
    <Modal
      open={!!target}
      onClose={onCancel}
      title="Revoke Certificate?"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Revoking…" : "Revoke"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-400">
        This certificate will no longer be considered valid. Revoked
        certificates will show as{" "}
        <span className="text-slate-200">"Certificate Revoked"</span> on the
        public verification page.
      </p>
    </Modal>
  );
}
