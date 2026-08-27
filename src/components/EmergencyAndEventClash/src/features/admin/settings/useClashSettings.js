import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../../../supabaseClient";

const DEFAULT_SETTINGS = { enabled: true, mode: "warning" };

/**
 * useClashSettings()
 * ---------------------------------------------------------------------------
 * Reads/writes the `event_clash_detection` row in `app_settings`
 * ({ enabled: boolean, mode: "warning" | "strict" }). Defaults to
 * enabled + warning-only if the row doesn't exist yet, per spec.
 * ---------------------------------------------------------------------------
 */
export function useClashSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "event_clash_detection")
        .maybeSingle();
      if (error) throw error;
      setSettings(data?.value || DEFAULT_SETTINGS);
    } catch (err) {
      console.warn("[useClashSettings] Using defaults:", err.message);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateSettings = useCallback(async (next) => {
    setSettings(next); // optimistic
    try {
      await supabase
        .from("app_settings")
        .update({ value: next, updated_at: new Date().toISOString() })
        .eq("key", "event_clash_detection");
    } catch (err) {
      console.warn("[useClashSettings] Save failed:", err.message);
    }
  }, []);

  return { settings, loading, updateSettings, refetch: load };
}

export default useClashSettings;
