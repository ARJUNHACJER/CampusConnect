import React, { useEffect, useMemo, useState } from "react";
import { Search, X, CheckCircle2, XCircle, UserCheck } from "lucide-react";
import { RegistrationTable } from "../components/DataComponents";
import { inputClass, StatusBadge } from "../components/AdminUI";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { EDUCATION_TYPES } from "../../campusconnect-profile/src/lib/educationConfig";
import { supabase } from "../../supabaseClient";

// Real registration status vocabulary used across the app:
//   pending → student just registered, awaiting admin
//   accepted → approved by admin      rejected → declined by admin
//   attended → marked present         cancelled → withdrawn by student
const FILTERS = ["All", "Pending", "Accepted", "Rejected", "Attended", "Cancelled"];

const EDU_LABEL = EDUCATION_TYPES.reduce((map, t) => {
  map[t.value] = t.label;
  return map;
}, {});

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "-");

// Build a student summary (Name / Roll / Branch / Year / Program) from the
// profile + current education record. Never expose the raw user_id (UUID).
function summarizeStudent(profile, edu) {
  const fields = edu?.fields || {};
  const name = profile?.full_name || profile?.display_name || profile?.email || "Unnamed student";
  const program = fields.course || EDU_LABEL[edu?.education_type] || (edu?.education_type ? cap(edu.education_type) : "-");
  return {
    name,
    email: profile?.email || "-",
    roll: fields.rollNumber || fields.registrationNumber || "-",
    branch: fields.branch || fields.specialization || "-",
    year: fields.currentYear || fields.className || "-",
    program,
  };
}

function summarizeRegistrationStudent(registration, profile, edu) {
  const summary = summarizeStudent(profile, edu);
  return {
    ...summary,
    roll: summary.roll !== "-" ? summary.roll : registration.student_roll || registration.roll_number || "-",
    branch: summary.branch !== "-" ? summary.branch : registration.student_branch || registration.branch || "-",
    year: summary.year !== "-" ? summary.year : registration.student_year || registration.year || "-",
    program: summary.program !== "-" ? summary.program : registration.student_program || registration.program || "-",
  };
}

export default function AdminRegistrations({ selectedEvent }) {
  const [eventId, setEventId] = useState(selectedEvent?.id || "");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [studentMap, setStudentMap] = useState({});
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [eventsRes, regsRes] = await Promise.all([
        supabase.from("events").select("id,title,date").order("date", { ascending: false }),
        supabase.from("event_registrations").select("*").order("registered_at", { ascending: false }),
      ]);
      if (!active) return;
      if (eventsRes.error || regsRes.error) {
        setError(eventsRes.error?.message || regsRes.error?.message || "Could not load registrations.");
        setLoading(false);
        return;
      }
      const regs = regsRes.data || [];
      setEvents(eventsRes.data || []);
      setRegistrations(regs);
      setError("");
      setLoading(false);

      // Enrich with real student data. Failures here shouldn't blank the page —
      // rows fall back to "Unnamed student" (never the UUID).
      const ids = [...new Set(regs.map((r) => r.user_id).filter(Boolean))];
      if (ids.length === 0) return;
      const [profilesRes, eduRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, display_name, email").in("user_id", ids),
        supabase.from("education_records").select("user_id, education_type, fields").eq("is_current", true).in("user_id", ids),
      ]);
      if (!active) return;
      const profileById = (profilesRes.data || []).reduce((m, p) => ((m[p.user_id] = p), m), {});
      const eduById = (eduRes.data || []).reduce((m, e) => ((m[e.user_id] = e), m), {});
      const map = {};
      ids.forEach((id) => {
        const registration = regs.find((row) => row.user_id === id);
        map[id] = summarizeRegistrationStudent(registration || {}, profileById[id], eduById[id]);
      });
      setStudentMap(map);
    };
    load();
    return () => { active = false; };
  }, []);

  const enriched = useMemo(() => {
    return registrations
      .filter((r) => !eventId || r.event_id === eventId)
      .map((r) => {
        const s = studentMap[r.user_id] || {};
        return {
          ...r,
          studentName: s.name || "Unnamed student",
          email: s.email || "-",
          roll: s.roll || "-",
          branch: s.branch || "-",
          year: s.year || "-",
          program: s.program || "-",
          registeredAt: r.registered_at ? new Date(r.registered_at).toLocaleDateString() : "-",
          status: cap(r.status),
        };
      });
  }, [registrations, eventId, studentMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((r) => {
      const matchesFilter = filter === "All" || r.status.toLowerCase() === filter.toLowerCase();
      const matchesSearch =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        (r.roll || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.event_title || "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [enriched, filter, search]);

  // Selection is scoped to what's visible: bulk actions and the count only ever
  // consider currently-filtered rows, so hidden rows are never affected.
  const selectedVisible = useMemo(() => filtered.filter((r) => selectedIds.has(r.id)), [filtered, selectedIds]);
  const allSelected = filtered.length > 0 && selectedVisible.length === filtered.length;
  const someSelected = selectedVisible.length > 0 && !allSelected;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) filtered.forEach((r) => next.delete(r.id));
      else filtered.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const markAttendance = async (reg) => {
    const { error: updateError } = await supabase.from("event_registrations").update({ status: "attended" }).eq("id", reg.id);
    if (updateError) window.alert(updateError.message);
    else setRegistrations((prev) => prev.map((r) => (r.id === reg.id ? { ...r, status: "attended" } : r)));
  };

  const updateStatus = async (registration, status) => {
    const { error: updateError } = await supabase.from("event_registrations").update({ status }).eq("id", registration.id);
    if (updateError) window.alert(updateError.message);
    else setRegistrations((prev) => prev.map((r) => (r.id === registration.id ? { ...r, status } : r)));
  };

  const bulkUpdate = async (status) => {
    const ids = selectedVisible.map((r) => r.id);
    if (ids.length === 0) return;
    const { error: updateError } = await supabase.from("event_registrations").update({ status }).in("id", ids);
    if (updateError) { window.alert(updateError.message); return; }
    const idSet = new Set(ids);
    setRegistrations((prev) => prev.map((r) => (idSet.has(r.id) ? { ...r, status } : r)));
    clearSelection();
  };

  const viewStudentDetails = async (registration) => {
    const [profile, education, contact] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", registration.user_id).maybeSingle(),
      supabase.from("education_records").select("*").eq("user_id", registration.user_id).eq("is_current", true).maybeSingle(),
      supabase.from("contact_info").select("*").eq("user_id", registration.user_id).maybeSingle(),
    ]);
    if (profile.error || education.error || contact.error) {
      window.alert(profile.error?.message || education.error?.message || contact.error?.message);
      return;
    }
    setStudentDetails({ registration, profile: profile.data || {}, education: education.data || {}, contact: contact.data || {} });
  };

  const currentEventName = eventId ? events.find((e) => e.id === eventId)?.title || eventId : "all events";

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-3">
        <select className={inputClass} value={eventId} onChange={(e) => { setEventId(e.target.value); clearSelection(); }} aria-label="Filter by event">
          <option value="">All Events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.title || e.id}</option>
          ))}
        </select>
        <div className="relative sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className={`${inputClass} pl-10`} placeholder="Search name, roll, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-inset ring-indigo-500/40" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {filtered.length} of {enriched.length} registrations for <span className="text-slate-300">{currentEventName}</span>
        </p>
      </div>

      {/* Bulk action bar — only acts on currently-visible selected rows */}
      {selectedVisible.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
          <span className="text-sm font-medium text-indigo-200">{selectedVisible.length} selected</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => bulkUpdate("accepted")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25">
              <CheckCircle2 size={14} /> Approve
            </button>
            <button onClick={() => bulkUpdate("rejected")} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/25">
              <XCircle size={14} /> Reject
            </button>
            <button onClick={() => bulkUpdate("attended")} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/25">
              <UserCheck size={14} /> Mark Attended
            </button>
          </div>
          <button onClick={clearSelection} className="ml-auto text-xs font-medium text-slate-400 hover:text-white">Clear</button>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={6} columns={7} />
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm font-semibold text-red-300">Couldn't load registrations</p>
          <p className="text-xs text-red-300/80 mt-1">{error}</p>
        </div>
      ) : (
        <RegistrationTable
          registrations={filtered}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          allSelected={allSelected}
          someSelected={someSelected}
          onView={viewStudentDetails}
          onMarkAttendance={markAttendance}
          onUpdateStatus={updateStatus}
        />
      )}

      {studentDetails && (
        <StudentDetailsModal details={studentDetails} onClose={() => setStudentDetails(null)} />
      )}
    </div>
  );
}

/* ============================ Student details modal ============================ */

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 wrap-break-word text-sm text-white">{value || "-"}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function StudentDetailsModal({ details, onClose }) {
  const { registration, profile, education, contact } = details;
  const fields = education?.fields || {};
  const summary = summarizeStudent(profile, education);
  const attempt = registration.action_count && registration.action_count > 1 ? `Attempt ${registration.action_count}` : "1st attempt";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1220] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{summary.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{summary.program !== "-" ? summary.program : "Student"} · {registration.event_title}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={cap(registration.status)} />
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <Section title="Registration">
            <DetailItem label="Event" value={registration.event_title} />
            <DetailItem label="Event Date" value={registration.event_date} />
            <DetailItem label="Registered On" value={registration.registered_at ? new Date(registration.registered_at).toLocaleString() : "-"} />
            <DetailItem label="Attempt" value={attempt} />
          </Section>

          <Section title="Academic">
            <DetailItem label="Program" value={summary.program} />
            <DetailItem label="Branch / Stream" value={summary.branch} />
            <DetailItem label="Year" value={summary.year} />
            <DetailItem label="Roll Number" value={summary.roll} />
            <DetailItem label="CGPA / Percentage" value={fields.cgpaPercentage} />
            <DetailItem label="University / Board" value={fields.universityBoard} />
          </Section>

          <Section title="Personal & Contact">
            <DetailItem label="Email" value={profile.email} />
            <DetailItem label="Phone" value={profile.phone} />
            <DetailItem label="Gender" value={profile.gender} />
            <DetailItem label="College Email" value={contact.college_email} />
            <DetailItem label="City" value={contact.city} />
            <DetailItem label="State" value={contact.state} />
            <DetailItem label="Emergency Contact" value={contact.emergency_name ? `${contact.emergency_name}${contact.emergency_phone ? ` · ${contact.emergency_phone}` : ""}` : "-"} />
          </Section>
        </div>
      </div>
    </div>
  );
}
