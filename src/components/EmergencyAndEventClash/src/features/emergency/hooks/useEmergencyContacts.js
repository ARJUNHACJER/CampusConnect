import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../../../supabaseClient";
import { MOCK_EMERGENCY_CONTACTS } from "../mockData";

/**
 * useEmergencyContacts()
 * ---------------------------------------------------------------------------
 * Student-facing read hook. Fetches only `active = true` contacts, ordered
 * by priority. Falls back to local mock data if the `emergency_contacts`
 * table doesn't exist yet or the query fails — so the UI is never blank
 * during development.
 * ---------------------------------------------------------------------------
 */
export function useEmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("active", true)
        .order("priority", { ascending: true });

      if (sbError) throw sbError;

      if (data && data.length > 0) {
        setContacts(data);
      } else {
        // Table is empty (or unavailable) — fall back to the real nationwide
        // emergency helplines so students always have access to emergency
        // numbers, even before an admin configures campus-specific contacts.
        setContacts(MOCK_EMERGENCY_CONTACTS.filter((c) => c.active));
      }
    } catch (err) {
      // Table not created yet / offline dev environment — use mock data.
      console.warn("[useEmergencyContacts] Falling back to mock data:", err.message);
      setContacts(MOCK_EMERGENCY_CONTACTS.filter((c) => c.active));
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, error, refetch: fetchContacts };
}

export default useEmergencyContacts;
