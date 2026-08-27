import React from "react";
import { FileText, Video, Newspaper, GraduationCap, Dumbbell, Wrench, ExternalLink } from "lucide-react";

const typeMeta = {
  documentation: { icon: FileText, label: "Documentation" },
  video: { icon: Video, label: "Video" },
  article: { icon: Newspaper, label: "Article" },
  course: { icon: GraduationCap, label: "Course" },
  practice: { icon: Dumbbell, label: "Practice" },
  tool: { icon: Wrench, label: "Tool" },
};

export default function ResourceCard({ resource }) {
  const meta = typeMeta[resource.resource_type] || typeMeta.article;
  const Icon = meta.icon;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-indigo-500/15 flex items-center justify-center ring-1 ring-inset ring-indigo-500/30">
        <Icon size={16} className="text-indigo-300" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{resource.title}</p>
          <span className="text-[10px] uppercase tracking-wide text-slate-500 shrink-0">
            {meta.label}
          </span>
        </div>
        {resource.description && (
          <p className="text-xs text-slate-400 mt-1">{resource.description}</p>
        )}

        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 mt-2"
          >
            Open Resource <ExternalLink size={12} />
          </a>
        ) : (
          <span className="inline-block text-xs text-slate-500 mt-2 italic">
            Resource link coming soon
          </span>
        )}
      </div>
    </div>
  );
}
