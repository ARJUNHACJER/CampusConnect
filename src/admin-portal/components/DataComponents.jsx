import React from "react";
import { CheckCircle2, Eye, Award, Users, FileBadge } from "lucide-react";
import { StatusBadge, Field, inputClass, PrimaryButton, SecondaryButton, EmptyState } from "./AdminUI";
import { announcementCategories, announcementPriorities } from "../data/mockData";

/* ============================== RegistrationTable ============================== */

/** Small tri-state checkbox that supports an indeterminate visual. */
function SelectCheckbox({ checked, indeterminate, onChange, label }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !checked && indeterminate;
  }, [checked, indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 bg-white/5 text-indigo-500 accent-indigo-500"
    />
  );
}

/** Status-aware action buttons shared by desktop rows and mobile cards. */
function RegistrationActions({ r, onMarkAttendance, onUpdateStatus, size = "sm" }) {
  const base =
    size === "sm"
      ? "px-2.5 py-1.5 rounded-lg text-xs font-medium"
      : "flex-1 rounded-xl px-3 py-2 text-xs font-medium";
  return (
    <>
      {r.status === "Pending" && (
        <>
          <button onClick={() => onUpdateStatus(r, "accepted")} className={`${base} text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20`}>Accept</button>
          <button onClick={() => onUpdateStatus(r, "rejected")} className={`${base} text-red-300 bg-red-500/10 hover:bg-red-500/20`}>Reject</button>
        </>
      )}
      {r.status === "Accepted" && (
        <button onClick={() => onMarkAttendance(r)} className={`${base} inline-flex items-center justify-center gap-1 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20`}>
          <CheckCircle2 size={13} /> Mark Attended
        </button>
      )}
      {r.status === "Rejected" && (
        <button onClick={() => onUpdateStatus(r, "accepted")} className={`${base} text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20`}>Accept</button>
      )}
    </>
  );
}

export function RegistrationTable({
  registrations,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  someSelected,
  onView,
  onMarkAttendance,
  onUpdateStatus,
}) {
  if (registrations.length === 0) {
    return <EmptyState icon={Users} title="No registrations found" description="Try a different filter or search term." />;
  }

  const isSelected = (id) => !!selectedIds && selectedIds.has(id);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">
                <SelectCheckbox checked={!!allSelected} indeterminate={!!someSelected} onChange={onToggleSelectAll} label="Select all registrations" />
              </th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Roll No</th>
              <th className="px-4 py-3 font-medium">Branch</th>
              <th className="px-4 py-3 font-medium">Year</th>
              <th className="px-4 py-3 font-medium">Program</th>
              <th className="px-4 py-3 font-medium">Registered On</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id} className={`border-t border-white/5 hover:bg-white/[0.03] ${isSelected(r.id) ? "bg-indigo-500/5" : ""}`}>
                <td className="px-4 py-3">
                  <SelectCheckbox checked={isSelected(r.id)} onChange={() => onToggleSelect(r.id)} label={`Select ${r.studentName}`} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{r.studentName}</p>
                  {r.email && r.email !== "-" && <p className="text-xs text-slate-500">{r.email}</p>}
                </td>
                <td className="px-4 py-3 text-slate-300">{r.roll}</td>
                <td className="px-4 py-3 text-slate-300">{r.branch}</td>
                <td className="px-4 py-3 text-slate-300">{r.year}</td>
                <td className="px-4 py-3 text-slate-300">{r.program}</td>
                <td className="px-4 py-3 text-slate-300">{r.registeredAt}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onView(r)} title="View student details" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                      <Eye size={15} />
                    </button>
                    <RegistrationActions r={r} onMarkAttendance={onMarkAttendance} onUpdateStatus={onUpdateStatus} size="sm" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {registrations.map((r) => (
          <div key={r.id} className={`rounded-xl border p-4 ${isSelected(r.id) ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <SelectCheckbox checked={isSelected(r.id)} onChange={() => onToggleSelect(r.id)} label={`Select ${r.studentName}`} />
                <div>
                  <p className="text-sm font-semibold text-white">{r.studentName}</p>
                  {r.email && r.email !== "-" && <p className="text-xs text-slate-500">{r.email}</p>}
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-400">
              <span>Roll: <span className="text-slate-300">{r.roll}</span></span>
              <span>Year: <span className="text-slate-300">{r.year}</span></span>
              <span>Branch: <span className="text-slate-300">{r.branch}</span></span>
              <span>Program: <span className="text-slate-300">{r.program}</span></span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Registered {r.registeredAt}</p>
            <div className="flex gap-2 mt-3">
              <SecondaryButton className="flex-1 py-2 text-xs" onClick={() => onView(r)}>View</SecondaryButton>
              <RegistrationActions r={r} onMarkAttendance={onMarkAttendance} onUpdateStatus={onUpdateStatus} size="md" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================================== StudentTable ================================== */

export function StudentTable({ students, onViewProfile, onViewHistory }) {
  if (students.length === 0) {
    return <EmptyState icon={Users} title="No students found" description="Try adjusting your search or filters." />;
  }

  return (
    <>
      <div className="hidden md:block rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs text-slate-400">
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Year</th>
              <th className="px-4 py-3 font-medium">Registrations</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.email} • {s.collegeId}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{s.department}</td>
                <td className="px-4 py-3 text-slate-300">{s.year}</td>
                <td className="px-4 py-3 text-slate-300">{s.registrations}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onViewProfile(s)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10">
                      Profile
                    </button>
                    <button onClick={() => onViewHistory(s)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10">
                      History
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {students.map((s) => (
          <div key={s.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{s.name}</p>
                <p className="text-xs text-slate-500">{s.collegeId}</p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <p className="text-xs text-slate-400 mt-2">{s.department} · {s.year}</p>
            <p className="text-xs text-slate-500">{s.registrations} registrations</p>
            <div className="flex gap-2 mt-3">
              <SecondaryButton className="flex-1 py-2 text-xs" onClick={() => onViewProfile(s)}>Profile</SecondaryButton>
              <SecondaryButton className="flex-1 py-2 text-xs" onClick={() => onViewHistory(s)}>History</SecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================================ AnnouncementForm ================================ */

export function AnnouncementForm({ onSaveDraft, onPublish, onCancel }) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    category: announcementCategories[0],
    priority: "Normal",
    publishDate: "",
    attachment: "",
  });
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 lg:p-7 space-y-5">
      <Field label="Title" required>
        <input className={inputClass} placeholder="e.g. Registrations open: Cultural Fest" value={form.title} onChange={update("title")} />
      </Field>
      <Field label="Description" required>
        <textarea rows={4} className={inputClass} placeholder="Announcement details..." value={form.description} onChange={update("description")} />
      </Field>
      <div className="grid sm:grid-cols-3 gap-5">
        <Field label="Category">
          <select className={inputClass} value={form.category} onChange={update("category")}>
            {announcementCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select className={inputClass} value={form.priority} onChange={update("priority")}>
            {announcementPriorities.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Publish Date">
          <input type="date" className={inputClass} value={form.publishDate} onChange={update("publishDate")} />
        </Field>
      </div>
      <Field label="Attachment" hint="Optional — PDF, image, or link">
        <input className={inputClass} placeholder="Optional attachment reference" value={form.attachment} onChange={update("attachment")} />
      </Field>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-white/10">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <SecondaryButton onClick={() => onSaveDraft(form)}>Save Draft</SecondaryButton>
        <PrimaryButton onClick={() => onPublish(form)}>Publish</PrimaryButton>
      </div>
    </div>
  );
}

/* =================================== ResultForm =================================== */

export function ResultForm({ completedEvents, onSaveDraft, onPublish, onCancel }) {
  const [eventId, setEventId] = React.useState(completedEvents[0]?.id || "");
  const [placements, setPlacements] = React.useState([
    { position: "1st Place", name: "", department: "", prize: "", achievement: "" },
  ]);

  const updatePlacement = (idx, key, value) => {
    setPlacements((p) => p.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  const addPlacement = () =>
    setPlacements((p) => [...p, { position: `${p.length + 1}th Place`, name: "", department: "", prize: "", achievement: "" }]);

  const removePlacement = (idx) => setPlacements((p) => p.filter((_, i) => i !== idx));

  const payload = () => ({ eventId, placements });

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 lg:p-7 space-y-6">
      <Field label="Completed Event" required>
        <select className={inputClass} value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {completedEvents.map((e) => (
            <option key={e.id} value={e.id}>{e.name || e.title || "Untitled Event"}</option>
          ))}
        </select>
      </Field>

      <div className="space-y-4">
        <p className="text-xs font-medium text-slate-400">Winners / Placements</p>
        {placements.map((row, idx) => (
          <div key={idx} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Position (e.g. 1st Place)" value={row.position} onChange={(e) => updatePlacement(idx, "position", e.target.value)} />
              <input className={inputClass} placeholder="Student / Team name" value={row.name} onChange={(e) => updatePlacement(idx, "name", e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Department (optional)" value={row.department} onChange={(e) => updatePlacement(idx, "department", e.target.value)} />
              <input className={inputClass} placeholder="Prize (optional)" value={row.prize} onChange={(e) => updatePlacement(idx, "prize", e.target.value)} />
            </div>
            <textarea rows={2} className={inputClass} placeholder="Achievement description (optional)" value={row.achievement} onChange={(e) => updatePlacement(idx, "achievement", e.target.value)} />
            {placements.length > 1 && (
              <button onClick={() => removePlacement(idx)} className="text-xs font-medium text-red-400 hover:text-red-300">
                Remove placement
              </button>
            )}
          </div>
        ))}
        <button onClick={addPlacement} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
          + Add another placement
        </button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-white/10">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <SecondaryButton onClick={() => onSaveDraft(payload())}>Save Draft</SecondaryButton>
        <PrimaryButton onClick={() => onPublish(payload())}>Publish Results</PrimaryButton>
      </div>
    </div>
  );
}

/* ================================= CertificateCard ================================= */

export function CertificateCard({ item, onViewParticipants, onGenerate, onViewCertificates }) {
  const generated = item.status === "Generated";
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="h-12 w-12 shrink-0 rounded-xl bg-linear-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
        <FileBadge size={20} className="text-amber-300" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{item.eventName}</p>
        <p className="text-xs text-slate-400 mt-0.5">{item.participants} participants</p>
      </div>

      <StatusBadge status={item.status} />

      <div className="flex flex-wrap gap-2">
        <SecondaryButton className="py-2 text-xs" onClick={() => onViewParticipants(item)}>
          <span className="inline-flex items-center gap-1.5"><Users size={13} /> Participants</span>
        </SecondaryButton>
        {generated ? (
          <SecondaryButton className="py-2 text-xs" onClick={() => onViewCertificates(item)}>
            <span className="inline-flex items-center gap-1.5"><Award size={13} /> View Certificates</span>
          </SecondaryButton>
        ) : (
          <PrimaryButton className="py-2 text-xs" onClick={() => onGenerate(item)}>
            <span className="inline-flex items-center gap-1.5"><Award size={13} /> Generate Certificates</span>
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
