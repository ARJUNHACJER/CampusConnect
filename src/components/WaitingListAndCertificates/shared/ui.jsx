import React, { useEffect } from "react";
import { X } from "lucide-react";

/* ==========================================================================
   DESIGN TOKENS
   Mirrors the tokens visible in CampusConnectDashboard.jsx:
     page bg      #0b0f1a
     panel bg     #0d1220
     border       border-white/10, border-white/5
     text         slate-200 / slate-400 / slate-500
     brand accent indigo-500 -> purple-600 gradient, orange-400 highlight
     radius       rounded-xl
   ========================================================================== */

export const STATUS_STYLES = {
  open: "bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/30",
  full: "bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/30",
  waiting: "bg-orange-500/15 text-orange-400 ring-1 ring-inset ring-orange-500/30",
  offered: "bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/30",
  registered: "bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/30",
  cancelled: "bg-slate-500/15 text-slate-400 ring-1 ring-inset ring-slate-500/30",
  expired: "bg-slate-500/15 text-slate-400 ring-1 ring-inset ring-slate-500/30",
  completed: "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/30",
  draft: "bg-slate-500/15 text-slate-400 ring-1 ring-inset ring-slate-500/30",
  generated: "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/30",
  published: "bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/30",
  revoked: "bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/30",
};

/* -------------------------------------------------------------------------
   NOTE ON THESE PRIMITIVES
   CampusConnect already has Card / Button / Badge / Modal components.
   These are lightweight stand-ins built to the same tokens so every file
   below is drop-in runnable on its own. Swap them for the real imports,
   e.g.:
     import Button from "../ui/Button";
     import Card from "../ui/Card";
     import Badge from "../ui/Badge";
     import Modal from "../ui/Modal";
   and delete this file once wired to the real design system.
------------------------------------------------------------------------- */

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-[#0d1220] shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, tone = "waiting", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[tone] || STATUS_STYLES.waiting} ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };
  const variants = {
    primary:
      "bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110",
    secondary:
      "bg-white/5 text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/10",
    danger:
      "bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/30 hover:bg-red-500/25",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-[#0d1220] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-white/5 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 px-6 py-14 text-center">
      {Icon ? (
        <div className="rounded-full bg-white/5 p-3">
          <Icon size={22} className="text-slate-400" />
        </div>
      ) : null}
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {description ? (
          <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function formatDate(iso, opts) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(
    "en-US",
    opts || { month: "short", day: "numeric", year: "numeric" }
  );
}
