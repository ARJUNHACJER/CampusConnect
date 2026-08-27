import React, { useState } from "react";
import { Eye, Pencil, UploadCloud, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import { OPPORTUNITY_TYPE_LABEL } from "../../../data/mockOpportunities";

const STATUS_STYLES = {
  draft: "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/30",
  published: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  closing_soon: "bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-500/30",
  expired: "bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-500/30",
  cancelled: "bg-slate-600/20 text-slate-400 ring-1 ring-inset ring-slate-600/30",
};

const STATUS_LABEL = {
  draft: "Draft",
  published: "Published",
  closing_soon: "Closing Soon",
  expired: "Expired",
  cancelled: "Cancelled",
};

/** Small confirmation dialog reused for destructive/state-changing actions */
function ConfirmDialog({ title, description, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0d1220] border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-2">
          {danger && <AlertTriangle size={18} className="text-red-400" />}
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
              danger ? "bg-red-500 hover:bg-red-400" : "bg-indigo-500 hover:bg-indigo-400"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * OpportunityManagementTable
 * Used inside AdminOpportunities.jsx. Actions call back to the parent,
 * which owns the actual data mutation (later: Supabase update/delete).
 */
export default function OpportunityManagementTable({
  opportunities,
  onView,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}) {
  const [pendingAction, setPendingAction] = useState(null); // { type, opportunity }

  const runConfirmed = () => {
    if (!pendingAction) return;
    const { type, opportunity } = pendingAction;
    if (type === "delete") onDelete(opportunity.id);
    if (type === "unpublish") onUnpublish(opportunity.id);
    setPendingAction(null);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {opportunities.map((o) => (
              <tr key={o.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-3 text-white font-medium max-w-[220px] truncate">{o.title}</td>
                <td className="px-4 py-3 text-slate-300">{o.organization}</td>
                <td className="px-4 py-3 text-slate-300">{OPPORTUNITY_TYPE_LABEL[o.type]}</td>
                <td className="px-4 py-3 text-slate-300">
                  {new Date(o.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {o.publishedAt
                    ? new Date(o.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${STATUS_STYLES[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn label="View" onClick={() => onView(o.id)}>
                      <Eye size={15} />
                    </IconBtn>
                    <IconBtn label="Edit" onClick={() => onEdit(o.id)}>
                      <Pencil size={15} />
                    </IconBtn>
                    {o.status === "draft" ? (
                      <IconBtn label="Publish" onClick={() => onPublish(o.id)}>
                        <UploadCloud size={15} />
                      </IconBtn>
                    ) : (
                      <IconBtn
                        label="Unpublish"
                        onClick={() => setPendingAction({ type: "unpublish", opportunity: o })}
                      >
                        <EyeOff size={15} />
                      </IconBtn>
                    )}
                    <IconBtn
                      label="Delete"
                      danger
                      onClick={() => setPendingAction({ type: "delete", opportunity: o })}
                    >
                      <Trash2 size={15} />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {opportunities.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No opportunities match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingAction?.type === "delete" && (
        <ConfirmDialog
          title="Delete opportunity?"
          description={`"${pendingAction.opportunity.title}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={runConfirmed}
          onCancel={() => setPendingAction(null)}
        />
      )}
      {pendingAction?.type === "unpublish" && (
        <ConfirmDialog
          title="Unpublish opportunity?"
          description={`"${pendingAction.opportunity.title}" will be hidden from students until republished.`}
          confirmLabel="Unpublish"
          onConfirm={runConfirmed}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </>
  );
}

function IconBtn({ children, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-2 rounded-lg transition-colors ${
        danger ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10" : "text-slate-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
