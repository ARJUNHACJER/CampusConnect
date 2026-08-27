/**
 * savedOpportunitiesService.js
 * ------------------------------------------------------------------
 * Reads/writes for saved opportunities. Two backing tables:
 *
 *  • `saved_opportunities`          — one row per (user_id, opportunity_id)
 *    for opportunities that exist as real rows in `opportunities`
 *    (admin-created or admin-synced). uuid FK, see 001_opportunities.sql.
 *
 *  • `saved_external_opportunities` — one row per (user_id, source,
 *    source_id) for LIVE external listings a student saves before they've
 *    been synced into `opportunities`. Stores a jsonb snapshot so the save
 *    survives even if the provider drops the listing. See
 *    003_external_opportunities.sql.
 *
 * The student board keys everything by the card's `id`: a uuid for DB rows,
 * or the synthetic `ext:<source>:<source_id>` for live-only rows.
 * ------------------------------------------------------------------
 */
import { supabase } from "../../../supabaseClient";

const TABLE = "saved_opportunities";
const EXTERNAL_TABLE = "saved_external_opportunities";

export async function listSavedOpportunityIds(userId) {
  if (!userId) return [];
  const { data, error } = await supabase.from(TABLE).select("opportunity_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.opportunity_id);
}

export async function saveOpportunity(userId, opportunityId) {
  const { error } = await supabase
    .from(TABLE)
    .insert([{ user_id: userId, opportunity_id: opportunityId }]);
  // 23505 = unique_violation — already saved, safe to ignore.
  if (error && error.code !== "23505") throw error;
}

export async function unsaveOpportunity(userId, opportunityId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId);
  if (error) throw error;
}

/* ---------------------------------------------------------------------------
 * External (live) opportunity saves — keyed by (source, source_id).
 * Returns/consumes the same synthetic `ext:<source>:<source_id>` ids the
 * board renders, so saved-state tracking is uniform across both tables.
 * ------------------------------------------------------------------------- */

export async function listSavedExternalKeys(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from(EXTERNAL_TABLE)
    .select("source, source_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => `ext:${row.source}:${row.source_id}`);
}

export async function saveExternalOpportunity(userId, opportunity) {
  const snapshot = { ...opportunity };
  // Drop client-only fields that don't belong in the stored snapshot.
  delete snapshot.id;
  delete snapshot.is_active;

  const { error } = await supabase.from(EXTERNAL_TABLE).insert([
    {
      user_id: userId,
      source: opportunity.source,
      source_id: opportunity.source_id,
      snapshot,
    },
  ]);
  if (error && error.code !== "23505") throw error;
}

export async function unsaveExternalOpportunity(userId, opportunity) {
  const { error } = await supabase
    .from(EXTERNAL_TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("source", opportunity.source)
    .eq("source_id", opportunity.source_id);
  if (error) throw error;
}
