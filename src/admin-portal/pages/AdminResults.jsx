import React, { useEffect, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { ResultForm } from "../components/DataComponents";
import { StatusBadge, EmptyState, PrimaryButton } from "../components/AdminUI";
import { supabase } from "../../supabaseClient";

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("list");
  // An event is eligible for results once it has actually happened: either the
  // admin marked it "Completed", or its date is today or in the past. Gating on
  // status === "completed" alone left this page unusable because admins rarely
  // flip that status, so results could never be published.
  const today = new Date().toISOString().slice(0, 10);
  const eligibleEvents = events.filter(
    (event) => event.status?.toLowerCase() === "completed" || (event.date && event.date <= today)
  );

  useEffect(() => {
    Promise.all([
      supabase.from("events").select("id,title,status,date").order("date", { ascending: false }),
      supabase.from("event_results").select("*").order("created_at", { ascending: false }),
    ]).then(([eventResponse, resultResponse]) => {
      if (eventResponse.error || resultResponse.error) {
        window.alert(eventResponse.error?.message || resultResponse.error?.message);
        return;
      }
      const loadedEvents = (eventResponse.data || []).map((e) => ({
        ...e,
        name: e.title || "Untitled Event",
      }));
      setEvents(loadedEvents);
      setResults(resultResponse.data || []);
    });
  }, []);

  const handleSave = (payload, status) => {
    if (!payload.eventId) {
      window.alert("Please select an event first.");
      return;
    }
    // Keep only placements that actually name a winner/team; trim everything.
    const cleaned = (payload.placements || [])
      .map((p) => ({
        position: (p.position || "").trim(),
        name: (p.name || "").trim(),
        department: (p.department || "").trim(),
        prize: (p.prize || "").trim(),
        achievement: (p.achievement || "").trim(),
      }))
      .filter((p) => p.position && p.name && p.department && p.prize && p.achievement);
    if (cleaned.length === 0 || cleaned.length !== (payload.placements || []).length) {
      window.alert("Every result field is required for each placement.");
      return;
    }
    const selected = events.find((e) => e.id === payload.eventId);
    const title = selected?.title || selected?.name || "Event Results";
    supabase.from("event_results").insert({ event_id: payload.eventId, title, details: cleaned, status: status.toLowerCase(), published_at: status === "Published" ? new Date().toISOString() : null }).select().single().then(({ data, error }) => {
      if (error) { window.alert(error.message); return; }
      setResults((prev) => [data, ...prev]);
      setView("list");
    });
  };

  if (view === "create") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Publish Event Results</h2>
          <p className="text-sm text-slate-400 mt-1">
            Once published, results become visible under Student Portal → Updates → Results, and eligible
            participants become available for certificate generation.
          </p>
        </div>
        {eligibleEvents.length === 0 ? (
          <EmptyState title="No events are ready for results yet" description="Results can be published once an event's date has passed or it's marked Completed." />
        ) : (
          <ResultForm
            completedEvents={eligibleEvents}
            onCancel={() => setView("list")}
            onSaveDraft={(p) => handleSave(p, "Draft")}
            onPublish={(p) => handleSave(p, "Published")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{results.length} results</p>
        <PrimaryButton onClick={() => setView("create")}>
          <span className="inline-flex items-center gap-1.5"><Plus size={15} /> Add Result</span>
        </PrimaryButton>
      </div>

      {results.length === 0 ? (
        <EmptyState icon={Trophy} title="No results published yet" description="Publish results for a completed event to notify students." />
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-white">{events.find((event) => event.id === r.event_id)?.title || "-"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Published {r.published_at ? new Date(r.published_at).toLocaleDateString() : "-"}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-4">
                {(r.details || []).map((p, i) => (
                  <div key={i} className="rounded-xl bg-white/5 p-3.5">
                    <p className="text-xs font-semibold text-amber-300">{p.position}</p>
                    <p className="text-sm font-medium text-white mt-1">{p.name}</p>
                    {p.department && <p className="text-xs text-slate-500 mt-0.5">{p.department}</p>}
                    {p.prize && p.prize !== "—" && <p className="text-xs text-slate-400 mt-1">Prize: {p.prize}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
