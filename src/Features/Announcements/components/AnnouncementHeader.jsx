import React from "react";

export default function AnnouncementHeader({ total }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Campus Announcements</h1>
        <p className="mt-1 text-sm text-slate-400 max-w-xl">
          Stay updated with the latest campus news, events, deadlines, and important notices.
        </p>
      </div>

      {typeof total === "number" && (
        <span className="self-start rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 whitespace-nowrap">
          {total} Announcement{total === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
