import React, { useEffect } from "react";
import { X } from "lucide-react";

/* ==========================================================================
   SHARED UI PRIMITIVES
   ----------------------------------------------------------------------
   These match CampusConnectDashboard.jsx's existing visual language:
   bg #0b0f1a / #0d1220, indigo-purple gradient accents, rounded-xl,
   slate typography scale, white/5-10 borders.

   ⚠️ If CampusConnect already has shared Button / Card / Badge / Modal
   components elsewhere in the codebase, import those instead and delete
   this file — it exists purely so the new features don't invent a
   second design system.
   ========================================================================== */

/* --------------------------- Card --------------------------- */
export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl bg-[#0d1220] border border-white/10 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* --------------------------- Badge --------------------------- */
const BADGE_STYLES = {
  neutral: "bg-white/5 text-slate-300 ring-1 ring-inset ring-white/10",
  indigo: "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/30",
  green: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  red: "bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-500/30",
  amber: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30",
};

export function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* --------------------------- Button --------------------------- */
const BUTTON_STYLES = {
  primary:
    "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-900/30 focus-visible:ring-indigo-400",
  secondary:
    "bg-white/5 hover:bg-white/10 text-slate-200 ring-1 ring-inset ring-white/10 focus-visible:ring-white/30",
  danger:
    "bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/30 focus-visible:ring-red-400",
  ghost:
    "bg-transparent hover:bg-white/5 text-slate-300 focus-visible:ring-white/20",
  success:
    "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/30 focus-visible:ring-emerald-400",
};

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  disabled = false,
  as = "button",
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_STYLES[variant]} ${BUTTON_SIZES[size]} ${className}`;

  // Polymorphic: renders as <a> for tel:/mailto:/external links, otherwise <button>.
  if (as === "a") {
    return (
      <a
        className={classes}
        aria-disabled={disabled}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
        {...props}
      >
        {Icon ? <Icon size={16} className="shrink-0" /> : null}
        {children}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} className={classes} {...props}>
      {Icon ? <Icon size={16} className="shrink-0" /> : null}
      {children}
    </button>
  );
}

/* --------------------------- Modal --------------------------- */
export function Modal({ open, onClose, title, children, footer, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} bg-[#0d1220] border border-white/10 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0d1220]">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer ? (
          <div className="px-5 py-4 border-t border-white/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sticky bottom-0 bg-[#0d1220]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* --------------------------- Empty State --------------------------- */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon ? (
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Icon size={22} className="text-slate-400" />
        </div>
      ) : null}
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      {description ? (
        <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

/* --------------------------- Loading State --------------------------- */
export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

/* --------------------------- Confirm Dialog --------------------------- */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-slate-400">{description}</p>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
