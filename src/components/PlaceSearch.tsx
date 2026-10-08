import React, { useId, useState } from 'react';
import { Loader2Icon, MapPinIcon, SearchIcon } from 'lucide-react';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import type { PlaceResult } from '../types/plan';

interface PlaceSearchProps {
  onPick: (place: PlaceResult) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  inline?: boolean;
}

export function PlaceSearch({
  onPick,
  placeholder = 'Search a place or address',
  label = 'Search a place',
  autoFocus,
  inline
}: PlaceSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { status, results } = usePlaceSearch(query);
  const listId = useId();
  const showResults = open && query.trim().length >= 3;

  const pick = (place: PlaceResult) => {
    onPick(place);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(results[active]);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          role="combobox"
          aria-label={label}
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-lg border border-line bg-subtle pl-9 pr-9 text-sm text-ink placeholder:text-muted focus:border-ink focus:bg-surface focus:outline-none" />
        
        {status === 'loading' &&
        <Loader2Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" aria-label="Searching" />
        }
      </div>
      {showResults &&
      <div
        className={
        inline ?
        'mt-2 overflow-hidden rounded-lg border border-line bg-surface' :
        'absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-float'
        }>
        
          {status === 'error' && <p className="px-3 py-3 text-sm text-danger">Search is unavailable right now. Try again.</p>}
          {status === 'success' && results.length === 0 &&
        <p className="px-3 py-3 text-sm text-muted">No places found for “{query.trim()}”.</p>
        }
          {status === 'loading' && results.length === 0 && <p className="px-3 py-3 text-sm text-muted">Searching…</p>}
          {results.length > 0 &&
        <ul id={listId} role="listbox" aria-label="Places">
              {results.map((r, i) =>
          <li key={r.id} role="option" aria-selected={i === active}>
                  <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(r)}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left ${i === active ? 'bg-subtle' : ''}`}>
              
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{r.label}</span>
                      <span className="block truncate text-xs text-muted">{r.secondary}</span>
                    </span>
                  </button>
                </li>
          )}
            </ul>
        }
        </div>
      }
    </div>);

}