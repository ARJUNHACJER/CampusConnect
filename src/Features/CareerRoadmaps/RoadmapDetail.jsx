import React, { useEffect, useState, useCallback } from "react";
import * as Icons from "lucide-react";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import ProgressBar from "./ProgressBar";
import RoadmapTimeline from "./RoadmapTimeline";
import TopicDetails from "./TopicDetails";
import {
  fetchRoadmapById,
  fetchRoadmapStructure,
  fetchUserProgress,
  fetchUserRoadmapFor,
  startRoadmap,
  touchUserRoadmap,
  updateTopicProgress,
  calculateProgress,
  findContinueTopic,
} from "../../services/roadmapService";

export default function RoadmapDetail({ roadmapId, userId, onBack }) {
  const [roadmap, setRoadmap] = useState(null);
  const [structure, setStructure] = useState([]);
  const [userRoadmap, setUserRoadmap] = useState(null);
  const [progressRows, setProgressRows] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roadmapData, structureData] = await Promise.all([
        fetchRoadmapById(roadmapId),
        fetchRoadmapStructure(roadmapId),
      ]);
      setRoadmap(roadmapData);
      setStructure(structureData);

      if (userId) {
        const [ur, progress] = await Promise.all([
          fetchUserRoadmapFor(userId, roadmapId),
          fetchUserProgress(userId, roadmapId),
        ]);
        setUserRoadmap(ur);
        setProgressRows(progress);
      }
    } catch (e) {
      console.error(e);
      setError("Unable to load roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [roadmapId, userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6 animate-pulse"><div className="h-5 w-40 rounded bg-white/10" /><div className="h-36 rounded-2xl bg-white/10" /><div className="h-24 rounded-2xl bg-white/10" /></div>;
  }

  if (error || !roadmap) {
    return (
      <div className="p-6">
        <p className="text-rose-400 text-sm mb-3">{error || "Roadmap not found."}</p>
        <button onClick={load} className="text-sm text-indigo-300 underline">
          Try again
        </button>
      </div>
    );
  }

  const Icon = Icons[roadmap.icon] || Icons.Compass;
  const { statusByTopic, overallPercent, phaseProgress } = calculateProgress(structure, progressRows);
  const continueTopic = userRoadmap ? findContinueTopic(structure, userRoadmap, statusByTopic) : null;

  const handleStart = async () => {
    if (!userId) return;
    setStarting(true);
    try {
      const ur = await startRoadmap(userId, roadmapId);
      setUserRoadmap(ur);
      const progress = await fetchUserProgress(userId, roadmapId);
      setProgressRows(progress);
    } catch (e) {
      console.error(e);
      setError("Unable to start roadmap. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const handleSelectTopic = (topic) => setSelectedTopic(topic);

  const handleUpdateStatus = async (topicId, status) => {
    if (!userId) return;
    try {
      await updateTopicProgress(userId, roadmapId, topicId, status);
      await touchUserRoadmap(userId, roadmapId, topicId);
      const progress = await fetchUserProgress(userId, roadmapId);
      setProgressRows(progress);
    } catch (e) {
      setError(e.message || "Unable to update topic progress. Please try again.");
    }
  };

  const selectedTopicStatus = selectedTopic ? statusByTopic.get(selectedTopic.id) || "not_started" : null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4"
      >
        <ArrowLeft size={16} /> Back to Roadmaps
      </button>

      {/* HEADER */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-5 sm:p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center ring-1 ring-inset ring-indigo-500/30 shrink-0">
            <Icon size={22} className="text-indigo-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white">{roadmap.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{roadmap.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
              <span>{roadmap.difficulty}</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> {roadmap.estimated_duration}
              </span>
            </div>
          </div>
        </div>

        {userRoadmap ? (
          <div className="mt-5">
            <p className="text-sm text-slate-300 mb-2">Your Progress: {overallPercent}%</p>
            <ProgressBar percent={overallPercent} />
            {continueTopic && (
              <button
                onClick={() => handleSelectTopic(continueTopic)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-purple-600 px-4 py-2 rounded-xl hover:opacity-90"
              >
                Continue Learning <ArrowRight size={15} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleStart}
            disabled={starting || !userId}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-purple-600 px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {starting ? "Starting..." : userId ? "Start Roadmap" : "Log in to start this roadmap"}
          </button>
        )}
      </div>

      {/* TIMELINE */}
      {structure.length === 0 ? (
        <p className="text-sm text-slate-500">This roadmap doesn't have any content yet.</p>
      ) : (
        <RoadmapTimeline
          structure={structure}
          statusByTopic={statusByTopic}
          phaseProgress={phaseProgress}
          onSelectTopic={handleSelectTopic}
        />
      )}

      {selectedTopic && (
        <TopicDetails
          topic={selectedTopic}
          status={selectedTopicStatus}
          onClose={() => setSelectedTopic(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
