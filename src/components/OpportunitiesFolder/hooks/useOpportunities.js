import { useCallback, useEffect, useState } from "react";
import { listOpportunities } from "../services/opportunitiesService";
import { getLiveOpportunities } from "../services/opportunitiesApi";

/**
 * useOpportunities
 * Loads opportunities for the board/admin table.
 *
 *  • Always reads the curated rows from Supabase (`opportunities`).
 *  • With `includeLive: true` (student board) it ALSO fetches live
 *    listings from the external provider and merges them in, deduped by
 *    (source, source_id) — so students see fresh internships/jobs even
 *    before an admin has synced them. DB rows win on conflict.
 *
 * Failure handling is deliberately forgiving:
 *  • DB ok + live down  → show DB rows, set `liveError` (soft notice).
 *  • DB down + live ok  → show live rows (no fatal error).
 *  • both down          → `error` set, board shows the retry state.
 */
export function useOpportunities({ includeInactive = false, includeLive = false } = {}) {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveError, setLiveError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLiveError(false);

    const [dbSettled, liveSettled] = await Promise.allSettled([
      listOpportunities({ includeInactive }),
      includeLive ? getLiveOpportunities() : Promise.resolve(null),
    ]);

    const dbRows = dbSettled.status === "fulfilled" ? dbSettled.value || [] : [];
    const dbFailed = dbSettled.status === "rejected";

    let merged = dbRows;
    if (includeLive) {
      if (liveSettled.status === "fulfilled" && Array.isArray(liveSettled.value)) {
        const seen = new Set(dbRows.map((r) => `${r.source}:${r.source_id}`));
        const liveOnly = liveSettled.value.filter((o) => !seen.has(`${o.source}:${o.source_id}`));
        merged = [...dbRows, ...liveOnly];
      } else {
        setLiveError(true);
      }
    }

    // Only a hard error if the DB read failed AND nothing else is showable.
    if (dbFailed && merged.length === 0) {
      setError(dbSettled.reason || new Error("Failed to load opportunities."));
    }

    setOpportunities(merged);
    setIsLoading(false);
  }, [includeInactive, includeLive]);

  useEffect(() => {
    load();
  }, [load]);

  return { opportunities, isLoading, error, reload: load, liveError };
}
