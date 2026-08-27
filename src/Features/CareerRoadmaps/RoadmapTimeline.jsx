import React from "react";
import RoadmapPhase from "./RoadmapPhase";

export default function RoadmapTimeline({ structure, statusByTopic, phaseProgress, onSelectTopic }) {
  if (!structure?.length) return null;

  const progressByPhaseId = new Map(phaseProgress.map((p) => [p.phaseId, p]));

  return (
    <div>
      {structure.map((phase, i) => (
        <RoadmapPhase
          key={phase.id}
          phase={phase}
          index={i}
          statusByTopic={statusByTopic}
          phaseProgress={progressByPhaseId.get(phase.id)}
          onSelectTopic={onSelectTopic}
        />
      ))}
    </div>
  );
}
