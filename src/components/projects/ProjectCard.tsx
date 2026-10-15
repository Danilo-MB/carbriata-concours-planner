import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { CloudIcon, CloudOffIcon, Trash2Icon } from 'lucide-react';
import { PlanThumbnail } from '../PlanThumbnail';
import { canDeleteProject, summarizeKinds } from '../../utils/plan';
import { useAuth } from '../../contexts/AuthContext';
import type { Project } from '../../types/plan';

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { user } = useAuth();
  const showDelete = canDeleteProject(project, user);

  return (
    <article className="group relative isolate z-0 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-ink/25 hover:shadow-float">
      <PlanThumbnail project={project} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-base font-semibold text-ink">
            <Link to={`/plan/${project.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {project.name}
            </Link>
          </h3>
          {project.isLocalOnly ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0" title="Guardado de forma local en tu navegador">
              <CloudOffIcon className="h-3 w-3" />
              <span>Local</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0" title="Sincronizado en la nube">
              <CloudIcon className="h-3 w-3" />
              <span>Nube</span>
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-muted">{project.location}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted">
          <span className="truncate">{summarizeKinds(project.features)}</span>
          <span className="shrink-0">{formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
        </div>
      </div>
      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${project.name}`}
          className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-lg bg-surface text-muted shadow-sm transition-colors duration-150 hover:text-danger">
          <Trash2Icon className="h-4 w-4" aria-hidden />
        </button>
      )}
    </article>
  );
}