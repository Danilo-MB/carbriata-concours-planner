import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2Icon } from 'lucide-react';
import { PlanThumbnail } from '../PlanThumbnail';
import { summarizeKinds } from '../../utils/plan';
import type { Project } from '../../types/plan';

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-ink/25 hover:shadow-float">
      <PlanThumbnail project={project} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-base font-semibold text-ink">
          <Link to={`/plan/${project.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {project.name}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted">{project.location}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted">
          <span className="truncate">{summarizeKinds(project.features)}</span>
          <span className="shrink-0">{formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${project.name}`}
        className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-lg bg-surface text-muted shadow-sm transition-colors duration-150 hover:text-danger">
        
        <Trash2Icon className="h-4 w-4" aria-hidden />
      </button>
    </article>);

}