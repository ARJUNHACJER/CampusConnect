import React from "react";
import * as Icons from "lucide-react";
import { Clock, Layers, ListChecks } from "lucide-react";
import ProgressBar from "./ProgressBar";

const difficultyStyles = {
  Beginner: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Intermediate: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Advanced: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

export default function RoadmapCard({ roadmap, progress, onView, onStart }) {
  const Icon = Icons[roadmap.icon] || Icons.Compass;
  const started = progress != null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-5 flex flex-col gap-4 hover:border-indigo-500/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center ring-1 ring-inset ring-indigo-500/30">
          <Icon size={20} className="text-indigo-300" />
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${
            difficultyStyles[roadmap.difficulty] || difficultyStyles.Beginner
          }`}
        >
          {roadmap.difficulty}
        </span>
      </div>

      <div>
        <h3 className="text-white font-semibold text-base">{roadmap.title}</h3>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{roadmap.description}</p>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock size={13} /> {roadmap.estimated_duration}
        </span>
        {roadmap.phaseCount != null && (
          <span className="flex items-center gap-1.5">
            <Layers size={13} /> {roadmap.phaseCount} phases
          </span>
        )}
        {roadmap.topicCount != null && (
          <span className="flex items-center gap-1.5">
            <ListChecks size={13} /> {roadmap.topicCount} topics
          </span>
        )}
      </div>

      {started && (
        <ProgressBar percent={progress.overallPercent} size="sm" showLabel />
      )}

      <div className="flex items-center gap-2 mt-auto pt-1">
        <button
          onClick={() => onView(roadmap)}
          className="flex-1 text-sm font-medium px-3 py-2 rounded-xl text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
        >
          View Roadmap
        </button>
        <button
          onClick={() => onStart(roadmap)}
          className="flex-1 text-sm font-medium px-3 py-2 rounded-xl text-white bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity"
        >
          {started ? "Continue" : "Start Roadmap"}
        </button>
      </div>
    </div>
  );
}
