// src/services/roadmapService.js
//
// Data-access layer for the Career Roadmap feature.
// Reuses the app's existing Supabase client — do not create another one.
//
// Drop this file at: src/services/roadmapService.js (or wherever your
// other Feature services live — match your existing convention).

import { supabase } from "../supabaseClient"; // adjust path to match your project

/* ============================================================
   ROADMAP LISTING
============================================================ */

export async function fetchRoadmaps() {
  const { data, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("is_published", true)
    .order("title", { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchRoadmapById(roadmapId) {
  const { data, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("id", roadmapId)
    .single();

  if (error) throw error;
  return data;
}

/* ============================================================
   PHASES / TOPICS / RESOURCES  (structured roadmap content)
============================================================ */

// Returns phases -> topics -> resources, nested, ordered correctly.
export async function fetchRoadmapStructure(roadmapId) {
  const { data: phases, error: phaseErr } = await supabase
    .from("roadmap_phases")
    .select("*")
    .eq("roadmap_id", roadmapId)
    .order("order_index", { ascending: true });
  if (phaseErr) throw phaseErr;

  if (!phases?.length) return [];

  const phaseIds = phases.map((p) => p.id);

  const { data: topics, error: topicErr } = await supabase
    .from("roadmap_topics")
    .select("*")
    .in("phase_id", phaseIds)
    .order("order_index", { ascending: true });
  if (topicErr) throw topicErr;

  const topicIds = (topics || []).map((t) => t.id);

  let resources = [];
  if (topicIds.length) {
    const { data: res, error: resErr } = await supabase
      .from("roadmap_resources")
      .select("*")
      .in("topic_id", topicIds)
      .order("order_index", { ascending: true });
    if (resErr) throw resErr;
    resources = res || [];
  }

  return phases.map((phase) => ({
    ...phase,
    topics: (topics || [])
      .filter((t) => t.phase_id === phase.id)
      .map((topic) => ({
        ...topic,
        resources: resources.filter((r) => r.topic_id === topic.id),
      })),
  }));
}

export async function fetchTopicById(topicId) {
  const { data, error } = await supabase
    .from("roadmap_topics")
    .select("*, roadmap_resources(*)")
    .eq("id", topicId)
    .single();

  if (error) throw error;
  return data;
}

/* ============================================================
   USER ROADMAPS  (starting / continuing a roadmap)
============================================================ */

export async function fetchUserRoadmaps(userId) {
  const { data, error } = await supabase
    .from("user_roadmaps")
    .select("*, roadmaps(*)")
    .eq("user_id", userId)
    .order("last_accessed_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchUserRoadmapFor(userId, roadmapId) {
  const { data, error } = await supabase
    .from("user_roadmaps")
    .select("*")
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Starts a roadmap for a user. No-ops (returns existing row) if already started —
// prevents duplicate user_roadmaps records per spec Section 6.
export async function startRoadmap(userId, roadmapId) {
  const existing = await fetchUserRoadmapFor(userId, roadmapId);
  if (existing) return existing;

  const { data: userRoadmap, error } = await supabase
    .from("user_roadmaps")
    .insert({ user_id: userId, roadmap_id: roadmapId })
    .select()
    .single();
  if (error) throw error;

  // Set the first topic (lowest order_index in the first phase) to in_progress.
  const structure = await fetchRoadmapStructure(roadmapId);
  const firstTopic = structure?.[0]?.topics?.[0];
  if (firstTopic) {
    await updateTopicProgress(userId, roadmapId, firstTopic.id, "in_progress");
    await touchUserRoadmap(userId, roadmapId, firstTopic.id);
  }

  return userRoadmap;
}

export async function touchUserRoadmap(userId, roadmapId, lastActiveTopicId) {
  const { error } = await supabase
    .from("user_roadmaps")
    .update({
      last_accessed_at: new Date().toISOString(),
      ...(lastActiveTopicId ? { last_active_topic_id: lastActiveTopicId } : {}),
    })
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId);
  if (error) throw error;
}

// Removes a student's tracking/progress for a roadmap without touching the
// global roadmap content (Section 13 — "Remove from My Roadmaps").
export async function removeUserRoadmap(userId, roadmapId) {
  const { error: progressErr } = await supabase
    .from("user_roadmap_progress")
    .delete()
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId);
  if (progressErr) throw progressErr;

  const { error } = await supabase
    .from("user_roadmaps")
    .delete()
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId);
  if (error) throw error;
}

/* ============================================================
   PROGRESS TRACKING
============================================================ */

export async function fetchUserProgress(userId, roadmapId) {
  const { data, error } = await supabase
    .from("user_roadmap_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId);

  if (error) throw error;
  return data;
}

export async function updateTopicProgress(userId, roadmapId, topicId, status) {
  const payload = {
    user_id: userId,
    roadmap_id: roadmapId,
    topic_id: topicId,
    status,
    completed_at: status === "completed" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("user_roadmap_progress")
    .upsert(payload, { onConflict: "user_id,topic_id" })
    .select()
    .single();

  if (error) throw error;

  // If everything in the roadmap is now complete, stamp completed_at on user_roadmaps.
  if (status === "completed") {
    await maybeMarkRoadmapComplete(userId, roadmapId);
  }

  return data;
}

async function maybeMarkRoadmapComplete(userId, roadmapId) {
  const structure = await fetchRoadmapStructure(roadmapId);
  const allTopicIds = structure.flatMap((p) => p.topics.map((t) => t.id));
  if (!allTopicIds.length) return;

  const progress = await fetchUserProgress(userId, roadmapId);
  const completedIds = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.topic_id)
  );
  const allComplete = allTopicIds.every((id) => completedIds.has(id));

  if (allComplete) {
    await supabase
      .from("user_roadmaps")
      .update({ completed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("roadmap_id", roadmapId);
  }
}

/* ============================================================
   PROGRESS CALCULATION (client-side, from raw progress rows)
============================================================ */

// Computes overall %, per-phase %, and a topic-id -> status map.
// structure: output of fetchRoadmapStructure()
// progressRows: output of fetchUserProgress()
export function calculateProgress(structure, progressRows) {
  const statusByTopic = new Map(progressRows.map((p) => [p.topic_id, p.status]));

  let totalTopics = 0;
  let completedTopics = 0;

  const phaseProgress = structure.map((phase) => {
    const topics = phase.topics.length;
    const completed = phase.topics.filter(
      (t) => statusByTopic.get(t.id) === "completed"
    ).length;

    totalTopics += topics;
    completedTopics += completed;

    return {
      phaseId: phase.id,
      total: topics,
      completed,
      percent: topics ? Math.round((completed / topics) * 100) : 0,
    };
  });

  return {
    statusByTopic,
    totalTopics,
    completedTopics,
    overallPercent: totalTopics
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0,
    phaseProgress,
  };
}

// Finds the topic to resume: last active topic if still incomplete,
// otherwise the first incomplete topic in order (Section 11).
export function findContinueTopic(structure, userRoadmap, statusByTopic) {
  const flatTopics = structure.flatMap((p) => p.topics);

  if (userRoadmap?.last_active_topic_id) {
    const status = statusByTopic.get(userRoadmap.last_active_topic_id);
    if (status !== "completed") {
      const topic = flatTopics.find((t) => t.id === userRoadmap.last_active_topic_id);
      if (topic) return topic;
    }
  }

  return flatTopics.find((t) => statusByTopic.get(t.id) !== "completed") || null;
}

/* ============================================================
   CUSTOM ROADMAP (Section 14 — code/DB based, no AI yet)
============================================================ */

// Builds a personalized topic list by reusing existing roadmap content,
// filtered/trimmed by hours-per-day and target duration. Architecture is
// kept ready for an AI layer to replace `selectTopicsForCustomRoadmap`
// later without changing the surrounding data model.
export function selectTopicsForCustomRoadmap(structure, { hoursPerDay: _hoursPerDay, targetDurationDays }) {
  const flatTopics = structure.flatMap((phase) =>
    phase.topics.map((t) => ({ ...t, phaseTitle: phase.title }))
  );

  if (!targetDurationDays) return flatTopics.map((t) => t.id);

  // Simple day-budget heuristic: assumes each topic's estimated_time maps
  // roughly to a number of days at ~1-2 focused hours; keeps topics until
  // the available day budget runs out. Swap this for an AI-driven planner later.
  let daysUsed = 0;
  const selected = [];
  for (const topic of flatTopics) {
    const days = parseInt(topic.estimated_time, 10) || 3;
    if (daysUsed + days > targetDurationDays) break;
    selected.push(topic.id);
    daysUsed += days;
  }
  return selected.length ? selected : flatTopics.map((t) => t.id);
}

export async function createCustomRoadmap(userId, formValues, baseRoadmapId, generatedTopicIds) {
  const { data, error } = await supabase
    .from("user_custom_roadmaps")
    .insert({
      user_id: userId,
      career_goal: formValues.careerGoal,
      current_skills: formValues.currentSkills,
      experience_level: formValues.experienceLevel,
      hours_per_day: formValues.hoursPerDay,
      target_duration: formValues.targetDuration,
      target_role: formValues.targetRole,
      base_roadmap_id: baseRoadmapId,
      generated_topic_ids: generatedTopicIds,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserCustomRoadmaps(userId) {
  const { data, error } = await supabase
    .from("user_custom_roadmaps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
