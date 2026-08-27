import React, { useState } from "react";
import { X, Clock, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import ResourceCard from "./ResourceCard";

export default function TopicDetails({ topic, status, onClose, onUpdateStatus }) {
  const [saving, setSaving] = useState(false);

  if (!topic) return null;

  const handleStatus = async (newStatus) => {
    setSaving(true);
    try {
      await onUpdateStatus(topic.id, newStatus);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <aside className="ml-auto relative h-full w-full sm:w-[480px] bg-[#0d1220] border-l border-white/10 overflow-y-auto">
        <div className="sticky top-0 bg-[#0d1220] border-b border-white/10 px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Topic</p>
            <h2 className="text-lg font-semibold text-white">{topic.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {topic.description && (
            <p className="text-sm text-slate-300">{topic.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {topic.estimated_time && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> {topic.estimated_time}
              </span>
            )}
            {topic.prerequisites && (
              <span>Prerequisite: {topic.prerequisites}</span>
            )}
          </div>

          {topic.what_youll_learn?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">What you'll learn</h3>
              <ul className="space-y-1.5">
                {topic.what_youll_learn.map((item, i) => (
                  <li key={i} className="text-sm text-slate-400 flex gap-2">
                    <span className="text-indigo-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.practice_tasks?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Practice</h3>
              <ul className="space-y-1.5">
                {topic.practice_tasks.map((item, i) => (
                  <li key={i} className="text-sm text-slate-400 flex gap-2">
                    <span className="text-indigo-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.suggested_project && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Suggested project</h3>
              <p className="text-sm text-slate-400">{topic.suggested_project}</p>
            </div>
          )}

          {topic.resources?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Resources</h3>
              <div className="space-y-2">
                {topic.resources.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#0d1220] border-t border-white/10 px-5 py-4 flex gap-2">
          {status !== "in_progress" && status !== "completed" && (
            <button
              disabled={saving}
              onClick={() => handleStatus("in_progress")}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-3 py-2.5 rounded-xl text-white bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50"
            >
              <PlayCircle size={16} /> Start Topic
            </button>
          )}
          {status === "in_progress" && (
            <button
              disabled={saving}
              onClick={() => handleStatus("completed")}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-3 py-2.5 rounded-xl text-white bg-linear-to-br from-emerald-500 to-emerald-600 hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle2 size={16} /> Mark as Complete
            </button>
          )}
          {status === "completed" && (
            <button
              disabled={saving}
              onClick={() => handleStatus("in_progress")}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-3 py-2.5 rounded-xl text-slate-300 bg-white/5 hover:bg-white/10 disabled:opacity-50"
            >
              <Circle size={16} /> Mark as In Progress
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
