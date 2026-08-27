import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { generateCertificateId } from "../shared/mockData";

/* ==========================================================================
   useCertificates
   Reads the student's *published* certificates from Supabase (table:
   `certificates`, see supabase/migrations/002_features.sql). Admin
   generate/publish/revoke helpers are best-effort Supabase writes.

   Falls back to an empty list if the table doesn't exist yet or the query
   fails, so the Certificates page renders its empty state instead of
   crashing before the migration is run. The returned API is unchanged from
   the previous in-memory implementation.
   ========================================================================== */

function mapRow(row) {
  return {
    id: row.id,
    certificateId: row.certificate_id,
    eventId: row.event_id,
    eventName: row.event_name,
    studentId: row.student_id,
    recipientName: row.recipient_name,
    type: row.type,
    issueDate: row.issue_date,
    status: row.status,
    pdfUrl: row.pdf_url,
    template: row.template || "classic",
  };
}

export function useCertificates(currentStudentId) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentStudentId) {
      setCertificates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", currentStudentId)
        .eq("status", "published")
        .order("issue_date", { ascending: false });
      if (error) throw error;
      setCertificates((data || []).map(mapRow));
    } catch (err) {
      console.warn("[useCertificates] Falling back to empty list:", err.message);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [currentStudentId]);

  useEffect(() => {
    load();
  }, [load]);

  // The query already restricts to this student's published certificates;
  // keep the filter so the returned shape is identical to before.
  const myCertificates = useMemo(
    () => certificates.filter((c) => c.status === "published"),
    [certificates]
  );

  const summary = useMemo(() => {
    const total = myCertificates.length;
    const participation = myCertificates.filter(
      (c) => c.type === "participation"
    ).length;
    const achievements = myCertificates.filter((c) =>
      ["winner", "runner_up", "achievement"].includes(c.type)
    ).length;
    const latest = [...myCertificates].sort(
      (a, b) => new Date(b.issueDate) - new Date(a.issueDate)
    )[0];
    return { total, participation, achievements, latest };
  }, [myCertificates]);

  const getByCertificateId = useCallback(
    (certificateId) =>
      certificates.find((c) => c.certificateId === certificateId),
    [certificates]
  );

  /** Admin: generate certificates for a list of eligible students. */
  const generateCertificates = useCallback(
    async (eventId, eventName, eligibleStudents, typeByStudentId = {}) => {
      setLoading(true);
      const rows = eligibleStudents.map((s) => ({
        certificate_id: generateCertificateId(),
        event_id: eventId,
        event_name: eventName,
        student_id: s.id,
        recipient_name: s.name,
        type: typeByStudentId[s.id] || "participation",
        issue_date: new Date().toISOString().slice(0, 10),
        status: "generated",
        pdf_url: null,
      }));
      try {
        const { data, error } = await supabase
          .from("certificates")
          .insert(rows)
          .select();
        if (error) throw error;
        return (data || rows).map(mapRow);
      } catch (err) {
        console.warn("[useCertificates] generate failed:", err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Admin: publish generated certificates so students can see them. */
  const publishCertificates = useCallback(
    async (certificateIds) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("certificates")
          .update({ status: "published" })
          .in("id", certificateIds);
        if (error) throw error;
        await load();
      } catch (err) {
        console.warn("[useCertificates] publish failed:", err.message);
        setLoading(false);
      }
    },
    [load]
  );

  /** Admin: revoke a certificate. */
  const revokeCertificate = useCallback(
    async (certificateId) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("certificates")
          .update({ status: "revoked" })
          .eq("id", certificateId);
        if (error) throw error;
        await load();
      } catch (err) {
        console.warn("[useCertificates] revoke failed:", err.message);
        setLoading(false);
      }
    },
    [load]
  );

  return {
    loading,
    certificates,
    myCertificates,
    summary,
    getByCertificateId,
    generateCertificates,
    publishCertificates,
    revokeCertificate,
  };
}
