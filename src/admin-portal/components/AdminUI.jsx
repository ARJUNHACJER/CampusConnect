import React from "react";
import { AlertTriangle, Inbox } from "lucide-react";

/**
 * AdminUI.jsx
 * -----------------------------------------------------------------------
 * Small, reusable primitives shared across every Admin Portal page.
 * Built entirely on the existing CampusConnect design tokens:
 *   background : #0b0f1a / #0d1220
 *   surface    : bg-white/5 + border-white/10
 *   accent     : indigo-500 → purple-600 gradient, orange-400
 *   radius     : rounded-xl / rounded-2xl
 * -----------------------------------------------------------------------
 */

/* ================================ StatCard ================================ */

export function StatCard({ icon: Icon, label, value, sublabel, accent = "indigo" }) {
  const accentMap = {
    indigo: "from-indigo-500 to-purple-600 shadow-indigo-500/30",
    orange: "from-orange-400 to-pink-500 shadow-orange-500/30",
    emerald: "from-emerald-400 to-teal-500 shadow-emerald-500/30",
    sky: "from-sky-400 to-blue-600 shadow-sky-500/30",
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-white mt-1.5">{value}</p>
        {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
      </div>

      {Icon && (
        <div
          className={`h-10 w-10 shrink-0 rounded-xl bg-linear-to-br ${accentMap[accent]} flex items-center justify-center shadow-lg`}
        >
          <Icon size={18} className="text-white" />
        </div>
      )}
    </div>
  );
}

/* =============================== StatusBadge =============================== */

const STATUS_STYLES = {
  // Event statuses
  Draft: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  Published: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  "Registration Open": "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  "Registration Closed": "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Ongoing: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/30",
  Completed: "bg-purple-500/15 text-purple-300 ring-purple-500/30",
  Cancelled: "bg-red-500/15 text-red-300 ring-red-500/30",

  // Registration statuses
  Registered: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  Pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Accepted: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Approved: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Rejected: "bg-red-500/15 text-red-300 ring-red-500/30",
  Attended: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Absent: "bg-red-500/15 text-red-300 ring-red-500/30",

  // Generic
  Active: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Inactive: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  Generated: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  "Not Generated": "bg-slate-500/15 text-slate-300 ring-slate-500/30",

  // Priorities
  Normal: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  Important: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Urgent: "bg-red-500/15 text-red-300 ring-red-500/30",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-500/15 text-slate-300 ring-slate-500/30";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}

/* ============================= ConfirmationModal ============================= */

export function ConfirmationModal({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />

      <div className="relative w-full max-w-sm rounded-2xl bg-[#0d1220] border border-white/10 p-6 shadow-2xl">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${
            destructive ? "bg-red-500/15" : "bg-indigo-500/15"
          }`}
        >
          <AlertTriangle size={18} className={destructive ? "text-red-400" : "text-indigo-400"} />
        </div>

        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-slate-400 mt-1.5">{description}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
              destructive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================ EmptyState ================================ */

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl bg-white/5 border border-white/10 border-dashed">
      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        <Icon size={20} className="text-slate-500" />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* =============================== LoadingSkeleton =============================== */

export function LoadingSkeleton({ rows = 4, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      ))}
    </div>
  );
}

/* ================================= Field ================================= */

export function Field({ label, required, children, hint, error }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-400">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <span className="text-[11px] text-red-400 mt-1 block">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-slate-500 mt-1 block">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors";

export function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
