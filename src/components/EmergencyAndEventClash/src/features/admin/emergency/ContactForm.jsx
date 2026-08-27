import React, { useEffect, useState } from "react";
import { Modal, Button } from "../../../shared/ui/primitives";
import { CONTACT_CATEGORIES } from "../../emergency/mockData";

const EMPTY_FORM = {
  name: "",
  category: "security",
  description: "",
  phone: "",
  email: "",
  location: "",
  availability: "",
  priority: 1,
  active: true,
};

/**
 * ContactForm
 * ---------------------------------------------------------------------------
 * Add / Edit modal for a single emergency contact. Controlled entirely by
 * `contact` (null = "add new") and calls onSave with the finished payload —
 * it does not talk to Supabase directly, so it stays reusable/testable.
 * ---------------------------------------------------------------------------
 */
export default function ContactForm({ open, onClose, onSave, contact }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = Boolean(contact?.id);

  useEffect(() => {
    if (open) {
      setForm(contact ? { ...EMPTY_FORM, ...contact } : EMPTY_FORM);
    }
  }, [open, contact]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) return;
    onSave({
      ...form,
      priority: Number(form.priority) || 99,
      email: form.email.trim() || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Contact" : "Add Contact"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{isEditing ? "Update" : "Save"}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Service Name" required>
          <input
            className="input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Campus Security"
            required
          />
        </Field>

        <Field label="Category" required>
          <select
            className="input"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {CONTACT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            className="input resize-none"
            rows={2}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Short description shown to students"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91XXXXXXXXXX"
            />
          </Field>
          <Field label="Email">
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="optional"
            />
          </Field>
        </div>

        <Field label="Location">
          <input
            className="input"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Main Security Office"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Availability">
            <input
              className="input"
              value={form.availability}
              onChange={(e) => update("availability", e.target.value)}
              placeholder="e.g. 24/7 or 9:00 AM – 6:00 PM"
            />
          </Field>
          <Field label="Priority">
            <input
              className="input"
              type="number"
              min={1}
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-200">Active</p>
            <p className="text-xs text-slate-500">Visible to students on /help</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.active}
            onClick={() => update("active", !form.active)}
            className={`w-11 h-6 rounded-full relative transition-colors ${
              form.active ? "bg-indigo-500" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                form.active ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </form>

      {/* Local input styling to match the dark theme without a global CSS dependency */}
      <style>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          color: #e2e8f0;
        }
        .input::placeholder { color: #64748b; }
        .input:focus { outline: none; border-color: rgba(99,102,241,0.6); }
      `}</style>
    </Modal>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required ? <span className="text-red-400">*</span> : null}
      </span>
      {children}
    </label>
  );
}
