import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon, MapPinIcon, Trash2Icon } from 'lucide-react';
import { PlanThumbnail } from '../PlanThumbnail';
import { summarizeKinds } from '../../utils/plan';
import type { Project } from '../../types/plan';

interface FeaturedPlanProps {
  project: Project;
  onDelete: () => void;
}

export function FeaturedPlan({ project, onDelete }: FeaturedPlanProps) {
  return (
    <article className="grid overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Link to={`/plan/${project.id}`} aria-label={`Open ${project.name}`} className="block">
        <PlanThumbnail project={project} className="aspect-[16/10] h-full w-full lg:aspect-auto lg:min-h-[340px]" />
      </Link>
      <div className="flex flex-col p-5 sm:p-7">
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{project.location}</span>
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-[28px] sm:leading-tight">{project.name}</h2>
        {project.description && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">{project.description}</p>}
        <p className="mt-4 text-sm font-medium text-ink">{summarizeKinds(project.features)}</p>
        <div className="mt-auto flex items-center gap-2 pt-6">
          <Link
            to={`/plan/${project.id}`}
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-ink px-4 text-sm font-medium text-on-ink transition-colors duration-150 hover:bg-ink/90">
            
            Open plan
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${project.name}`}
            className="grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger">
            
            <Trash2Icon className="h-4 w-4" aria-hidden />
          </button>
          <span className="ml-auto text-xs text-muted">Edited {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
        </div>
      </div>
    </article>);

}