import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, ImageIcon, MapPinIcon, PentagonIcon, SplineIcon, Trash2Icon } from 'lucide-react';
import { featureKinds } from '../../data/featureKinds';
import { measureFeature } from '../../utils/geo';
import { LayerSwatch } from './LayerSwatch';
import type { Project } from '../../types/plan';

interface ElementListProps {
  project: Project;
  readOnly?: boolean;
  onSelect: (id: string) => void;
  onToggleLayer: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ElementList({ project, readOnly = false, onSelect, onToggleLayer, onDelete }: ElementListProps) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  if (project.features.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="mx-auto flex w-fit gap-2 text-muted" aria-hidden>
          <PentagonIcon className="h-5 w-5" />
          <SplineIcon className="h-5 w-5" />
          <MapPinIcon className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-ink">Nothing on the map yet</h3>
        <p className="mx-auto mt-1 max-w-[260px] text-sm text-muted">
          Pick Area, Path or Marker in the toolbar and tap the map to start laying out your plan.
        </p>
      </div>);

  }

  const groups = project.categories.
  map((category) => ({
    category,
    items: project.features.filter((f) => f.categoryId === category.id && (!q || f.name.toLowerCase().includes(q)))
  })).
  filter((g) => g.items.length > 0);

  return (
    <div className="px-4 pb-8 pt-3">
      <label htmlFor="element-filter" className="sr-only">
        Filter elements
      </label>
      <input
        id="element-filter"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Filter ${project.features.length} elements`}
        className="h-10 w-full rounded-lg border border-line bg-subtle px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:bg-surface focus:outline-none" />
      
      {groups.length === 0 && <p className="mt-6 text-center text-sm text-muted">No elements match “{query.trim()}”.</p>}
      <div className="mt-4 space-y-5">
        {groups.map(({ category, items }) => {
          const hidden = project.hiddenCategoryIds.includes(category.id);
          const headingId = `layer-${category.id}`;
          return (
            <section key={category.id} aria-labelledby={headingId}>
              <div className="flex items-center gap-2.5 px-2">
                <LayerSwatch category={category} size="sm" />
                <h3 id={headingId} className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                  {category.name}
                </h3>
                <span className="text-xs tabular-nums text-muted">{items.length}</span>
                <button
                  type="button"
                  onClick={() => onToggleLayer(category.id)}
                  aria-pressed={!hidden}
                  aria-label={hidden ? `Show ${category.name}` : `Hide ${category.name}`}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-subtle hover:text-ink">
                  
                  {hidden ? <EyeOffIcon className="h-4 w-4" aria-hidden /> : <EyeIcon className="h-4 w-4" aria-hidden />}
                </button>
              </div>
              <ul className={`mt-1 ${hidden ? 'opacity-50' : ''}`}>
                {items.map((f) => {
                  const KindIcon = featureKinds[f.kind].icon;
                  return (
                    <li key={f.id} className="flex items-center gap-1 rounded-lg pr-1 hover:bg-subtle">
                      <button
                        type="button"
                        onClick={() => onSelect(f.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left">
                        
                        <span
                          className="h-2 w-2 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: f.color || category.color }}
                          title={`Color: ${f.color || category.color}`}
                        />
                        <KindIcon className="h-4 w-4 shrink-0 text-muted" aria-label={featureKinds[f.kind].label} />
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">{f.name || 'Untitled'}</span>
                        {f.images && f.images.length > 0 && (
                          <span
                            title={`${f.images.length} ${f.images.length === 1 ? 'foto adjunta' : 'fotos adjuntas'}`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ink/5 px-1.5 py-0.5 text-[11px] font-medium text-muted">
                            <ImageIcon className="h-3 w-3" aria-hidden="true" />
                            <span>{f.images.length}</span>
                          </span>
                        )}
                        {f.kind !== 'point' &&
                        <span className="shrink-0 text-xs tabular-nums text-muted">{measureFeature(f).primary}</span>
                        }
                      </button>
                      {!readOnly && onDelete && (
                        <button
                          type="button"
                          aria-label={`Eliminar ${f.name || 'elemento'}`}
                          onClick={() => onDelete(f.id)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger">
                          <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </li>);

                })}
              </ul>
            </section>);

        })}
      </div>
    </div>);

}