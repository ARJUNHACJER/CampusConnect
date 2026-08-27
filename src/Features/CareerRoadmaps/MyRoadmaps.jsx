import React, { useEffect, useState, useCallback } from "react";
import * as Icons from "lucide-react";
import { Trash2 } from "lucide-react";
import ProgressBar from "./ProgressBar";
import {
  fetchUserRoadmaps,
  fetchRoadmapStructure,
  fetchUserProgress,
  calculateProgress,
  removeUserRoadmap,
} from "../../services/roadmapService";

export default function MyRoadmaps({ userId, onView }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userRoadmaps = await fetchUserRoadmaps(userId);

      const enriched = await Promise.all(
        userRoadmaps.map(async (ur) => {
          const structure = await fetchRoadmapStructure(ur.roadmap_id);
          const progress = await fetchUserProgress(userId, ur.roadmap_id);
          const { overallPercent } = calculateProgress(structure, progress);
          return { ...ur, overallPercent };
        })
      );

      setRows(enriched);
    } catch (e) {
      console.error(e);
      setError("Unable to load your roadmaps. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (roadmapId) => {
    if (!userId) return;
    setRemovingId(roadmapId);
    try {
      await removeUserRoadmap(userId, roadmapId);
      setRows((prev) => prev.filter((r) => r.roadmap_id !== roadmapId));
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingId(null);
    }
  };

  if (!userId) {
    return <p className="text-sm text-slate-500">Log in to track your roadmaps.</p>;
  }

  if (loading) return <p className="text-sm text-slate-400">Loading your roadmaps...</p>;

  if (error) {
    return (
      <div>
        <p className="text-sm text-rose-400 mb-2">{error}</p>
        <button onClick={load} className="text-sm text-indigo-300 underline">
          Try again
        </button>
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">You haven't started any roadmap yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {rows.map((r) => {
        const roadmap = r.roadmaps;
        const Icon = Icons[roadmap?.icon] || Icons.Compass;
        return (
          <div
            key={r.id}
            className="rounded-2xl border border-white/10 bg-[#0d1220] p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/15 flex items-center justify-center ring-1 ring-inset ring-indigo-500/30">
                  <Icon size={16} className="text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{roadmap?.title}</p>
                  <p className="text-xs text-slate-500">
                    Last active {new Date(r.last_accessed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(r.roadmap_id)}
                disabled={removingId === r.roadmap_id}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                title="Remove from My Roadmaps"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <ProgressBar percent={r.overallPercent} size="sm" showLabel />

            <div className="flex gap-2">
              <button
                onClick={() => onView(roadmap)}
                className="flex-1 text-sm font-medium px-3 py-2 rounded-xl text-slate-300 bg-white/5 hover:bg-white/10"
              >
                View
              </button>
              <button
                onClick={() => onView(roadmap)}
                className="flex-1 text-sm font-medium px-3 py-2 rounded-xl text-white bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
