import React from "react";
import { Pencil, Trash2, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { Badge, EmptyState } from "../../../shared/ui/primitives";
import { CONTACT_CATEGORIES } from "../../emergency/mockData";
import { Phone } from "lucide-react";

/**
 * ContactManagementTable
 * ---------------------------------------------------------------------------
 * Admin list view for all emergency/help contacts (active + inactive).
 * Reordering swaps `priority` between adjacent rows within the same
 * category and calls onReorder(updatedList) with the new priorities.
 * ---------------------------------------------------------------------------
 */
export default function ContactManagementTable({
  contacts,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder,
}) {
  const categoryLabel = (id) =>
    CONTACT_CATEGORIES.find((c) => c.id === id)?.label || id;

  const move = (contact, direction) => {
    const sameCategory = contacts
      .filter((c) => c.category === contact.category)
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

    const idx = sameCategory.findIndex((c) => c.id === contact.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameCategory.length) return;

    const a = sameCategory[idx];
    const b = sameCategory[swapIdx];
    const updated = contacts.map((c) => {
      if (c.id === a.id) return { ...c, priority: b.priority };
      if (c.id === b.id) return { ...c, priority: a.priority };
      return c;
    });
    onReorder(updated);
  };

  if (!contacts || contacts.length === 0) {
    return (
      <EmptyState
        icon={Phone}
        title="No contacts yet"
        description="Add your first emergency or help contact to make it visible to students."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5 text-left text-xs text-slate-400 uppercase tracking-wide">
            <th className="px-4 py-3 font-semibold">Service</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold hidden md:table-cell">Contact</th>
            <th className="px-4 py-3 font-semibold hidden lg:table-cell">Availability</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-white/[0.03] transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-white">{contact.name}</p>
                <p className="text-xs text-slate-500 truncate max-w-[220px]">
                  {contact.description}
                </p>
              </td>
              <td className="px-4 py-3">
                <Badge tone="neutral">{categoryLabel(contact.category)}</Badge>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-slate-300 text-xs">
                <p>{contact.phone}</p>
                {contact.email ? <p className="text-slate-500">{contact.email}</p> : null}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} className="text-slate-500" />
                  {contact.availability}
                  {(contact.availability || "").toUpperCase() === "24/7" && (
                    <Badge tone="green" className="ml-1">24/7</Badge>
                  )}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleActive(contact)}
                  className="focus:outline-none"
                  aria-label={contact.active ? "Deactivate" : "Activate"}
                >
                  <Badge tone={contact.active ? "green" : "neutral"}>
                    {contact.active ? "Active" : "Disabled"}
                  </Badge>
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => move(contact, "up")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => move(contact, "down")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => onEdit(contact)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(contact)}
                    className="p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-500/10"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
