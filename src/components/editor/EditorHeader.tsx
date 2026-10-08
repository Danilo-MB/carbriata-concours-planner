import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, EyeIcon, PencilIcon, SearchIcon, XIcon } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { PlaceSearch } from '../PlaceSearch';
import type { PlaceResult, Project, ViewMode } from '../../types/plan';

interface EditorHeaderProps {
  project: Project;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onPickPlace: (place: PlaceResult) => void;
}

export function EditorHeader({ project, mode, onModeChange, onPickPlace }: EditorHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-2 sm:px-4">
      <Link
        to="/"
        aria-label="Volver a los planos"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink transition-colors duration-150 hover:bg-subtle">
        <ArrowLeftIcon className="h-5 w-5" aria-hidden />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-ink">{project.name || 'Plano sin título'}</h1>
        <p className="truncate text-xs text-muted">{project.location}</p>
      </div>

      {/* Mode Switcher: Editor vs. Visitor */}
      <div className="flex shrink-0 items-center rounded-xl border border-line bg-subtle/80 p-0.5 shadow-2xs">
        <button
          type="button"
          onClick={() => onModeChange('editor')}
          aria-pressed={mode === 'editor'}
          title="Modo Editor (herramientas de trazado y edición)"
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
            mode === 'editor'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}>
          <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Editor</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('visitor')}
          aria-pressed={mode === 'visitor'}
          title="Modo Visitante (vista interactiva limpia para el público)"
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
            mode === 'visitor'
              ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-500'
              : 'text-muted hover:text-ink'
          }`}>
          <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Visitante</span>
        </button>
      </div>

      <ThemeToggle className="h-10 w-10 shrink-0" />
      <div className="hidden w-80 md:block">
        <PlaceSearch onPick={onPickPlace} />
      </div>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Search a place"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink transition-colors duration-150 hover:bg-subtle md:hidden">
        
        <SearchIcon className="h-5 w-5" aria-hidden />
      </button>
      {searchOpen &&
      <div className="absolute inset-0 flex items-center gap-2 bg-surface px-2 md:hidden">
          <PlaceSearch
          autoFocus
          onPick={(place) => {
            onPickPlace(place);
            setSearchOpen(false);
          }} />
        
          <button
          type="button"
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink hover:bg-subtle">
          
            <XIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>
      }
    </header>);

}