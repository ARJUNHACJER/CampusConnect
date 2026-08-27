// Persistence layer for resumes.
//
// Reuses the CampusConnect Supabase client (../supabaseClient) — no new
// database is introduced. If the `resumes` table doesn't exist yet, or the
// request fails for any reason (offline, RLS not configured while you're
// setting things up, etc.), calls fall back to a localStorage-backed store
// so the feature still works end-to-end. Run sql/resumes.sql in your
// Supabase project to enable real persistence.
//
// Adjust the import path below to match where supabaseClient actually
// lives relative to this file once it's dropped into the project.
import { supabase } from "../../supabaseClient";

const LOCAL_KEY = "campusconnect_resumes_v1";

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
}

function writeLocal(list) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

function nowIso() {
  return new Date().toISOString();
}

function localId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listResumes(userId) {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    if (data) return data;
  } catch (err) {
    console.warn("[resumeService] Falling back to local storage for listResumes:", err.message);
  }
  return readLocal()
    .filter((r) => r.user_id === userId)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

export async function getResume(id) {
  try {
    const { data, error } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (data) return data;
  } catch (err) {
    console.warn("[resumeService] Falling back to local storage for getResume:", err.message);
  }
  return readLocal().find((r) => r.id === id) || null;
}

export async function saveResume({ id, userId, resumeName, template, resumeData, completionPercentage }) {
  const record = {
    id,
    user_id: userId,
    resume_name: resumeName,
    template,
    resume_data: resumeData,
    completion_percentage: completionPercentage,
    updated_at: nowIso(),
    created_at: id ? undefined : nowIso(),
  };

  try {
    const payload = id ? record : { ...record, created_at: nowIso() };
    const { data, error } = await supabase
      .from("resumes")
      .upsert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("[resumeService] Falling back to local storage for saveResume:", err.message);
  }

  const list = readLocal();
  const localRecord = { ...record, id: record.id || localId() };
  const existingIndex = list.findIndex((r) => r.id === localRecord.id);
  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...localRecord };
  } else {
    list.push({ ...localRecord, created_at: localRecord.created_at || nowIso() });
  }
  writeLocal(list);
  return list.find((r) => r.id === localRecord.id);
}

export async function deleteResume(id) {
  try {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("[resumeService] Falling back to local storage for deleteResume:", err.message);
  }
  writeLocal(readLocal().filter((r) => r.id !== id));
  return true;
}

export async function duplicateResume(resume) {
  return saveResume({
    id: undefined,
    userId: resume.user_id,
    resumeName: `${resume.resume_name} (Copy)`,
    template: resume.template,
    resumeData: resume.resume_data,
    completionPercentage: resume.completion_percentage,
  });
}
