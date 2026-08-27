import React, { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical } from "lucide-react";

/**
 * Wraps a single resume section with a header offering:
 * - expand/collapse
 * - show/hide in the preview
 * - move up / move down (simple, reliable reordering — swap for a
 *   drag-and-drop library like @dnd-kit later if desired)
 */
export default function SectionReorder({
  title,
  visible,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1220] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03]">
        <GripVertical size={16} className="text-slate-600 shrink-0" />

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-2 text-left text-sm font-semibold text-white"
        >
          {title}
          {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </button>

        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label={`Move ${title} up`}
        >
          <ChevronUp size={15} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label={`Move ${title} down`}
        >
          <ChevronDown size={15} />
        </button>
        <button
          onClick={onToggleVisible}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
          aria-label={visible ? `Hide ${title}` : `Show ${title}`}
          title={visible ? "Hide in resume" : "Show in resume"}
        >
          {visible ? <Eye size={15} /> : <EyeOff size={15} className="text-amber-400" />}
        </button>
      </div>

      {open && <div className="p-4">{children}</div>}
    </div>
  );
}
