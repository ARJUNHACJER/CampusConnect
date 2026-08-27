import React from "react";
import { Megaphone, Calendar, Clock, Paperclip } from "lucide-react";

function PriorityBadge({ priority }) {
  if (priority === "Urgent") {
    return (
      <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-red-300 ring-1 ring-inset ring-red-500/25">
        URGENT
      </span>
    );
  }

  if (priority === "Important") {
    return (
      <span className="inline-flex items-center rounded-md bg-orange-400/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-orange-300 ring-1 ring-inset ring-orange-400/25">
        IMPORTANT
      </span>
    );
  }

  return null;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function AnnouncementCard({ announcement, onReadMore }) {
  const { title, description, category, priority, publisher, publishedAt, read, attachment } =
    announcement;

  return (
    <div
      className={`rounded-2xl border bg-white/5 p-4 sm:p-5 transition-colors ${
        read ? "border-white/10" : "border-indigo-500/20 bg-indigo-500/[0.03]"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {!read && (
          <span
            aria-label="Unread"
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400"
          />
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={priority} />
            <h3 className="text-sm sm:text-base font-semibold text-white">{title}</h3>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-500">
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                {category}
              </span>
              {attachment && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Paperclip size={12} /> {attachment.name}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onReadMore(announcement)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Read More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
