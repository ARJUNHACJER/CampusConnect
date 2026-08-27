import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Send, EyeOff } from "lucide-react";
import { AnnouncementForm } from "../components/DataComponents";
import { StatusBadge, ConfirmationModal, EmptyState, PrimaryButton } from "../components/AdminUI";
import { supabase } from "../../supabaseClient";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [view, setView] = useState("list"); // list | create
  const [pendingAction, setPendingAction] = useState(null); // { type: 'delete'|'unpublish', item }
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    let active = true;
    const load = () => supabase.from("announcements").select("*").order("publish_date", { ascending: false }).then(({ data }) => {
      if (active) setAnnouncements((data || []).map((item) => ({ ...item, status: item.status[0].toUpperCase() + item.status.slice(1), publishDate: item.publish_date })));
    });
    load();
    const timer = setInterval(load, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const handleCreate = async (form, status) => {
    const { data, error } = await supabase.from("announcements").insert({
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      publish_date: form.publishDate || new Date().toISOString().slice(0, 10),
      attachment: form.attachment,
      status: status.toLowerCase(),
    }).select().single();
    if (error) {
      window.alert(error.message);
      return;
    }
    setAnnouncements((prev) => [{ ...data, status, publishDate: data.publish_date }, ...prev]);
    setView("list");
  };

  const confirmAction = async () => {
    const { type, item } = pendingAction;
    setProcessingId(item.id);
    if (type === "delete") {
      const { error } = await supabase.from("announcements").delete().eq("id", item.id);
      if (!error) setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
      else window.alert(error.message);
    } else if (type === "unpublish") {
      const { error } = await supabase.from("announcements").update({ status: "draft" }).eq("id", item.id);
      if (!error) setAnnouncements((prev) => prev.map((a) => (a.id === item.id ? { ...a, status: "Draft" } : a)));
      else window.alert(error.message);
    }
    setProcessingId(null);
    setPendingAction(null);
  };

  const publish = async (item) => {
    setProcessingId(item.id);
    const { error } = await supabase.from("announcements").update({ status: "published" }).eq("id", item.id);
    if (!error) setAnnouncements((prev) => prev.map((a) => (a.id === item.id ? { ...a, status: "Published" } : a)));
    else window.alert(error.message);
    setProcessingId(null);
  };

  if (view === "create") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Create Announcement</h2>
          <p className="text-sm text-slate-400 mt-1">Drafts stay hidden from students until published.</p>
        </div>
        <AnnouncementForm
          onCancel={() => setView("list")}
          onSaveDraft={(form) => handleCreate(form, "Draft")}
          onPublish={(form) => handleCreate(form, "Published")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{announcements.length} announcements</p>
        <PrimaryButton onClick={() => setView("create")}>
          <span className="inline-flex items-center gap-1.5"><Plus size={15} /> Create Announcement</span>
        </PrimaryButton>
      </div>

      {announcements.length === 0 ? (
        <EmptyState title="No announcements yet" description="Create your first announcement to reach students." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{a.title}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                  <span>{a.category}</span>
                  <StatusBadge status={a.priority} />
                  <span>{a.publishDate}</span>
                </div>
              </div>

              <StatusBadge status={a.status} />

              <div className="flex flex-wrap gap-2">
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10" title="Edit">
                  <Pencil size={15} />
                </button>
                {a.status === "Draft" ? (
                  <button
                    onClick={() => publish(a)}
                    disabled={processingId === a.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                  >
                    <Send size={13} /> Publish
                  </button>
                ) : (
                  <button
                    onClick={() => setPendingAction({ type: "unpublish", item: a })}
                    disabled={processingId === a.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
                  >
                    <EyeOff size={13} /> Unpublish
                  </button>
                )}
                <button
                  onClick={() => setPendingAction({ type: "delete", item: a })}
                  disabled={processingId === a.id}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        open={!!pendingAction}
        title={pendingAction?.type === "delete" ? "Delete this announcement?" : "Unpublish this announcement?"}
        description={
          pendingAction?.type === "delete"
            ? `"${pendingAction.item.title}" will be permanently removed.`
            : `"${pendingAction?.item.title}" will be hidden from students until republished.`
        }
        confirmLabel={pendingAction?.type === "delete" ? "Delete" : "Unpublish"}
        destructive={pendingAction?.type === "delete"}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}
