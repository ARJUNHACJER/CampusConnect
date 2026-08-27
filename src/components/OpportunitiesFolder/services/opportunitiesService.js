/**
 * opportunitiesService.js
 * ------------------------------------------------------------------
 * All Supabase reads/writes for the `opportunities` table. UI
 * components call these functions instead of touching `supabase`
 * directly, so there's exactly one place that knows the table shape.
 * ------------------------------------------------------------------
 */
import { supabase } from "../../../supabaseClient";
import { getExternalOpportunities, normalizeOpportunity, isIndiaLocation } from "./opportunitiesApi";

const TABLE = "opportunities";

/**
 * Students: only active, non-cancelled/draft rows.
 * Admins: pass includeInactive to see everything (drafts, deactivated, etc).
 */
export async function listOpportunities({ includeInactive = false } = {}) {
  let query = supabase.from(TABLE).select("*").order("deadline", { ascending: true, nullsFirst: false });
  if (!includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getOpportunityById(id) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

/** Admin: create a manually-entered opportunity. */
export async function createOpportunity(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        ...payload,
        is_external: false,
        source: "admin",
        source_id: null,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Admin: edit any field, including status/is_active. */
export async function updateOpportunity(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function publishOpportunity(id) {
  return updateOpportunity(id, { status: "published", is_active: true });
}

export async function unpublishOpportunity(id) {
  return updateOpportunity(id, { status: "draft", is_active: false });
}

/** Soft delete — matches the doc's "delete/deactivate" requirement without losing history. */
export async function deactivateOpportunity(id) {
  return updateOpportunity(id, { status: "cancelled", is_active: false });
}

export async function deleteOpportunityPermanently(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

/**
 * Admin-only "Sync Opportunities" action (section 14).
 * Fetches from the external API, normalizes, and upserts into
 * Supabase keyed on (source, source_id) so re-running this never
 * creates duplicate rows — it either inserts a new row or updates
 * the existing one in place.
 */
export async function syncExternalOpportunities() {
  const raw = await getExternalOpportunities();
  // India-only campus board: only sync listings based in India (section 1),
  // so the "Sync" action never floods the board with foreign roles.
  const normalized = raw
    .map((r) => normalizeOpportunity(r, "arbeitnow"))
    .filter((opp) => isIndiaLocation(opp.location));

  let created = 0;
  let updated = 0;
  const errors = [];

  for (const opp of normalized) {
    try {
      const { data: existing, error: lookupError } = await supabase
        .from(TABLE)
        .select("id")
        .eq("source", opp.source)
        .eq("source_id", opp.source_id)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing) {
        const { error } = await supabase.from(TABLE).update(opp).eq("id", existing.id);
        if (error) throw error;
        updated += 1;
      } else {
        const { error } = await supabase.from(TABLE).insert([{ ...opp, is_active: true }]);
        if (error) throw error;
        created += 1;
      }
    } catch (err) {
      errors.push({ title: opp.title, message: err.message });
    }
  }

  return { total: normalized.length, created, updated, errors };
}
