import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { EmptyState, LoadingSkeleton, PrimaryButton } from "../components/AdminUI";
import { supabase } from "../../supabaseClient";

export default function AdminCertificates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [template, setTemplate] = useState("classic");

  const load = async () => {
    setLoading(true);
    const [{ data: events }, { data: results }, { data: registrations }] = await Promise.all([
      supabase.from("events").select("id,title").order("date", { ascending: false }),
      supabase.from("event_results").select("event_id,details").eq("status", "published"),
      supabase.from("event_registrations").select("event_id").in("status", ["attended", "accepted", "registered"]),
    ]);
    const resultByEvent = Object.fromEntries((results || []).map((result) => [result.event_id, result]));
    const counts = (registrations || []).reduce((map, row) => ({ ...map, [row.event_id]: (map[row.event_id] || 0) + 1 }), {});
    setItems((events || []).filter((event) => resultByEvent[event.id]).map((event) => ({ eventId: event.id, eventName: event.title, participants: counts[event.id] || 0, result: resultByEvent[event.id] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generate = async (item) => {
    setProcessing(item.eventId);
    const { data: registrations } = await supabase.from("event_registrations").select("user_id").eq("event_id", item.eventId).in("status", ["attended", "accepted", "registered"]);
    const ids = [...new Set((registrations || []).map((row) => row.user_id).filter(Boolean))];
    const { data: profiles } = ids.length ? await supabase.from("profiles").select("user_id,full_name,display_name").in("user_id", ids) : { data: [] };
    const names = Object.fromEntries((profiles || []).map((profile) => [profile.user_id, profile.full_name || profile.display_name || "Student"]));
    const winners = (item.result.details || []).map((row) => ({ name: String(row.name || "").toLowerCase(), position: row.position || "Achievement" }));
    const rows = (registrations || []).map((row) => ({ certificate_id: `CC-CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`, event_id: item.eventId, event_name: item.eventName, student_id: row.user_id, recipient_name: names[row.user_id] || "Student", type: winners.some((winner) => winner.name === (names[row.user_id] || "").toLowerCase()) ? "winner" : "participation", template, issue_date: new Date().toISOString().slice(0, 10), status: "published" }));
    if (rows.length) await supabase.from("certificates").insert(rows);
    await load();
    setProcessing(null);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Completed events are listed here automatically. Generating certificates prepares them for students under{" "}
        <span className="text-slate-300">Student Portal → Student Toolkit → Achievements</span>.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><div><p className="text-sm font-semibold text-white">Certificate template</p><p className="text-xs text-slate-400">Choose the design used for generated certificates.</p></div><select className="rounded-xl border border-white/10 bg-[#181229] px-3 py-2 text-sm text-white" value={template} onChange={(event) => setTemplate(event.target.value)}><option value="classic">Classic</option><option value="modern">Modern</option><option value="minimal">Minimal</option></select></div>
      {loading ? <LoadingSkeleton rows={4} /> : items.length === 0 ? (
        <EmptyState icon={Award} title="No result-ready events" description="Publish event results first; eligible students will appear here." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.eventId} className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex flex-wrap items-center gap-4"><Award className="text-amber-300" /><div className="min-w-0 flex-1"><p className="font-semibold text-white">{item.eventName}</p><p className="text-xs text-slate-400">{item.participants} eligible participants</p></div><PrimaryButton disabled={processing === item.eventId || item.participants === 0} onClick={() => generate(item)}>{processing === item.eventId ? "Generating..." : "Generate & Publish"}</PrimaryButton></div><div className="mt-4 flex flex-wrap gap-2">{(item.result.details || []).map((rank, index) => <span key={`${rank.name}-${index}`} className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"><b>{rank.position || `${index + 1} Place`}</b> · {rank.name}</span>)}</div></div>
          ))}
        </div>
      )}
    </div>
  );
}
