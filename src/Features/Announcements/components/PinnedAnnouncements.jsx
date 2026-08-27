import React from "react";
import { Pin } from "lucide-react";

export default function PinnedAnnouncements({ announcements, onReadMore }) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Pin size={15} className="text-orange-400" />
        Important Announcements
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-orange-400/20 bg-orange-400/[0.04] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-400/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-orange-300 ring-1 ring-inset ring-orange-400/25">
                <Pin size={11} /> PINNED
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-white">{a.title}</h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">{a.description}</p>

            <button
              type="button"
              onClick={() => onReadMore(a)}
              className="mt-2.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Read More →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
