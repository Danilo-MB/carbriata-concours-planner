import React from 'react';
import { ExternalLinkIcon, GlobeIcon, Maximize2Icon } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageToggle } from '../LanguageToggle';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Project } from '../../types/plan';

interface EmbedHeaderProps {
  project: Project;
}

export function EmbedHeader({ project }: EmbedHeaderProps) {
  const { t } = useLanguage();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const viewUrl = `${origin}/view/${project.id}`;

  return (
    <header className="relative z-30 flex h-11 shrink-0 items-center justify-between border-b border-line bg-surface/95 px-3 backdrop-blur-md">
      {/* Event Title & Location */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent animate-pulse" aria-hidden="true" />
        <div className="min-w-0">
          <h1 className="truncate text-xs font-semibold text-ink sm:text-sm">
            {project.name}
          </h1>
          {project.location && (
            <p className="hidden truncate text-[11px] text-muted sm:block">
              {project.location}
            </p>
          )}
        </div>
      </div>

      {/* External Website & Fullscreen Map Action */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {project.websiteUrl && (
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t('visitOfficialWebsite')}
            className="flex h-7 items-center gap-1 rounded-md border border-line bg-surface px-2 text-[11px] font-medium text-ink transition-colors hover:bg-subtle sm:h-8 sm:px-2.5 sm:text-xs">
            <GlobeIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span className="hidden sm:inline">{t('officialSite')}</span>
            <ExternalLinkIcon className="h-3 w-3 text-muted" aria-hidden="true" />
          </a>
        )}

        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={t('openFullMap')}
          className="flex h-7 items-center gap-1 rounded-md bg-ink px-2 text-[11px] font-semibold text-on-ink shadow-2xs transition-colors hover:bg-ink/90 sm:h-8 sm:px-2.5 sm:text-xs">
          <Maximize2Icon className="h-3 w-3" aria-hidden="true" />
          <span>{t('openFullMap')}</span>
          <ExternalLinkIcon className="h-3 w-3 text-on-ink/70" aria-hidden="true" />
        </a>

        <LanguageToggle className="h-7 px-1.5 text-[11px] sm:h-8 sm:px-2" />
        <ThemeToggle className="h-7 w-7 sm:h-8 sm:w-8" />
      </div>
    </header>
  );
}
