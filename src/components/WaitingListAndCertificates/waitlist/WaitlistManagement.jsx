import React, { useState } from "react";
import { Eye, ArrowUpCircle, UserMinus, Users } from "lucide-react";
import { Card, Badge, Button, Modal, EmptyState, formatDate } from "../shared/ui";

/**
 * Admin → Events → Registrations panel: registration summary + the
 * waitlist queue with per-row actions. `entries` are already the
 * `status === "waiting"` rows for this event, sorted by position.
 *
 * Wire onPromote / onRemove to useWaitlist()'s promoteNextInLine /
 * leaveWaitlist — this component only handles the confirmation UI.
 */
export default function WaitlistManagement({
  event,
  entries,
  onViewStudent,
  onPromote,
  onRemove,
}) {
  const [confirmAction, setConfirmAction] = useState(null); // { type, entry }

  if (!event) return null;

  const available = Math.max(
    0,
    event.maxParticipants - event.registeredCount
  );

  const closeConfirm = () => setConfirmAction(null);

  const runConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === "promote") await onPromote?.(confirmAction.entry);
    if (confirmAction.type === "remove") await onRemove?.(confirmAction.entry);
    closeConfirm();
  };

  return (
    <div className="space-y-5">
      {/* Registration Summary */}
      <Card className="grid grid-cols-3 divide-x divide-white/5 p-0">
        <SummaryStat
          label="Registered"
          value={`${event.registeredCount} / ${event.maxParticipants}`}
        />
        <SummaryStat label="Waitlist" value={entries.length} />
        <SummaryStat label="Available" value={available} />
      </Card>

      {/* Waitlist Table */}
      <Card className="overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">Waitlist</h3>
        </div>

        {entries.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No one is waitlisted"
              description="Students will appear here once the event reaches capacity."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Position</th>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 font-medium text-white">
                      #{entry.position}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {entry.studentName}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {formatDate(entry.joinedAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={entry.status}>{entry.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <IconAction
                          label="View Student"
                          icon={Eye}
                          onClick={() => onViewStudent?.(entry)}
                        />
                        <IconAction
                          label="Promote Student"
                          icon={ArrowUpCircle}
                          onClick={() =>
                            setConfirmAction({ type: "promote", entry })
                          }
                        />
                        <IconAction
                          label="Remove from Waitlist"
                          icon={UserMinus}
                          tone="danger"
                          onClick={() =>
                            setConfirmAction({ type: "remove", entry })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!confirmAction}
        onClose={closeConfirm}
        title={
          confirmAction?.type === "promote"
            ? "Promote Student?"
            : "Remove from Waitlist?"
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === "remove" ? "danger" : "primary"}
              onClick={runConfirm}
            >
              {confirmAction?.type === "promote" ? "Promote" : "Remove"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-400">
          {confirmAction?.type === "promote" ? (
            <>
              Offer the available seat to{" "}
              <span className="font-medium text-slate-200">
                {confirmAction?.entry?.studentName}
              </span>
              ? They'll get a time-limited offer to accept.
            </>
          ) : (
            <>
              Remove{" "}
              <span className="font-medium text-slate-200">
                {confirmAction?.entry?.studentName}
              </span>{" "}
              from the waitlist? Remaining positions will be recalculated.
            </>
          )}
        </p>
      </Modal>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function IconAction({ icon: Icon, label, onClick, tone = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-lg p-1.5 transition-colors ${
        tone === "danger"
          ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}
