import React, { useEffect, useState, useCallback } from "react";
import { Search, Sparkles } from "lucide-react";
import { supabase } from "../../supabaseClient"; // adjust path to match your project
import RoadmapCard from "./RoadmapCard";
import RoadmapDetail from "./RoadmapDetail";
import MyRoadmaps from "./MyRoadmaps";
import CustomRoadmap from "./CustomRoadmap";
import {
  fetchRoadmaps,
  fetchRoadmapStructure,
  fetchUserRoadmaps,
  fetchUserProgress,
  startRoadmap,
  calculateProgress,
} from "../../services/roadmapService";

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CareerRoadmaps() {
  const [view, setView] = useState("list"); // list | detail | custom
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);

  const [userId, setUserId] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [progressByRoadmap, setProgressByRoadmap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchRoadmaps();

      const withCounts = await Promise.all(
        list.map(async (r) => {
          const structure = await fetchRoadmapStructure(r.id);
          const topicCount = structure.reduce((sum, p) => sum + p.topics.length, 0);
          return { ...r, phaseCount: structure.length, topicCount, _structure: structure };
        })
      );
      setRoadmaps(withCounts);

      if (userId) {
        const userRoadmaps = await fetchUserRoadmaps(userId);
        const progressMap = {};
        await Promise.all(
          userRoadmaps.map(async (ur) => {
            const structure = withCounts.find((r) => r.id === ur.roadmap_id)?._structure || [];
            const progress = await fetchUserProgress(userId, ur.roadmap_id);
            progressMap[ur.roadmap_id] = calculateProgress(structure, progress);
          })
        );
        setProgressByRoadmap(progressMap);
      }
    } catch (e) {
      console.error(e);
      setError("Unable to load roadmaps. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleView = (roadmap) => {
    setSelectedRoadmapId(roadmap.id);
    setView("detail");
  };

  const handleStart = async (roadmap) => {
    if (!userId) {
      handleView(roadmap);
      return;
    }
    try {
      await startRoadmap(userId, roadmap.id);
    } catch (e) {
      console.error(e);
    }
    handleView(roadmap);
  };

  if (view === "detail" && selectedRoadmapId) {
    return (
      <RoadmapDetail
        roadmapId={selectedRoadmapId}
        userId={userId}
        onBack={() => {
          setView("list");
          load();
        }}
      />
    );
  }

  if (view === "custom") {
    return (
      <CustomRoadmap
        userId={userId}
        onBack={() => setView("list")}
        onCreated={(_, baseRoadmap) => handleView(baseRoadmap)}
      />
    );
  }

  const categories = ["All", ...new Set(roadmaps.map((r) => r.category))];

  const filtered = roadmaps.filter((r) => {
    const matchesSearch = (r.title || "").toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || r.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Career Roadmaps</h1>
        <p className="text-sm text-slate-400 mt-1">
          Choose a career path and follow a structured learning journey from fundamentals to career preparation.
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roadmaps..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50"
          />
        </div>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Difficulties" : d}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Categories" : c}
            </option>
          ))}
        </select>

        <button
          onClick={() => setView("custom")}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl px-4 py-2.5 hover:opacity-90 shrink-0"
        >
          <Sparkles size={15} /> Create Custom Roadmap
        </button>
      </div>

      {/* LISTING */}
      {loading ? (
        <p className="text-sm text-slate-400">Loading roadmaps...</p>
      ) : error ? (
        <div>
          <p className="text-sm text-rose-400 mb-2">{error}</p>
          <button onClick={load} className="text-sm text-indigo-300 underline">
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No roadmaps match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {filtered.map((roadmap) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              progress={progressByRoadmap[roadmap.id]}
              onView={handleView}
              onStart={handleStart}
            />
          ))}
        </div>
      )}

      {/* MY ROADMAPS */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">My Roadmaps</h2>
        <MyRoadmaps userId={userId} onView={handleView} />
      </div>
    </div>
  );
}
