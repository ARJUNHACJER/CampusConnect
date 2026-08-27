import React, { useMemo, useState } from "react";
import { Briefcase, Plus, Inbox } from "lucide-react";
import { MOCK_OPPORTUNITIES, OPPORTUNITY_TYPES } from "../../../data/mockOpportunities";
import OpportunityManagementTable from "./OpportunityManagementTable";

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
 * (redirect non-admins) in addition to Supabase RLS on the backend.
 */
export default function AdminOpportunities({
  opportunities: initialOpportunities = MOCK_OPPORTUNITIES,
  onCreateNew,
  onView,
  onEdit,
}) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (typeFilter !== "all" && o.type !== typeFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    });
  }, [opportunities, typeFilter, statusFilter]);

  const setStatus = (id, status) => {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const handlePublish = (id) =>
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "published", publishedAt: new Date().toISOString().slice(0, 10) } : o))
    );
  const handleUnpublish = (id) => setStatus(id, "draft");
  const handleDelete = (id) => setOpportunities((prev) => prev.filter((o) => o.id !== id));

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
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors shrink-0"
        >
          <Plus size={16} />
          Create Opportunity
        </button>
      </div>

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

      {/* Table / empty state */}
      {opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl bg-white/5 border border-white/10">
          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Inbox size={24} className="text-slate-500" />
          </div>
          <h3 className="text-white font-semibold mb-1">No opportunities yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mb-5">
            Create your first opportunity for students to discover.
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
