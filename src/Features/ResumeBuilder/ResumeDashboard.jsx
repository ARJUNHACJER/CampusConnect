import React, { useEffect, useState } from "react";
import { FileText, Plus, Pencil, Copy, Download, Trash2, Loader2 } from "lucide-react";
import { listResumes, deleteResume, duplicateResume } from "./resumeService";
import { downloadResumePdf } from "./utils/pdfExport";
import ResumePreview from "./ResumePreview";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

// Hidden off-screen node used purely to render a resume for PDF export
// straight from the dashboard, without opening the editor.
function HiddenExportNode({ resume, exportRef }) {
  if (!resume) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: "-10000px", zIndex: -1 }}>
      <ResumePreview ref={exportRef} data={resume.resume_data} template={resume.template} />
    </div>
  );
}

export default function ResumeDashboard({ userId, onCreateNew, onEditResume }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportTarget, setExportTarget] = useState(null);
  const exportRef = React.useRef(null);

  const load = async () => {
    setLoading(true);
    const list = await listResumes(userId);
    setResumes(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume? This can't be undone.")) return;
    await deleteResume(id);
    load();
  };

  const handleDuplicate = async (resume) => {
    await duplicateResume(resume);
    load();
  };

  const handleDownload = async (resume) => {
    setExportTarget(resume);
    // Wait a tick for the hidden node to render with the right data.
    setTimeout(async () => {
      await downloadResumePdf(exportRef.current, `${resume.resume_name.replace(/\s+/g, "_")}.pdf`);
      setExportTarget(null);
    }, 150);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Builder</h1>
          <p className="text-sm text-slate-400 mt-1">Create a professional resume from your CampusConnect profile.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={17} /> Create New Resume
        </button>
      </div>

      <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-3">My Resumes</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading resumes...
        </div>
      ) : resumes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <FileText size={28} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-300 font-medium">No resumes yet</p>
          <p className="text-sm text-slate-500 mt-1">Create your first resume from your CampusConnect profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {resumes.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{r.resume_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{r.template} template</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-indigo-300 bg-indigo-500/15 rounded-full px-2 py-0.5">
                  {r.completion_percentage ?? 0}%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-3">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${r.completion_percentage ?? 0}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-2">Updated {timeAgo(r.updated_at)}</p>

              <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={() => onEditResume(r)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg py-2"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDuplicate(r)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg py-2"
                >
                  <Copy size={13} /> Duplicate
                </button>
                <button
                  onClick={() => handleDownload(r)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg py-2"
                >
                  <Download size={13} /> PDF
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="inline-flex items-center justify-center text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg p-2"
                  aria-label="Delete resume"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HiddenExportNode resume={exportTarget} exportRef={exportRef} />
    </div>
  );
}
