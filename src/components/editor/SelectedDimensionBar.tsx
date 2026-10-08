import React from 'react';
import { motion } from 'framer-motion';
import { CompassIcon, Maximize2Icon, RulerIcon, XIcon } from 'lucide-react';
import { formatArea, formatLength, pathLength, polygonArea } from '../../utils/geo';
import { computeEdgeMetrics } from '../../utils/dimensions';
import { featureKinds } from '../../data/featureKinds';
import { LayerSwatch } from './LayerSwatch';
import type { Category, PlanFeature } from '../../types/plan';

interface SelectedDimensionBarProps {
  feature: PlanFeature;
  category: Category;
  onDeselect: () => void;
  onZoomTo: () => void;
}

export function SelectedDimensionBar({
  feature,
  category,
  onDeselect,
  onZoomTo
}: SelectedDimensionBarProps) {
  const isArea = feature.kind === 'area';
  const isLine = feature.kind === 'line';
  const kind = featureKinds[feature.kind];
  const KindIcon = kind.icon;

  const area = isArea ? polygonArea(feature.coords) : 0;
  const perimeter = isArea ? pathLength(feature.coords, true) : isLine ? pathLength(feature.coords) : 0;
  const edges = isArea || isLine ? computeEdgeMetrics(feature.coords, isArea) : [];

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-center px-2">
      <motion.div
        role="region"
        aria-label="Dimensiones del elemento seleccionado"
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2.5 rounded-2xl border border-white/15 bg-ink/95 px-3.5 py-2 text-white shadow-float backdrop-blur-md">
        
        {/* Category & Title */}
        <div className="flex items-center gap-2 border-r border-white/15 pr-2.5">
          <LayerSwatch category={category} size="sm" />
          <div className="flex items-center gap-1.5">
            <KindIcon className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
            <span className="max-w-[140px] truncate text-xs font-bold text-white sm:max-w-[200px]">
              {feature.name || 'Sin título'}
            </span>
          </div>
        </div>

        {/* Primary Metric: Area or Length */}
        {isArea && (
          <div className="flex items-center gap-1.5">
            <Maximize2Icon className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span className="text-[11px] font-medium text-white/70">Superficie:</span>
            <span className="font-mono text-sm font-extrabold text-amber-400">
              {formatArea(area)}
            </span>
          </div>
        )}

        {isLine && (
          <div className="flex items-center gap-1.5">
            <RulerIcon className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span className="text-[11px] font-medium text-white/70">Longitud:</span>
            <span className="font-mono text-sm font-extrabold text-amber-400">
              {formatLength(perimeter)}
            </span>
          </div>
        )}

        {/* Secondary Metric: Perimeter */}
        {isArea && (
          <div className="hidden items-center gap-1 sm:flex">
            <span className="text-white/30">·</span>
            <span className="text-[11px] font-medium text-white/70">Perímetro:</span>
            <span className="font-mono text-xs font-bold text-white">
              {formatLength(perimeter)}
            </span>
          </div>
        )}

        {/* Sides / Edges summary */}
        {edges.length > 0 && (
          <div className="hidden items-center gap-1 md:flex">
            <span className="text-white/30">·</span>
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white/90">
              {edges.length} {edges.length === 1 ? 'lado' : 'lados'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 pl-1">
          <button
            type="button"
            onClick={onZoomTo}
            title="Centrar en el mapa"
            className="grid h-7 w-7 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white">
            <CompassIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDeselect}
            title="Deseleccionar"
            className="grid h-7 w-7 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white">
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
