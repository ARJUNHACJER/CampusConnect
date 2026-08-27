import { useCallback, useEffect, useState } from "react";
import {
  listSavedOpportunityIds,
  saveOpportunity,
  unsaveOpportunity,
  listSavedExternalKeys,
  saveExternalOpportunity,
  unsaveExternalOpportunity,
} from "../services/savedOpportunitiesService";

/**
 * useSavedOpportunities
 *
 * `savedIds` is a Set of card ids that are currently saved. A card id is
 * either a Supabase uuid (curated/synced rows) or the synthetic
 * `ext:<source>:<source_id>` for live-only external rows. Toggling routes
 * to the right table automatically.
 *
 * `toggleSave` accepts the full opportunity object (preferred — required
 * for external saves, which store a snapshot) or a bare id string.
 *
 * NOTE: this needs the logged-in student's id — pass it from wherever your
 * app exposes the current user (e.g. `useSavedOpportunities(currentUser.id)`).
 */
function keyOf(opportunityOrId) {
  return typeof opportunityOrId === "string" ? opportunityOrId : opportunityOrId?.id;
}

function isExternalKey(key) {
  return typeof key === "string" && key.startsWith("ext:");
}

export function useSavedOpportunities(userId) {
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (!userId) {
      setSavedIds(new Set());
      return;
    }
    Promise.allSettled([listSavedOpportunityIds(userId), listSavedExternalKeys(userId)])
      .then(([dbRes, extRes]) => {
        const ids = [
          ...(dbRes.status === "fulfilled" ? dbRes.value : []),
          ...(extRes.status === "fulfilled" ? extRes.value : []),
        ];
        setSavedIds(new Set(ids));
      })
      .catch(() => {
        /* leave savedIds empty on failure — non-fatal for the page */
      });
  }, [userId]);

  const toggleSave = useCallback(
    async (opportunityOrId) => {
      if (!userId) return;
      const key = keyOf(opportunityOrId);
      if (!key) return;

      const external = isExternalKey(key);
      const opportunity = typeof opportunityOrId === "object" ? opportunityOrId : null;
      // External saves need the full object (for the stored snapshot).
      if (external && !opportunity) return;

      const wasSaved = savedIds.has(key);

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });

      try {
        if (external) {
          if (wasSaved) {
            await unsaveExternalOpportunity(userId, opportunity);
          } else {
            await saveExternalOpportunity(userId, opportunity);
          }
        } else if (wasSaved) {
          await unsaveOpportunity(userId, key);
        } else {
          await saveOpportunity(userId, key);
        }
      } catch {
        // Revert the optimistic update if the write failed.
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) {
            next.add(key);
          } else {
            next.delete(key);
          }
          return next;
        });
      }
    },
    [userId, savedIds]
  );

  return { savedIds, toggleSave };
}
