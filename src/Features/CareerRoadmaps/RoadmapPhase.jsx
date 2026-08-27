import React from "react";
import RoadmapTopic from "./RoadmapTopic";
import ProgressBar from "./ProgressBar";

export default function RoadmapPhase({ phase, phaseProgress, statusByTopic, onSelectTopic, index }) {
  return (
    <div className="relative pl-9">
      {/* timeline connector */}
      <div className="absolute left-3 top-1 bottom-0 w-px bg-white/10" />
      <div className="absolute left-0 top-0 h-7 w-7 rounded-full bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
        {index + 1}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-4 mb-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Phase {index + 1}</p>
            <h3 className="text-white font-semibold">{phase.title}</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400 shrink-0">
            {phaseProgress?.completed ?? 0} / {phaseProgress?.total ?? phase.topics.length} completed
          </span>
        </div>

        {phase.description && (
          <p className="text-sm text-slate-400 mb-3">{phase.description}</p>
        )}

        <ProgressBar percent={phaseProgress?.percent ?? 0} size="sm" />

        <div className="mt-3 divide-y divide-white/5">
          {phase.topics.map((topic) => (
            <RoadmapTopic
              key={topic.id}
              topic={topic}
              status={statusByTopic.get(topic.id) || "not_started"}
              onSelect={onSelectTopic}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
