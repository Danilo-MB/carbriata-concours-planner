import React, { useEffect, useRef } from 'react';
import { ArrowLeftIcon, CopyIcon, RulerIcon, ScanIcon, Trash2Icon } from 'lucide-react';
import { featureKinds } from '../../data/featureKinds';
import { measureFeature } from '../../utils/geo';
import { computeEdgeMetrics } from '../../utils/dimensions';
import { LayerSwatch } from './LayerSwatch';
import { ImageGallery } from './ImageGallery';
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
  const edges =
    feature.kind === 'area' || feature.kind === 'line'
      ? computeEdgeMetrics(feature.coords, feature.kind === 'area')
      : [];

  useEffect(() => {
    if (!autoFocus) return;
    const el = nameRef.current;
    el?.focus({ preventScroll: true });
    el?.select();
    onAutoFocused();
  }, [autoFocus, onAutoFocused]);

  const hint =
  feature.kind === 'point' ?
  'Arrastra el marcador en el mapa para moverlo.' :
  'Arrastra los puntos blancos para deformar, los puntos intermedios para añadir vértices, y el tirador central para mover toda la figura. Haz doble clic en un vértice para eliminarlo.';

  return (
    <div className="px-4 pb-8 pt-3">
      <button
        type="button"
        onClick={onBack}
        className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-muted transition-colors duration-150 hover:bg-subtle hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Todos los elementos
      </button>

      <div className="mt-3">
        <label htmlFor="element-name" className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <KindIcon className="h-3.5 w-3.5" aria-hidden />
          Nombre del {kind.label.toLowerCase()}
        </label>
        <input
          ref={nameRef}
          id="element-name"
          value={feature.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Nombre de este elemento"
          className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-lg font-semibold text-ink placeholder:font-normal placeholder:text-muted focus:border-ink focus:outline-none" />
        
        <p className="mt-2 text-sm tabular-nums text-muted">
          <span className="font-semibold text-ink">{measure.primary}</span>
          {measure.secondary && <span> · {measure.secondary}</span>}
        </p>

        {edges.length > 0 && (
          <div className="mt-3 rounded-xl border border-line bg-subtle/50 p-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-ink">
              <span className="flex items-center gap-1.5">
                <RulerIcon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                {feature.kind === 'area' ? 'Medidas de cada lado' : 'Tramos del recorrido'}
              </span>
              <span className="text-[11px] font-normal text-muted">
                {edges.length} {edges.length === 1 ? 'lado' : 'lados'}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
              {edges.map((edge, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-line/60 bg-surface px-2.5 py-1.5 shadow-2xs">
                  <span className="text-[11px] text-muted">Lado {idx + 1}</span>
                  <span className="font-mono text-xs font-semibold text-ink">{edge.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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

      <ImageGallery
        images={feature.images || []}
        onChange={(images) => onChange({ images })}
        elementName={feature.name || 'Elemento'}
      />

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