import React, { useMemo, useState } from "react";
import { Briefcase, Plus, Inbox, RefreshCw } from "lucide-react";
import { OPPORTUNITY_TYPES } from "../../../data/opportunityConstants";
import { useOpportunities } from "../../../hooks/useOpportunities";
import {
  publishOpportunity,
  unpublishOpportunity,
  deactivateOpportunity,
  syncExternalOpportunities,
} from "../../../services/opportunitiesService";
import OpportunityManagementTable from "./OpportunityManagementTable";
import { SkeletonTable } from "../../../../ui/Skeleton";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "published", label: "Published" },
  { id: "closing_soon", label: "Closing Soon" },
  { id: "expired", label: "Expired" },
  { id: "cancelled", label: "Cancelled" },
];

/**
 * AdminOpportunities
 * Route: /admin/opportunities
 * Admin-only. Frontend route protection should wrap this component
 * (redirect non-admins) in addition to Supabase RLS on the backend —
 * see supabase/migrations/001_opportunities.sql.
 */
export default function AdminOpportunities({ onCreateNew, onView, onEdit }) {
  const { opportunities, isLoading, error, reload } = useOpportunities({ includeInactive: true });
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (typeFilter !== "all" && o.type !== typeFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    });
  }, [opportunities, typeFilter, statusFilter]);

  const handlePublish = async (id) => {
    await publishOpportunity(id);
    reload();
  };
  const handleUnpublish = async (id) => {
    await unpublishOpportunity(id);
    reload();
  };
  const handleDelete = async (id) => {
    await deactivateOpportunity(id);
    reload();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    try {
      const result = await syncExternalOpportunities();
      setSyncResult(result);
      reload();
    } catch (err) {
      setSyncError(err.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={20} className="text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Manage Opportunities</h1>
          </div>
          <p className="text-sm text-slate-400">
            Create, publish, and track opportunities visible to students.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync Opportunities"}
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Create Opportunity
          </button>
        </div>
      </div>

      {/* Sync result banner */}
      {syncResult && (
        <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
          Successfully synced {syncResult.total} opportunities — {syncResult.created} new,{" "}
          {syncResult.updated} updated.
          {syncResult.errors.length > 0 && (
            <span className="block mt-1 text-orange-300">
              {syncResult.errors.length} item(s) failed to sync.
            </span>
          )}
        </div>
      )}
      {syncError && (
        <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          Sync failed: {syncError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t.id} value={t.id} className="bg-[#0d1220]">
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#0d1220]">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table / states */}
      {isLoading ? (
        <SkeletonTable rows={6} columns={7} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm text-slate-400 mb-4">Unable to load opportunities.</p>
          <button
            type="button"
            onClick={reload}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold"
          >
            Try Again
          </button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl bg-white/5 border border-white/10">
          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Inbox size={24} className="text-slate-500" />
          </div>
          <h3 className="text-white font-semibold mb-1">No opportunities yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mb-5">
            Create your first opportunity, or sync from the external provider.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold"
          >
            Create Opportunity
          </button>
        </div>
      ) : (
        <OpportunityManagementTable
          opportunities={filtered}
          onView={onView}
          onEdit={onEdit}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
