import React, { useEffect } from "react";
import { X, Megaphone, Calendar, Clock, Paperclip, ArrowRight } from "lucide-react";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function AnnouncementDetails({ announcement, onClose, onViewEvent }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!announcement) return null;

  const { title, description, category, priority, publisher, publishedAt, attachment, relatedEventId } =
    announcement;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#0d1220] p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {priority !== "Normal" && (
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${
                  priority === "Urgent"
                    ? "bg-red-500/10 text-red-300 ring-red-500/25"
                    : "bg-orange-400/10 text-orange-300 ring-orange-400/25"
                }`}
              >
                {priority.toUpperCase()}
              </span>
            )}
            <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              {category}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-500 hover:text-white shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-3 text-lg font-bold text-white">{title}</h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Megaphone size={13} /> Posted by: {publisher}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={13} /> {formatDate(publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} /> {formatTime(publishedAt)}
          </span>
        </div>

        {attachment && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
            <span className="inline-flex items-center gap-2 text-sm text-slate-300 truncate">
              <Paperclip size={14} className="shrink-0 text-slate-500" />
              {attachment.name}
            </span>
            <a
              href={attachment.url}
              className="shrink-0 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View / Download
            </a>
          </div>
        )}

        {relatedEventId && (
          <button
            type="button"
            onClick={() => onViewEvent?.(relatedEventId)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
          >
            View Event <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
