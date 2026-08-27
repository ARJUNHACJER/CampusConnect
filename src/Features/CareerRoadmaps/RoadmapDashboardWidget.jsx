import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { ArrowRight, Map } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { supabase } from "../../supabaseClient"; // adjust path to match your project
import {
  fetchUserRoadmaps,
  fetchRoadmapStructure,
  fetchUserProgress,
  calculateProgress,
} from "../../services/roadmapService";

// Drop this into the existing dashboard's widget area, e.g.:
//   <RoadmapDashboardWidget onExplore={() => onNavigate("Roadmap Builder")} />
export default function RoadmapDashboardWidget({ onExplore }) {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null); // { roadmap, overallPercent }

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (!userId) {
        if (active) setLoading(false);
        return;
      }

      try {
        const userRoadmaps = await fetchUserRoadmaps(userId);
        const mostRecent = userRoadmaps[0]; // already ordered by last_accessed_at desc
        if (!mostRecent) {
          if (active) setLoading(false);
          return;
        }

        const structure = await fetchRoadmapStructure(mostRecent.roadmap_id);
        const progress = await fetchUserProgress(userId, mostRecent.roadmap_id);
        const { overallPercent } = calculateProgress(structure, progress);

        if (active) setCurrent({ roadmap: mostRecent.roadmaps, overallPercent });
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-5">
        <p className="text-sm text-slate-500">Loading your roadmap...</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Map size={16} className="text-indigo-400" />
          <p className="text-sm font-semibold text-white">Start your career roadmap</p>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Follow a structured path from fundamentals to job-ready.
        </p>
        <button
          onClick={onExplore}
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
        >
          Explore Roadmaps <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  const Icon = Icons[current.roadmap?.icon] || Icons.Compass;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-indigo-400" />
        <p className="text-sm font-semibold text-white">Your Career Roadmap</p>
      </div>

      <p className="text-sm text-slate-300 mb-2">{current.roadmap?.title}</p>
      <ProgressBar percent={current.overallPercent} size="sm" showLabel />

      <button
        onClick={onExplore}
        className="mt-4 flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
      >
        Continue Learning <ArrowRight size={14} />
      </button>
    </div>
  );
}
