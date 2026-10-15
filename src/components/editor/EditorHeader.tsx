import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CloudIcon, CloudOffIcon, ExternalLinkIcon, EyeIcon, GlobeIcon, PencilIcon, SearchIcon, Share2Icon, XIcon } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { PlaceSearch } from '../PlaceSearch';
import { UserMenu } from '../auth/UserMenu';
import { LanguageToggle } from '../LanguageToggle';
import { ShareModal } from './ShareModal';
import { MapFlexBadge } from '../common/MapFlexLogo';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../contexts/ProjectsContext';
import type { PlaceResult, Project, ViewMode } from '../../types/plan';

interface EditorHeaderProps {
  project: Project;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onPickPlace: (place: PlaceResult) => void;
}

export function EditorHeader({ project, mode, onModeChange, onPickPlace }: EditorHeaderProps) {
  const { t } = useLanguage();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { saveLocalToCloud } = useProjects();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-1.5 border-b border-line bg-surface px-2 sm:gap-2 sm:px-4">
        <Link
          to="/"
          aria-label={t('backToPlans')}
          title={t('backToPlans')}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-ink transition-colors duration-150 hover:bg-subtle">
          <ArrowLeftIcon className="h-4 w-4 text-muted" aria-hidden="true" />
          <MapFlexBadge size={28} />
          <span className="hidden md:inline-flex font-black text-xs tracking-tight text-ink">
            Map<span className="bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">Flex</span>
          </span>
        </Link>

        {/* Project Title & Location */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xs font-semibold text-ink sm:text-sm">
              {project.name || t('untitled')}
            </h1>
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={openAuthModal}
                className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                title="Modo Local: Tus cambios se guardan solo en este navegador. Haz clic para iniciar sesión y sincronizar en la nube.">
                <CloudOffIcon className="h-2.5 w-2.5" />
                <span>Modo Local</span>
              </button>
            ) : project.isLocalOnly ? (
              <button
                type="button"
                onClick={() => saveLocalToCloud(project.id)}
                className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                title="Este plano solo está en tu navegador. Haz clic para guardarlo en la nube.">
                <CloudIcon className="h-2.5 w-2.5" />
                <span>Guardar en nube</span>
              </button>
            ) : null}
          </div>
          <p className="truncate text-[11px] text-muted sm:text-xs">
            {project.location}
          </p>
        </div>

        {/* External Website button if present */}
        {project.websiteUrl && (
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t('visitOfficialWebsite')}
            className="hidden items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle lg:flex">
            <GlobeIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{t('officialSite')}</span>
            <ExternalLinkIcon className="h-3 w-3 text-muted" aria-hidden="true" />
          </a>
        )}

        {/* Share & Embed button */}
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          title={t('shareAndEmbed')}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle active:scale-95 sm:h-9 sm:px-2.5">
          <Share2Icon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          <span className="hidden sm:inline">{t('share')}</span>
        </button>

        {/* Mode Switcher: Editor vs. Visitor */}
        <div className="flex shrink-0 items-center rounded-xl border border-line bg-subtle/80 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onModeChange('editor')}
            aria-pressed={mode === 'editor'}
            title={t('editorModeTitle')}
            className={`flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-all sm:h-8 sm:px-2.5 ${
              mode === 'editor'
                ? 'bg-surface text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}>
            <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('editorMode')}</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('visitor')}
            aria-pressed={mode === 'visitor'}
            title={t('visitorModeTitle')}
            className={`flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-all sm:h-8 sm:px-2.5 ${
              mode === 'visitor'
                ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-500'
                : 'text-muted hover:text-ink'
            }`}>
            <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('visitorMode')}</span>
          </button>
        </div>

        <LanguageToggle className="h-8 px-2 sm:h-9 sm:px-2.5" />
        <ThemeToggle className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
        <UserMenu />

        {/* Place Search on desktop */}
        <div className="hidden w-64 md:block lg:w-72">
          <PlaceSearch onPick={onPickPlace} />
        </div>

        {/* Search button on mobile */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label={t('searchPlace')}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink transition-colors duration-150 hover:bg-subtle sm:h-10 sm:w-10 md:hidden">
          <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
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