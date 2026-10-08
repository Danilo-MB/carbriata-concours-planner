import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, SearchIcon, XIcon } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { PlaceSearch } from '../PlaceSearch';
import type { PlaceResult, Project } from '../../types/plan';

interface EditorHeaderProps {
  project: Project;
  onPickPlace: (place: PlaceResult) => void;
}

export function EditorHeader({ project, onPickPlace }: EditorHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-2 sm:px-4">
      <Link
        to="/"
        aria-label="Back to plans"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink transition-colors duration-150 hover:bg-subtle">
        
        <ArrowLeftIcon className="h-5 w-5" aria-hidden />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-ink">{project.name || 'Untitled plan'}</h1>
        <p className="truncate text-xs text-muted">{project.location}</p>
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