import React, { useEffect, useRef } from 'react';
import { ArrowLeftIcon, CopyIcon, ScanIcon, Trash2Icon } from 'lucide-react';
import { featureKinds } from '../../data/featureKinds';
import { measureFeature } from '../../utils/geo';
import { LayerSwatch } from './LayerSwatch';
import type { Category, PlanFeature } from '../../types/plan';

interface ElementDetailsProps {
  feature: PlanFeature;
  categories: Category[];
  autoFocus: boolean;
  onAutoFocused: () => void;
  onBack: () => void;
  onChange: (patch: Partial<PlanFeature>) => void;
  onZoomTo: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function ElementDetails({
  feature,
  categories,
  autoFocus,
  onAutoFocused,
  onBack,
  onChange,
  onZoomTo,
  onDuplicate,
  onDelete
}: ElementDetailsProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const kind = featureKinds[feature.kind];
  const KindIcon = kind.icon;
  const measure = measureFeature(feature);

  useEffect(() => {
    if (!autoFocus) return;
    const el = nameRef.current;
    el?.focus({ preventScroll: true });
    el?.select();
    onAutoFocused();
  }, [autoFocus, onAutoFocused]);

  const hint =
  feature.kind === 'point' ?
  'Drag the marker on the map to move it.' :
  'Drag the white points to reshape, the small dots to add a point, and the dark handle to move it. Double-click or long-press a point to remove it.';

  return (
    <div className="px-4 pb-8 pt-3">
      <button
        type="button"
        onClick={onBack}
        className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-muted transition-colors duration-150 hover:bg-subtle hover:text-ink">
        
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        All elements
      </button>

      <div className="mt-3">
        <label htmlFor="element-name" className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <KindIcon className="h-3.5 w-3.5" aria-hidden />
          {kind.label} name
        </label>
        <input
          ref={nameRef}
          id="element-name"
          value={feature.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Name this element"
          className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-lg font-semibold text-ink placeholder:font-normal placeholder:text-muted focus:border-ink focus:outline-none" />
        
        <p className="mt-2 text-sm tabular-nums text-muted">
          <span className="font-medium text-ink">{measure.primary}</span>
          {measure.secondary && <span> · {measure.secondary}</span>}
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-ink">Layer</legend>
        <div role="radiogroup" aria-label="Layer" className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => {
            const checked = c.id === feature.categoryId;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onChange({ categoryId: c.id })}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border py-1 pl-1 pr-3 text-sm transition-colors duration-150 ${
                checked ? 'border-ink bg-ink text-on-ink' : 'border-line text-ink hover:border-ink/40'}`
                }>
                
                <LayerSwatch category={c} size="sm" />
                {c.name}
              </button>);

          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="element-notes" className="text-sm font-medium text-ink">
          Notes
        </label>
        <textarea
          id="element-notes"
          rows={3}
          value={feature.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Capacity, contacts, setup times…"
          className="mt-1.5 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none" />
        
      </div>

      <p className="mt-4 rounded-lg bg-subtle px-3 py-2.5 text-xs leading-relaxed text-muted">{hint}</p>

      <div className="mt-5 flex gap-2 border-t border-line pt-4">
        <ActionButton onClick={onZoomTo} icon={<ScanIcon className="h-4 w-4" aria-hidden />} label="Zoom to" />
        <ActionButton onClick={onDuplicate} icon={<CopyIcon className="h-4 w-4" aria-hidden />} label="Duplicate" />
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger/10">
          
          <Trash2Icon className="h-4 w-4" aria-hidden />
          Delete
        </button>
      </div>
    </div>);

}

function ActionButton({ onClick, icon, label }: {onClick: () => void;icon: React.ReactNode;label: string;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-subtle">
      
      {icon}
      {label}
    </button>);

}