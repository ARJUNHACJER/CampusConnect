import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "../supabaseClient";

const missing = (value) => value === null || value === undefined || value === "" ? "-" : value;

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.from("event_results").select("*").eq("status", "published").order("published_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) setError(queryError.message);
        else setResults(data || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Results</h1>
      <p className="mt-1 text-sm text-slate-400">Published event results and achievements.</p>
      <div className="mt-6 space-y-4">
        {loading && Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
        {!loading && error && <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
        {!loading && !error && results.length === 0 && <div className="rounded-2xl bg-white/5 p-10 text-center"><Trophy className="mx-auto text-slate-500" /><p className="mt-3 text-sm text-slate-400">No published results yet.</p></div>}
        {!loading && !error && results.map((result) => (
          <article key={result.id} className="rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-semibold text-white">{missing(result.title)}</h2><p className="mt-1 text-xs text-slate-500">Published {missing(result.published_at ? new Date(result.published_at).toLocaleDateString() : null)}</p></div>
              <Trophy size={20} className="text-amber-400" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(Array.isArray(result.details) ? result.details : []).map((placement, index) => <div key={index} className="rounded-xl bg-white/5 p-3"><p className="text-sm font-semibold text-amber-300">{missing(placement.position)}</p><p className="mt-1 text-sm text-white">{missing(placement.name)}</p><p className="mt-1 text-xs text-slate-400">{missing(placement.department)}</p><p className="mt-1 text-xs text-slate-400">{missing(placement.achievement)}</p></div>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
