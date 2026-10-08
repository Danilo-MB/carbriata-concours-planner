import React from 'react';
import { CheckIcon, ChevronDownIcon, EyeIcon, EyeOffIcon, Trash2Icon } from 'lucide-react';
import { categoryColors } from '../../data/categoryColors';
import { categoryIconKeys, categoryIcons } from '../../data/categoryIcons';
import { LayerSwatch } from './LayerSwatch';
import type { Category } from '../../types/plan';

interface LayerRowProps {
  category: Category;
  count: number;
  hidden: boolean;
  expanded: boolean;
  canDelete: boolean;
  onToggleExpanded: () => void;
  onToggleVisible: () => void;
  onChange: (patch: Partial<Category>) => void;
  onDelete: () => void;
}

export function LayerRow({
  category,
  count,
  hidden,
  expanded,
  canDelete,
  onToggleExpanded,
  onToggleVisible,
  onChange,
  onDelete
}: LayerRowProps) {
  const panelId = `layer-edit-${category.id}`;
  return (
    <li>
      <div className="flex items-center gap-2 py-2">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggleExpanded}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 text-left">
          
          <LayerSwatch category={category} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{category.name || 'Untitled layer'}</span>
            <span className="block text-xs text-muted">
              {count} {count === 1 ? 'element' : 'elements'}
            </span>
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ease-snappy ${expanded ? 'rotate-180' : ''}`}
            aria-hidden />
          
        </button>
        <button
          type="button"
          onClick={onToggleVisible}
          aria-pressed={!hidden}
          aria-label={hidden ? `Show ${category.name}` : `Hide ${category.name}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-subtle hover:text-ink">
          
          {hidden ? <EyeOffIcon className="h-4 w-4" aria-hidden /> : <EyeIcon className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      {expanded &&
      <div id={panelId} className="space-y-4 pb-4 pl-10 pr-1">
          <div>
            <label htmlFor={`${panelId}-name`} className="text-xs font-medium text-muted">
              Name
            </label>
            <input
            id={`${panelId}-name`}
            value={category.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="mt-1 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-ink focus:outline-none" />
          
          </div>

          <div>
            <p id={`${panelId}-color`} className="text-xs font-medium text-muted">
              Color
            </p>
            <div role="radiogroup" aria-labelledby={`${panelId}-color`} className="mt-1.5 flex flex-wrap gap-1.5">
              {categoryColors.map((color) => {
              const checked = color === category.color;
              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={color}
                  onClick={() => onChange({ color })}
                  className={`grid h-8 w-8 place-items-center rounded-lg ${checked ? 'ring-2 ring-ink ring-offset-2' : ''}`}
                  style={{ backgroundColor: color }}>
                  
                    {checked && <CheckIcon className="h-4 w-4" color="#fff" strokeWidth={3} aria-hidden />}
                  </button>);

            })}
            </div>
          </div>

          <div>
            <p id={`${panelId}-icon`} className="text-xs font-medium text-muted">
              Marker icon
            </p>
            <div role="radiogroup" aria-labelledby={`${panelId}-icon`} className="mt-1.5 grid grid-cols-7 gap-1.5 sm:grid-cols-8">
              {categoryIconKeys.map((key) => {
              const Icon = categoryIcons[key];
              const checked = key === category.icon;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={key}
                  onClick={() => onChange({ icon: key })}
                  className={`grid aspect-square place-items-center rounded-lg border transition-colors duration-150 ${
                  checked ? 'border-ink bg-ink text-on-ink' : 'border-line text-ink hover:bg-subtle'}`
                  }>
                  
                    <Icon className="h-4 w-4" aria-hidden />
                  </button>);

            })}
            </div>
          </div>

          <button
          type="button"
          onClick={onDelete}
          disabled={!canDelete}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger/10 disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent">
          
            <Trash2Icon className="h-4 w-4" aria-hidden />
            {canDelete ? 'Delete layer' : 'A plan needs at least one layer'}
          </button>
        </div>
      }
    </li>);

}