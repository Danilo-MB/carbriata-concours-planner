import React from 'react';
import { motion } from 'framer-motion';
import { CompassIcon, FootprintsIcon, Maximize2Icon, RulerIcon, XIcon } from 'lucide-react';
import { formatArea, formatLength, pathLength, polygonArea } from '../../utils/geo';
import { computeEdgeMetrics } from '../../utils/dimensions';
import { featureKinds } from '../../data/featureKinds';
import { LayerSwatch } from './LayerSwatch';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Category, PlanFeature } from '../../types/plan';

interface SelectedDimensionBarProps {
  feature: PlanFeature;
  category: Category;
  onDeselect: () => void;
  onZoomTo: () => void;
  onOpenStreetView?: (initialIndex?: number) => void;
}

export function SelectedDimensionBar({
  feature,
  category,
  onDeselect,
  onZoomTo,
  onOpenStreetView
}: SelectedDimensionBarProps) {
  const { t } = useLanguage();
  const isArea = feature.kind === 'area';
  const isLine = feature.kind === 'line';
  const kind = featureKinds[feature.kind];
  const KindIcon = kind.icon;

  const area = isArea ? polygonArea(feature.coords) : 0;
  const perimeter = isArea ? pathLength(feature.coords, true) : isLine ? pathLength(feature.coords) : 0;
  const edges = isArea || isLine ? computeEdgeMetrics(feature.coords, isArea) : [];

  return (
    <div className="pointer-events-none absolute left-3 right-14 top-3 z-10 flex justify-start sm:right-3 sm:justify-center">
      <motion.div
        role="region"
        aria-label={t('planDetails')}
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-auto flex max-w-full items-center gap-2 rounded-2xl border border-white/15 bg-ink/95 px-3 py-1.5 text-white shadow-float backdrop-blur-md sm:gap-2.5 sm:px-3.5 sm:py-2">
        
        {/* Category & Title */}
        <div className="flex min-w-0 items-center gap-1.5 border-r border-white/15 pr-2 sm:gap-2 sm:pr-2.5">
          <LayerSwatch category={category} colorOverride={feature.color} size="sm" />
          <div className="flex min-w-0 items-center gap-1">
            <KindIcon className="h-3.5 w-3.5 shrink-0 text-white/70" aria-hidden="true" />
            <span className="max-w-[85px] truncate text-xs font-bold text-white sm:max-w-[180px]">
              {feature.name || t('untitled')}
            </span>
          </div>
        </div>

        {/* Primary Metric: Area or Length */}
        {isArea && (
          <div className="flex shrink-0 items-center gap-1">
            <Maximize2Icon className="h-3 w-3 text-amber-400 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span className="hidden text-[11px] font-medium text-white/70 sm:inline">{t('area')}:</span>
            <span className="font-mono text-xs font-extrabold text-amber-400 sm:text-sm">
              {formatArea(area)}
            </span>
          </div>
        )}

        {isLine && (
          <div className="flex shrink-0 items-center gap-1">
            <RulerIcon className="h-3 w-3 text-amber-400 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span className="hidden text-[11px] font-medium text-white/70 sm:inline">{t('length')}:</span>
            <span className="font-mono text-xs font-extrabold text-amber-400 sm:text-sm">
              {formatLength(perimeter)}
            </span>
          </div>
        )}

        {/* Secondary Metric: Perimeter */}
        {isArea && (
          <div className="hidden items-center gap-1 sm:flex">
            <span className="text-white/30">·</span>
            <span className="text-[11px] font-medium text-white/70">{t('perimeter')}:</span>
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
              {edges.length} {edges.length === 1 ? t('side') : t('sides')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5 pl-1 sm:gap-1">
          {isLine && onOpenStreetView && (
            <button
              type="button"
              onClick={() => onOpenStreetView(0)}
              title="Abrir Street View"
              aria-label="Abrir Street View"
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-amber-500/25 px-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/40">
              <FootprintsIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Street View</span>
            </button>
          )}
          <button
            type="button"
            onClick={onZoomTo}
            title={t('zoomTo')}
            aria-label={t('zoomTo')}
            className="grid h-7 w-7 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white">
            <CompassIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDeselect}
            title={t('deselect')}
            aria-label={t('deselect')}
            className="grid h-7 w-7 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white">
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
