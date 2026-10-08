import React, { useState } from 'react';
import { CrosshairIcon, DownloadIcon, HouseIcon, PlusIcon } from 'lucide-react';
import { basemaps } from '../../data/basemaps';
import { LayerRow } from './LayerRow';
import type { Editor } from '../../hooks/useEditor';
import type { Basemap, Project } from '../../types/plan';

interface PlanSettingsProps {
  project: Project;
  editor: Editor;
  onRename: (patch: Partial<Pick<Project, 'name' | 'location' | 'description'>>) => void;
  onSaveCenter: () => void;
  onGoToCenter: () => void;
  onExport: () => void;
}

export function PlanSettings({ project, editor, onRename, onSaveCenter, onGoToCenter, onExport }: PlanSettingsProps) {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none';

  return (
    <div className="pb-8">
      <section aria-labelledby="plan-details" className="space-y-3 border-b border-line px-4 py-5">
        <h3 id="plan-details" className="text-sm font-semibold text-ink">
          Plan details
        </h3>
        <div>
          <label htmlFor="plan-name" className="text-xs font-medium text-muted">
            Name
          </label>
          <input id="plan-name" value={project.name} onChange={(e) => onRename({ name: e.target.value })} className={`${inputClass} h-10`} />
        </div>
        <div>
          <label htmlFor="plan-location" className="text-xs font-medium text-muted">
            Venue or location
          </label>
          <input
            id="plan-location"
            value={project.location}
            onChange={(e) => onRename({ location: e.target.value })}
            className={`${inputClass} h-10`} />
          
        </div>
        <div>
          <label htmlFor="plan-description" className="text-xs font-medium text-muted">
            Description
          </label>
          <textarea
            id="plan-description"
            rows={3}
            value={project.description}
            onChange={(e) => onRename({ description: e.target.value })}
            placeholder="What is this plan for?"
            className={`${inputClass} resize-y py-2`} />
          
        </div>
      </section>

      <section aria-labelledby="plan-center" className="border-b border-line px-4 py-5">
        <h3 id="plan-center" className="text-sm font-semibold text-ink">
          Map center
        </h3>
        <p className="mt-1 text-sm text-muted">The plan always opens here. Pan and zoom the map, then save the view.</p>
        <dl className="mt-3 flex gap-6 text-sm tabular-nums">
          <div>
            <dt className="text-xs text-muted">Coordinates</dt>
            <dd className="font-medium text-ink">
              {project.center.lat.toFixed(5)}, {project.center.lng.toFixed(5)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Zoom</dt>
            <dd className="font-medium text-ink">{project.center.zoom}</dd>
          </div>
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSaveCenter}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-ink px-3 text-sm font-medium text-on-ink transition-colors duration-150 hover:bg-ink/90">
            
            <CrosshairIcon className="h-4 w-4" aria-hidden />
            Use current view
          </button>
          <button
            type="button"
            onClick={onGoToCenter}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-subtle">
            
            <HouseIcon className="h-4 w-4" aria-hidden />
            Go to center
          </button>
        </div>
        <div className="mt-5">
          <p id="basemap-label" className="text-xs font-medium text-muted">
            Base map
          </p>
          <div role="radiogroup" aria-labelledby="basemap-label" className="mt-1.5 inline-flex rounded-lg bg-subtle p-1">
            {(Object.keys(basemaps) as Basemap[]).map((key) => {
              const checked = project.basemap === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => editor.setBasemap(key)}
                  className={`h-8 rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                  checked ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`
                  }>
                  
                  {basemaps[key].label}
                </button>);

            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="plan-layers" className="border-b border-line px-4 py-5">
        <div className="flex items-center justify-between">
          <h3 id="plan-layers" className="text-sm font-semibold text-ink">
            Layers
          </h3>
          <button
            type="button"
            onClick={() => setExpandedLayer(editor.addLayer())}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-subtle">
            
            <PlusIcon className="h-4 w-4" aria-hidden />
            Add layer
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">Group elements by what they are. Colors and icons show on the map.</p>
        <ul className="mt-2 divide-y divide-line">
          {project.categories.map((c) =>
          <LayerRow
            key={c.id}
            category={c}
            count={project.features.filter((f) => f.categoryId === c.id).length}
            hidden={project.hiddenCategoryIds.includes(c.id)}
            expanded={expandedLayer === c.id}
            canDelete={project.categories.length > 1}
            onToggleExpanded={() => setExpandedLayer((id) => id === c.id ? null : c.id)}
            onToggleVisible={() => editor.toggleLayer(c.id)}
            onChange={(patch) => editor.updateLayer(c.id, patch)}
            onDelete={() => editor.deleteLayer(c.id)} />

          )}
        </ul>
      </section>

      <section aria-labelledby="plan-export" className="px-4 py-5">
        <h3 id="plan-export" className="text-sm font-semibold text-ink">
          Export
        </h3>
        <p className="mt-1 text-sm text-muted">Download every element as GeoJSON to open in Google Earth, QGIS or share with suppliers.</p>
        <button
          type="button"
          onClick={onExport}
          disabled={project.features.length === 0}
          className="mt-3 inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50">
          
          <DownloadIcon className="h-4 w-4" aria-hidden />
          Download GeoJSON
        </button>
      </section>
    </div>);

}