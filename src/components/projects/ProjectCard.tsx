import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MapPinIcon, Trash2Icon } from 'lucide-react';
import { PlanThumbnail } from '../PlanThumbnail';
import { canDeleteProject, summarizeKinds } from '../../utils/plan';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Project } from '../../types/plan';

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const showDelete = canDeleteProject(project, user);

  return (
    <article className="group relative isolate z-0 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:border-ink/30 hover:shadow-float">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-zinc-900">
        <Link
          to={`/plan/${project.id}`}
          aria-label={`${t('openPlan')} ${project.name}`}
          className="block h-full w-full focus-visible:outline-hidden"
        >
          <PlanThumbnail
            project={project}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="truncate text-base font-bold text-ink sm:text-lg">
          <Link to={`/plan/${project.id}`} className="hover:underline focus-visible:outline-hidden">
            {project.name}
          </Link>
        </h3>

        <div className="mt-1 flex h-5 items-center gap-1.5 text-xs text-muted overflow-hidden">
          {project.location ? (
            <>
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{project.location}</span>
            </>
          ) : (
            <span className="invisible">&nbsp;</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
          <span className="truncate">{summarizeKinds(project.features)}</span>
          <span className="shrink-0">{formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-line">
          <Link
            to={`/plan/${project.id}`}
            className="w-full inline-flex h-9 items-center justify-center rounded-xl bg-ink px-4 text-xs font-semibold text-on-ink shadow-2xs hover:bg-ink/90 active:scale-95 transition-all"
          >
            <span>{t('openPlan')}</span>
          </Link>
        </div>
      </div>

      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar ${project.name}`}
          className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-lg bg-surface/90 backdrop-blur-md text-muted shadow-sm transition-all hover:bg-danger hover:text-white active:scale-95"
        >
          <Trash2Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </article>
  );
}