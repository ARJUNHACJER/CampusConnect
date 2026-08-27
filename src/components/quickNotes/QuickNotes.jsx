import React, { useEffect, useMemo, useRef, useState } from "react";
//import { supabase } from "../supabaseClient";
import { supabase } from "../../supabaseClient";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  X,
  Check,
  StickyNote,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* -----------------------------------------------------------
   Quick Notes only
   Removed:
   - Dashboard
   - Reminders
   - Notifications
   - Events / Registrations
   - Announcements / Results
   - Profile / Logout
----------------------------------------------------------- */

const CATEGORY_STYLES = {
  General: {
    dot: "bg-slate-400",
    text: "text-slate-300",
    bg: "bg-slate-500/10",
    ring: "ring-slate-500/30",
  },
  Study: {
    dot: "bg-blue-400",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/30",
  },
  Assignment: {
    dot: "bg-orange-400",
    text: "text-orange-300",
    bg: "bg-orange-500/10",
    ring: "ring-orange-500/30",
  },
  Personal: {
    dot: "bg-purple-400",
    text: "text-purple-300",
    bg: "bg-purple-500/10",
    ring: "ring-purple-500/30",
  },
  Event: {
    dot: "bg-pink-400",
    text: "text-pink-300",
    bg: "bg-pink-500/10",
    ring: "ring-pink-500/30",
  },
};

const NOTE_CATEGORIES = [
  "General",
  "Study",
  "Assignment",
  "Personal",
  "Event",
];

/* -----------------------------------------------------------
   Demo data
----------------------------------------------------------- */

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */

function fmtCreated(d) {
  return (
    d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}

/* -----------------------------------------------------------
   Small UI components
----------------------------------------------------------- */

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}) {
  const tones = {
    default:
      "text-slate-400 hover:text-white hover:bg-slate-800",
    danger:
      "text-slate-400 hover:text-rose-300 hover:bg-rose-500/10",
    warn:
      "text-slate-400 hover:text-orange-300 hover:bg-orange-500/10",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${tones[tone]}`}
    >
      <Icon size={15} />
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  icon: Icon,
  className = "",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

/* -----------------------------------------------------------
   Toasts
----------------------------------------------------------- */

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-100 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
            t.type === "error"
              ? "border-rose-500/30 bg-rose-950/80 text-rose-100"
              : t.type === "info"
              ? "border-indigo-500/30 bg-indigo-950/80 text-indigo-100"
              : "border-emerald-500/30 bg-emerald-950/80 text-emerald-100"
          }`}
        >
          {t.type === "error" ? (
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0"
            />
          )}

          <p className="flex-1 text-sm font-medium leading-snug">
            {t.message}
          </p>

          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 text-current opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* -----------------------------------------------------------
   Confirm delete dialog
----------------------------------------------------------- */

function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  busy,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-500/30">
          <AlertTriangle size={18} className="text-rose-400" />
        </div>

        <h3 className="mt-3 text-base font-semibold text-white">
          Delete this note?
        </h3>

        <p className="mt-1.5 text-sm text-slate-400">
          This can't be undone. The note will be permanently removed.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onCancel}>
            Cancel
          </GhostButton>

          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-60"
          >
            {busy && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Note card
----------------------------------------------------------- */

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}) {
  const cat =
    CATEGORY_STYLES[note.category] ||
    CATEGORY_STYLES.General;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900 ${
        note.isPinned
          ? "border-orange-500/30"
          : "border-slate-800"
      }`}
    >
      {note.isPinned && (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 shadow-lg">
          <Pin
            size={11}
            className="text-white"
            fill="white"
          />
        </div>
      )}

      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 text-sm font-bold text-white">
          {note.title}
        </h3>
      </div>

      <Badge
        className={`mb-2.5 w-fit ${cat.bg} ${cat.text} ${cat.ring}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${cat.dot}`}
        />
        {note.category}
      </Badge>

      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">
        {note.content}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-[11px] text-slate-500">
          {fmtCreated(note.createdAt)}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <IconButton
            icon={note.isPinned ? PinOff : Pin}
            label={
              note.isPinned
                ? "Unpin note"
                : "Pin note"
            }
            tone="warn"
            onClick={() => onTogglePin(note)}
          />

          <IconButton
            icon={Pencil}
            label="Edit note"
            onClick={() => onEdit(note)}
          />

          <IconButton
            icon={Trash2}
            label="Delete note"
            tone="danger"
            onClick={() => onDelete(note)}
          />
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Notes page
----------------------------------------------------------- */

function NotesPage({
  notes,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onTogglePin,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return notes
      .filter((note) =>
        category === "All"
          ? true
          : note.category === category
      )
      .filter((note) => {
        if (!query.trim()) return true;

        const q = query.toLowerCase();

        return (
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          b.isPinned - a.isPinned ||
          b.updatedAt - a.updatedAt
      );
  }, [notes, query, category]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <StickyNote
              size={22}
              className="text-purple-400"
            />

            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Quick Notes
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Quickly save anything you want to remember.
          </p>
        </div>

        <PrimaryButton
          icon={Plus}
          onClick={onCreate}
          className="w-fit shrink-0"
        >
          Create Note
        </PrimaryButton>
      </div>

      {/* Search + categories */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            aria-label="Search notes"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["All", ...NOTE_CATEGORIES].map(
            (item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  category === item
                    ? "bg-linear-to-r from-purple-600 to-indigo-600 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      {/* Notes */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="mb-3 h-4 w-2/3 rounded bg-slate-800" />
                <div className="mb-2 h-3 w-full rounded bg-slate-800/80" />
                <div className="mb-2 h-3 w-5/6 rounded bg-slate-800/80" />
                <div className="mt-4 h-3 w-1/3 rounded bg-slate-800/60" />
              </div>
            )
          )}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={query || category !== "All" ? Search : StickyNote}
          title={
            query || category !== "All"
              ? "No matching notes"
              : "No notes yet"
          }
          description={
            query || category !== "All"
              ? "Try a different search term or category."
              : "Capture assignments, ideas, event details, or anything worth remembering."
          }
          actionLabel={
            !query && category === "All"
              ? "Create your first note"
              : undefined
          }
          onAction={onCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------------------------
   Empty state
----------------------------------------------------------- */

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-purple-600/20 to-indigo-600/20 ring-1 ring-purple-500/20">
        <Icon
          size={24}
          className="text-purple-300"
        />
      </div>

      <h3 className="text-base font-bold text-white">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-slate-400">
        {description}
      </p>

      {actionLabel && (
        <PrimaryButton
          icon={Plus}
          onClick={onAction}
          className="mt-5"
        >
          {actionLabel}
        </PrimaryButton>
      )}
    </Card>
  );
}

/* -----------------------------------------------------------
   Note modal
----------------------------------------------------------- */

function NoteModal({
  open,
  initial,
  onClose,
  onSave,
  saving,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState("General");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title || "");
    setContent(initial?.content || "");
    setCategory(initial?.category || "General");
    setErrors({});
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();

    const nextErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Give your note a title.";
    }

    if (!content.trim()) {
      nextErrors.content =
        "Add some content to save.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
    });
  }

  return (
    <div
      className="fixed inset-0 z-90 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {initial ? "Edit Note" : "Create Note"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. DBMS Assignment"
              className={`w-full rounded-xl border bg-slate-800/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors ${
                errors.title
                  ? "border-rose-500"
                  : "border-slate-700 focus:border-purple-500"
              }`}
            />

            {errors.title && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              Content
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Write your note here..."
              rows={5}
              className={`w-full resize-none rounded-xl border bg-slate-800/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors ${
                errors.content
                  ? "border-rose-500"
                  : "border-slate-700 focus:border-purple-500"
              }`}
            />

            {errors.content && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.content}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              Category
            </label>

            <div className="flex flex-wrap gap-1.5">
              {NOTE_CATEGORIES.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    category === item
                      ? "bg-linear-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <GhostButton onClick={onClose}>
            Cancel
          </GhostButton>

          <PrimaryButton
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Check size={15} />
            )}

            {initial
              ? "Save Changes"
              : "Save Note"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

/* -----------------------------------------------------------
   Main Quick Notes component
----------------------------------------------------------- */

export default function QuickNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [noteModal, setNoteModal] = useState({
    open: false,
    note: null,
  });

  const [confirmDelete, setConfirmDelete] =
    useState(false);

  const [noteToDelete, setNoteToDelete] =
    useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] =
    useState(false);

  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  /* Load this user's notes from Supabase. */
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        if (active) setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("quick_notes").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
      if (!active) return;
      if (error) {
        pushToast(error.message, "error");
      } else {
        setNotes((data || []).map((note) => ({ ...note, isPinned: note.is_pinned, createdAt: new Date(note.created_at), updatedAt: new Date(note.updated_at) })));
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  /* Toast */
  function pushToast(
    message,
    type = "success"
  ) {
    const id = ++toastId.current;

    setToasts((prev) => [
      ...prev,
      { id, message, type },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }, 4200);
  }

  function dismissToast(id) {
    setToasts((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  /* Modal */
  function openNoteModal(note = null) {
    setNoteModal({
      open: true,
      note,
    });
  }

  function closeNoteModal() {
    setNoteModal({
      open: false,
      note: null,
    });
  }

  /* Create / Edit */
  async function saveNote(data) {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    const now = new Date().toISOString();
    const result = noteModal.note
      ? await supabase.from("quick_notes").update({ title: data.title, content: data.content, category: data.category, updated_at: now }).eq("id", noteModal.note.id).eq("user_id", userId).select().single()
      : await supabase.from("quick_notes").insert({ user_id: userId, title: data.title, content: data.content, category: data.category, is_pinned: false }).select().single();
    if (result.error) {
      pushToast(result.error.message, "error");
    } else {
      const note = result.data;
      const mapped = { ...note, isPinned: note.is_pinned, createdAt: new Date(note.created_at), updatedAt: new Date(note.updated_at) };
      setNotes((prev) => noteModal.note ? prev.map((item) => item.id === note.id ? mapped : item) : [mapped, ...prev]);
      pushToast(noteModal.note ? "Note updated successfully" : "Note saved successfully");
      closeNoteModal();
    }
    setSaving(false);
  }

  /* Pin / Unpin */
  async function togglePin(note) {
    const nextPinned = !note.isPinned;
    const { data, error } = await supabase.from("quick_notes").update({ is_pinned: nextPinned, updated_at: new Date().toISOString() }).eq("id", note.id).select().single();
    if (error) {
      pushToast(error.message, "error");
      return;
    }
    const mapped = { ...data, isPinned: data.is_pinned, createdAt: new Date(data.created_at), updatedAt: new Date(data.updated_at) };
    setNotes((prev) => prev.map((item) => item.id === note.id ? mapped : item));

    pushToast(
      note.isPinned
        ? "Note unpinned"
        : "📌 Note pinned to top",
      "info"
    );
  }

  /* Delete */
  function requestDelete(note) {
    setNoteToDelete(note);
    setConfirmDelete(true);
  }

  function cancelDelete() {
    setConfirmDelete(false);
    setNoteToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!noteToDelete) return;

    setDeleting(true);
    const { error } = await supabase.from("quick_notes").delete().eq("id", noteToDelete.id);
    if (error) {
      pushToast(error.message, "error");
    } else {
      setNotes((prev) => prev.filter((note) => note.id !== noteToDelete.id));
      pushToast("Note deleted", "info");
    }
    setDeleting(false);
    setConfirmDelete(false);
    setNoteToDelete(null);
  }

  return (
    <div
      className="min-h-screen w-full overflow-y-auto bg-linear-to-br from-slate-950 via-slate-950 to-indigo-950 text-slate-100"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <NotesPage
            notes={notes}
            loading={loading}
            onCreate={() =>
              openNoteModal(null)
            }
            onEdit={openNoteModal}
            onDelete={requestDelete}
            onTogglePin={togglePin}
          />
        </div>
      </main>

      <NoteModal
        open={noteModal.open}
        initial={noteModal.note}
        onClose={closeNoteModal}
        onSave={saveNote}
        saving={saving}
      />

      <ConfirmDialog
        open={confirmDelete}
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
        busy={deleting}
      />

      <ToastStack
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}