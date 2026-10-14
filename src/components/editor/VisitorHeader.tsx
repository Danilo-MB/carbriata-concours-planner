import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ExternalLinkIcon, FootprintsIcon, GlobeIcon, SearchIcon, Share2Icon, XIcon } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { PlaceSearch } from '../PlaceSearch';
import { LanguageToggle } from '../LanguageToggle';
import { ShareModal } from './ShareModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { hasStreetViewPhotos } from '../../data/streetViewSamples';
import type { PlaceResult, PlanFeature, Project } from '../../types/plan';

interface VisitorHeaderProps {
  project: Project;
  onPickPlace: (place: PlaceResult) => void;
  onOpenStreetView?: (feature: PlanFeature, initialIndex?: number) => void;
}

export function VisitorHeader({ project, onPickPlace, onOpenStreetView }: VisitorHeaderProps) {
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-2 sm:px-4">
        <Link
          to="/"
          aria-label={t('backToPlans')}
          title={t('backToPlans')}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink transition-colors duration-150 hover:bg-subtle">
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>

        {/* Project Name & Location */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold text-ink sm:text-base">
              {project.name || t('untitled')}
            </h1>
            <span className="hidden rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 sm:inline-block">
              {t('visitorMode')}
            </span>
          </div>
          {project.location && (
            <p className="truncate text-xs text-muted">{project.location}</p>
          )}
        </div>

        {/* Official Website Link */}
        {project.websiteUrl && (
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t('visitOfficialWebsite')}
            className="hidden items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle sm:flex">
            <GlobeIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{t('officialSite')}</span>
            <ExternalLinkIcon className="h-3 w-3 text-muted" aria-hidden="true" />
          </a>
        )}

        {/* Street View Virtual Tour Button */}
        {(() => {
          const streetViewRoute = project.features.find((f) => f.kind === 'line' && hasStreetViewPhotos(f));
          if (!streetViewRoute || !onOpenStreetView) return null;
          return (
            <button
              type="button"
              onClick={() => onOpenStreetView(streetViewRoute, 0)}
              title="Recorrer evento en Street View virtual"
              className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-xs font-bold text-black shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <FootprintsIcon className="h-4 w-4" />
              <span>Street View</span>
            </button>
          );
        })()}

        {/* Share & Embed Button */}
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          title={t('shareAndEmbed')}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle active:scale-95">
          <Share2Icon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          <span className="hidden sm:inline">{t('share')}</span>
        </button>

        <LanguageToggle />
        <ThemeToggle className="h-9 w-9 shrink-0" />

        {/* Search Place (Desktop) */}
        <div className="hidden w-64 md:block lg:w-72">
          <PlaceSearch onPick={onPickPlace} />
        </div>

        {/* Search Place (Mobile button) */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label={t('searchPlace')}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink transition-colors duration-150 hover:bg-subtle md:hidden">
          <SearchIcon className="h-4 w-4" aria-hidden="true" />
        </button>

        {searchOpen && (
          <div className="absolute inset-0 z-40 flex items-center gap-2 bg-surface px-2 md:hidden">
            <PlaceSearch
              autoFocus
              onPick={(place) => {
                onPickPlace(place);
                setSearchOpen(false);
              }}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label={t('cancel')}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink hover:bg-subtle">
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </header>

      <ShareModal
        project={project}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
