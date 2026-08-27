import React from "react";
import { Eye, Pencil, Users, MoreVertical, Trash2, AlertCircle } from "lucide-react";
import { StatusBadge, Field, inputClass } from "./AdminUI";
import { eventCategories, eventStatuses } from "../data/mockData";
import { validateEventForm } from "./eventValidation";

/* ============================= EventManagementCard ============================= */

export function EventManagementCard({ event, onView, onEdit, onRegistrations, onChangeStatus, onDelete }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
      <div className="h-16 w-16 shrink-0 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center text-3xl">
        {event.banner}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{event.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {event.category} • {event.date}
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-slate-400">
          <span>
            <span className="text-slate-300 font-medium">{event.registrationCount}</span> registered
          </span>
          <span>Deadline: {event.registrationDeadline}</span>
          <span>{event.venue}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={() => onView(event)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Eye size={13} /> View
          </button>
          <button
            onClick={() => onEdit(event)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={() => onRegistrations(event)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Users size={13} /> Registrations
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#0d1220] border border-white/10 shadow-2xl overflow-hidden z-10">
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold tracking-wide text-slate-500">
                  CHANGE STATUS
                </p>
                {eventStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onChangeStatus(event, s);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
                  >
                    {s}
                  </button>
                ))}
                <div className="border-t border-white/10 mt-1">
                  <button
                    onClick={() => {
                      onDelete(event);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-1.5 text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={13} /> Delete Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================== EventForm ================================== */

const EMPTY_EVENT = {
  name: "",
  banner: "🎉",
  description: "",
  category: eventCategories[0],
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  organizer: "",
  eligibility: "",
  department: "",
  maxParticipants: "",
  registrationDeadline: "",
  rules: "",
  highlights: "",
  prizeInfo: "",
};

export function EventForm({ initialValue, onSaveDraft, onPublish }) {
  const [form, setForm] = React.useState(initialValue || EMPTY_EVENT);
  const [errors, setErrors] = React.useState({});

  const update = (key) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [key]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const errClass = (key) =>
    `${inputClass}${errors[key] ? " border-red-500/60 ring-1 ring-red-500/30 focus:ring-red-500/40" : ""}`;

  const submit = (action, requireAll) => {
    const nextErrors = validateEventForm(form, { requireAll });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    action(form);
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 lg:p-7 space-y-6">
      {hasErrors && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>Please fix the highlighted fields before saving.</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Event Name" required error={errors.name}>
          <input className={errClass("name")} placeholder="e.g. Web Development Hackathon" value={form.name} onChange={update("name")} />
        </Field>
        <Field label="Event Banner / Emoji" hint="Upload support can be wired to storage later">
          <input className={inputClass} placeholder="🎉" value={form.banner} onChange={update("banner")} />
        </Field>
      </div>

      <Field label="Description" required error={errors.description}>
        <textarea rows={3} className={errClass("description")} placeholder="What is this event about?" value={form.description} onChange={update("description")} />
      </Field>

      <div className="grid sm:grid-cols-3 gap-5">
        <Field label="Category" required>
          <select className={inputClass} value={form.category} onChange={update("category")}>
            {eventCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Department" required error={errors.department}>
          <input className={inputClass} placeholder="e.g. Computer Science" value={form.department} onChange={update("department")} />
        </Field>
        <Field label="Organizer" required error={errors.organizer}>
          <input className={inputClass} placeholder="e.g. Robotics Club" value={form.organizer} onChange={update("organizer")} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Field label="Date" required error={errors.date}>
          <input type="date" className={errClass("date")} value={form.date} onChange={update("date")} />
        </Field>
        <Field label="Start Time" required error={errors.startTime}>
          <input type="time" className={inputClass} value={form.startTime} onChange={update("startTime")} />
        </Field>
        <Field label="End Time" error={errors.endTime}>
          <input type="time" className={errClass("endTime")} value={form.endTime} onChange={update("endTime")} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Field label="Venue" required error={errors.venue}>
          <input className={errClass("venue")} placeholder="e.g. Main Auditorium" value={form.venue} onChange={update("venue")} />
        </Field>
        <Field label="Maximum Participants" required error={errors.maxParticipants}>
          <input type="number" min="1" step="1" className={errClass("maxParticipants")} placeholder="e.g. 150" value={form.maxParticipants} onChange={update("maxParticipants")} />
        </Field>
        <Field label="Registration Deadline" error={errors.registrationDeadline}>
          <input type="date" className={errClass("registrationDeadline")} value={form.registrationDeadline} onChange={update("registrationDeadline")} />
        </Field>
      </div>

      <Field label="Eligibility" required error={errors.eligibility}>
        <input className={inputClass} placeholder="e.g. All UG/PG students" value={form.eligibility} onChange={update("eligibility")} />
      </Field>

      <Field label="Rules & Guidelines">
        <textarea rows={3} className={inputClass} placeholder="Team size, code of conduct, judging criteria..." value={form.rules} onChange={update("rules")} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Event Highlights">
          <textarea rows={2} className={inputClass} placeholder="Whats makes it worth attending?" value={form.highlights} onChange={update("highlights")} />
        </Field>
        <Field label="Prize Information">
          <textarea rows={2} className={inputClass} placeholder="e.g. ₹50,000 total prize pool" value={form.prizeInfo} onChange={update("prizeInfo")} />
        </Field>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-white/10">
        <button
          onClick={() => submit(onSaveDraft, false)}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          Save Draft
        </button>
        <button
          onClick={() => submit(onPublish, true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
        >
          Publish Event
        </button>
      </div>
    </div>
  );
}
