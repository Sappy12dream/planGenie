'use client';

import { Resource } from '@/types/plan';
import { ExternalLink, FileText, Video, Link2 } from 'lucide-react';

interface ResourceItemProps {
  resource: Resource;
}

export function ResourceItem({ resource }: ResourceItemProps) {
  const typeIcons = {
    link: <Link2 className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    other: <Link2 className="h-4 w-4" />,
  };

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg border bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800"
    >
      <div className="shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
        {typeIcons[resource.type]}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
          {resource.title}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {resource.url}
        </p>
      </div>

      <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
    </a>
  );
}
