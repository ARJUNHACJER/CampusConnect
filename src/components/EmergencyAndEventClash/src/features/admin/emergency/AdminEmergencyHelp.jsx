import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card, Button, ConfirmDialog, LoadingState } from "../../../shared/ui/primitives";
import { supabase } from "../../../../../../supabaseClient";
import { MOCK_EMERGENCY_CONTACTS } from "../../emergency/mockData";
import ContactForm from "./ContactForm";
import ContactManagementTable from "./ContactManagementTable";

/**
 * AdminEmergencyHelp.jsx
 * ---------------------------------------------------------------------------
 * Route: /admin/help  (nested under Admin ▸ Campus Services ▸ Emergency & Help)
 * Access: admin role only — guard this route the same way other /admin/*
 * routes are guarded in the existing Admin Portal router.
 *
 * Falls back to local mock data if the `emergency_contacts` Supabase table
 * doesn't exist yet, so the screen is usable before the backend is wired up.
 * All mutations optimistically update local state and best-effort sync to
 * Supabase — swap in your project's real mutation/error-toast pattern here.
 * ---------------------------------------------------------------------------
 */
export default function AdminEmergencyHelp() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .order("category", { ascending: true })
        .order("priority", { ascending: true });

      if (error) throw error;
      setContacts(data && data.length ? data : MOCK_EMERGENCY_CONTACTS);
    } catch (err) {
      console.warn("[AdminEmergencyHelp] Using mock data:", err.message);
      setContacts(MOCK_EMERGENCY_CONTACTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAddNew = () => {
    setEditingContact(null);
    setFormOpen(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    const isEditing = Boolean(editingContact?.id);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("emergency_contacts")
          .update(payload)
          .eq("id", editingContact.id);
        if (error) throw error;
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? { ...c, ...payload } : c))
        );
      } else {
        const { data, error } = await supabase
          .from("emergency_contacts")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setContacts((prev) => [...prev, data || { ...payload, id: `contact_${Date.now()}` }]);
      }
    } catch (err) {
      console.warn("[AdminEmergencyHelp] Supabase write failed, updating locally:", err.message);
      if (isEditing) {
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? { ...c, ...payload } : c))
        );
      } else {
        setContacts((prev) => [...prev, { ...payload, id: `contact_${Date.now()}` }]);
      }
    } finally {
      setFormOpen(false);
      setEditingContact(null);
    }
  };

  const handleToggleActive = async (contact) => {
    const updated = { ...contact, active: !contact.active };
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? updated : c)));
    try {
      await supabase.from("emergency_contacts").update({ active: updated.active }).eq("id", contact.id);
    } catch (err) {
      console.warn("[AdminEmergencyHelp] Toggle sync failed:", err.message);
    }
  };

  const handleReorder = async (updatedList) => {
    setContacts(updatedList);
    try {
      const changed = updatedList.filter((c) => {
        const original = contacts.find((o) => o.id === c.id);
        return original && original.priority !== c.priority;
      });
      await Promise.all(
        changed.map((c) =>
          supabase.from("emergency_contacts").update({ priority: c.priority }).eq("id", c.id)
        )
      );
    } catch (err) {
      console.warn("[AdminEmergencyHelp] Reorder sync failed:", err.message);
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    setContacts((prev) => prev.filter((c) => c.id !== target.id));
    try {
      await supabase.from("emergency_contacts").delete().eq("id", target.id);
    } catch (err) {
      console.warn("[AdminEmergencyHelp] Delete sync failed:", err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Emergency &amp; Help Contacts</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage the contacts students see on the Emergency &amp; Help Center.
          </p>
        </div>
        <Button icon={Plus} onClick={handleAddNew}>
          Add Contact
        </Button>
      </div>

      <Card className="p-4 sm:p-5">
        {loading ? (
          <LoadingState label="Loading contacts…" />
        ) : (
          <ContactManagementTable
            contacts={contacts}
            onEdit={handleEdit}
            onDelete={(contact) => setDeleteTarget(contact)}
            onToggleActive={handleToggleActive}
            onReorder={handleReorder}
          />
        )}
      </Card>

      <ContactForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSave}
        contact={editingContact}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete contact?"
        description={`This will permanently remove "${deleteTarget?.name || ""}" from the Emergency & Help Center. This can't be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
