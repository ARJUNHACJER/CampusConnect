import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { EventForm, EventManagementCard } from "../components/EventComponents";
import { ConfirmationModal, EmptyState, LoadingSkeleton, inputClass } from "../components/AdminUI";
import { validateEventForm } from "../components/eventValidation";
import { eventCategories, eventStatuses } from "../data/mockData";
import { supabase } from "../../supabaseClient";

/* ================================ Create Event ================================ */

const eventToForm = (event) => ({
  name: event.title || "",
  banner: event.banner || "🎉",
  description: event.description || "",
  category: event.category || eventCategories[0],
  date: event.date || "",
  startTime: event.start_time || "",
  endTime: event.end_time || "",
  venue: event.venue || "",
  organizer: event.organizer || "",
  eligibility: event.eligibility || "",
  department: event.department || "",
  maxParticipants: event.max_participants || "",
  registrationDeadline: event.registration_deadline || "",
  rules: event.rules || "",
  highlights: event.highlights || "",
  prizeInfo: event.prize_info || "",
});

export function AdminEventsCreate({ onNavigate, event: existingEvent }) {
  const saveEvent = async (form, status) => {
    // Defense-in-depth: re-validate before touching the DB, even though the
    // form blocks invalid submits. Publishing enforces all required fields;
    // drafts only enforce format rules on whatever is filled in.
    const validationErrors = validateEventForm(form, { requireAll: status === "published" });
    const firstError = Object.values(validationErrors).find(Boolean);
    if (firstError) {
      window.alert(firstError);
      return;
    }
    const eventData = {
      title: form.name,
      category: form.category,
      description: form.description,
      date: form.date,
      start_time: form.startTime || null,
      end_time: form.endTime || null,
      venue: form.venue,
      organizer: form.organizer,
      banner: form.banner,
      eligibility: form.eligibility || null,
      department: form.department || null,
      max_participants: form.maxParticipants ? Number(form.maxParticipants) : null,
      registration_deadline: form.registrationDeadline || null,
      rules: form.rules || null,
      highlights: form.highlights || null,
      prize_info: form.prizeInfo || null,
      status: status.toLowerCase(),
    };
    const query = existingEvent
      ? supabase.from("events").update(eventData).eq("id", existingEvent.id)
      : supabase.from("events").insert({ id: crypto.randomUUID(), ...eventData });
    const { error } = await query;
    if (error) {
      window.alert(error.message);
      return;
    }
    onNavigate("events-manage");
  };

  const handleSaveDraft = (form) => saveEvent(form, "draft");

  const handlePublish = (form) => saveEvent(form, "published");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{existingEvent ? "Edit Event" : "Create a New Event"}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {existingEvent ? "Update the event details below. Publishing makes it visible to students immediately." : "Fill in the details below. Publishing makes it visible to students immediately; drafts stay hidden."}
        </p>
      </div>
      <EventForm
        key={existingEvent?.id || "new-event"}
        initialValue={existingEvent ? eventToForm(existingEvent) : undefined}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </div>
  );
}

/* ================================ Manage Events ================================ */

export function AdminEventsManage({ onNavigate, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => supabase.from("events").select("*").order("date", { ascending: true }).then(({ data }) => {
      if (active) setEvents((data || []).map((event) => ({ ...event, name: event.title, status: event.status[0].toUpperCase() + event.status.slice(1) })));
          if (active) {
            setEvents((data || []).map((event) => ({ ...event, name: event.title, status: event.status ? event.status[0].toUpperCase() + event.status.slice(1) : "Draft" })));
            setLoading(false);
          }
    });
    load();
    const timer = setInterval(load, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const filtered = events.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || e.category === category;
    const matchesStatus = status === "All" || e.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleChangeStatus = (event, newStatus) => {
    supabase.from("events").update({ status: newStatus.toLowerCase() }).eq("id", event.id).then(({ error }) => {
      if (error) window.alert(error.message);
      else setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e)));
    });
  };

  const handleDelete = () => {
    supabase.from("events").delete().eq("id", pendingDelete.id).then(({ error }) => {
      if (error) window.alert(error.message);
      else setEvents((prev) => prev.filter((e) => e.id !== pendingDelete.id));
      setPendingDelete(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className={`${inputClass} pl-10`}
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={inputClass + " sm:w-48"} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          {eventCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={inputClass + " sm:w-52"} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {eventStatuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <LoadingSkeleton rows={5} /> : filtered.length === 0 ? (
        <EmptyState title="No events match your filters" description="Try clearing the search or filters above." />
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <EventManagementCard
              key={event.id}
              event={event}
              onView={(e) => setPreview(e)}
              onEdit={(e) => onNavigate("events-create", e)}
              onRegistrations={(e) => {
                onSelectEvent(e);
                onNavigate("registrations");
              }}
              onChangeStatus={handleChangeStatus}
              onDelete={(e) => setPendingDelete(e)}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        open={!!pendingDelete}
        title="Delete this event?"
        description={pendingDelete ? `"${pendingDelete.name}" will be permanently removed, along with its registrations.` : ""}
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d1220] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-semibold text-white">{preview.name}</h3><p className="mt-1 text-sm text-slate-400">{preview.category} · {preview.date}</p></div>
              <button className="text-slate-400 hover:text-white" onClick={() => setPreview(null)}>Close</button>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <p><b>Time:</b> {preview.start_time || "-"} - {preview.end_time || "-"}</p><p><b>Venue:</b> {preview.venue || "-"}</p><p><b>Organizer:</b> {preview.organizer || "-"}</p><p><b>Department:</b> {preview.department || "-"}</p><p><b>Eligibility:</b> {preview.eligibility || "-"}</p><p><b>Capacity:</b> {preview.max_participants || "-"}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{preview.description || "No description"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
