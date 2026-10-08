import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  Maximize2Icon,
  PencilIcon,
  RulerIcon,
  ScanIcon,
  XIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { featureKinds } from '../../data/featureKinds';
import { measureFeature } from '../../utils/geo';
import { computeEdgeMetrics } from '../../utils/dimensions';
import { LayerSwatch } from './LayerSwatch';
import type { Category, PlanFeature } from '../../types/plan';

interface VisitorElementDetailsProps {
  feature: PlanFeature;
  category: Category;
  onBack: () => void;
  onZoomTo: () => void;
  onSwitchToEditor?: () => void;
}

export function VisitorElementDetails({
  feature,
  category,
  onBack,
  onZoomTo,
  onSwitchToEditor
}: VisitorElementDetailsProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const kind = featureKinds[feature.kind];
  const KindIcon = kind.icon;
  const measure = measureFeature(feature);
  const images = feature.images || [];

  const edges =
    feature.kind === 'area' || feature.kind === 'line'
      ? computeEdgeMetrics(feature.coords, feature.kind === 'area')
      : [];

  const nextImage = () => setActiveImageIdx((i) => (i + 1) % images.length);
  const prevImage = () => setActiveImageIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="px-4 pb-10 pt-3">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted transition-colors hover:bg-subtle hover:text-ink">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Volver al plano
        </button>

        {onSwitchToEditor && (
          <button
            type="button"
            onClick={onSwitchToEditor}
            title="Editar este elemento en modo organizador"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-subtle/60 px-2.5 text-xs font-semibold text-ink transition-colors hover:bg-subtle">
            <PencilIcon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            Editar
          </button>
        )}
      </div>

      {/* Hero photo / gallery if photos exist */}
      {images.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-ink/5 shadow-sm">
          <div className="group relative aspect-[16/10] w-full overflow-hidden bg-black/10">
            <img
              src={images[activeImageIdx]}
              alt={feature.name || 'Foto del elemento'}
              onClick={() => setLightboxOpen(true)}
              className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {/* Lightbox zoom button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Ver en pantalla completa"
              className="absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
              <Maximize2Icon className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Image counter pill */}
            <div className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              {activeImageIdx + 1} / {images.length}
            </div>

            {/* Prev / Next controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/80 group-hover:opacity-100">
                  <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Foto siguiente"
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/80 group-hover:opacity-100">
                  <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip if multiple photos */}
          {images.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto p-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    idx === activeImageIdx
                      ? 'border-ink shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category badge */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-subtle px-2.5 py-1 text-xs font-semibold text-ink shadow-2xs"
          style={{ borderColor: `${feature.color || category.color}40` }}>
          <LayerSwatch category={category} colorOverride={feature.color} size="sm" />
          {category.name}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <KindIcon className="h-3 w-3" aria-hidden="true" />
          {kind.label}
        </span>
      </div>

      {/* Element Title */}
      <h2 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
        {feature.name || 'Elemento sin título'}
      </h2>

      {/* Metric Info Cards */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line bg-subtle/50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {feature.kind === 'area'
              ? 'Superficie'
              : feature.kind === 'line'
              ? 'Longitud'
              : 'Coordenadas'}
          </p>
          <p className="mt-1 font-mono text-base font-bold text-ink sm:text-lg">
            {measure.primary}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-subtle/50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {feature.kind === 'area'
              ? 'Perímetro'
              : feature.kind === 'line'
              ? 'Puntos trazados'
              : 'Ubicación'}
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-ink sm:text-base">
            {measure.secondary || (feature.kind === 'point' ? 'En el mapa' : '--')}
          </p>
        </div>
      </div>

      {/* Side Dimensions Breakdown (for area & line) */}
      {edges.length > 0 && (
        <div className="mt-3 rounded-xl border border-line bg-subtle/40 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-ink">
            <span className="flex items-center gap-1.5">
              <RulerIcon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              {feature.kind === 'area' ? 'Dimensiones de los lados' : 'Tramos del recorrido'}
            </span>
            <span className="text-[11px] font-normal text-muted">
              {edges.length} {edges.length === 1 ? 'lado' : 'lados'}
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs">
            {edges.map((edge, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-line/60 bg-surface px-2.5 py-1.5">
                <span className="text-[11px] text-muted">Lado {idx + 1}</span>
                <span className="font-mono text-xs font-semibold text-ink">{edge.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes / Description */}
      {feature.notes ? (
        <div className="mt-4 rounded-xl border border-line bg-surface p-3.5 shadow-2xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Información & Detalles
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {feature.notes}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-line p-3 text-center text-xs text-muted">
          Sin descripción o notas adicionales.
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={onZoomTo}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-on-ink shadow-sm transition-all hover:opacity-90 active:scale-[0.99]">
          <CompassIcon className="h-4 w-4" aria-hidden="true" />
          Centrar elemento en el mapa
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && images[activeImageIdx] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Cerrar visor"
              className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20">
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 flex max-h-[85vh] max-w-4xl flex-col items-center">
              <img
                src={images[activeImageIdx]}
                alt={feature.name}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />

              <div className="mt-3 flex items-center gap-4 text-white">
                <span className="text-sm font-medium">
                  {feature.name} · Foto {activeImageIdx + 1} de {images.length}
                </span>
                {images.length > 1 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={prevImage}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 hover:bg-white/25">
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 hover:bg-white/25">
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
