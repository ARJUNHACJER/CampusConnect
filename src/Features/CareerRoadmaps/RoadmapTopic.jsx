import React from "react";
import { CheckCircle2, CircleDot, Circle } from "lucide-react";

export default function RoadmapTopic({ topic, status, onSelect }) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

  return (
    <button
      onClick={() => onSelect(topic)}
      className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors text-left"
    >
      {isCompleted && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
      {isInProgress && <CircleDot size={18} className="text-indigo-400 shrink-0" />}
      {!isCompleted && !isInProgress && <Circle size={18} className="text-slate-600 shrink-0" />}

      <span
        className={`text-sm flex-1 truncate ${
          isCompleted ? "text-slate-400 line-through" : "text-slate-200"
        }`}
      >
        {topic.title}
      </span>

      {topic.estimated_time && (
        <span className="text-xs text-slate-500 shrink-0">{topic.estimated_time}</span>
      )}
    </button>
  );
}
