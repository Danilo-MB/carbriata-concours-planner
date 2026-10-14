import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CameraIcon,
  CheckIcon,
  FootprintsIcon,
  InfoIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { StreetViewPlayer } from './StreetViewPlayer';
import { SAMPLE_STREETVIEW_WAYPOINTS } from '../../data/streetViewSamples';
import type { PlanFeature } from '../../types/plan';

interface RouteStreetViewPromptModalProps {
  feature: PlanFeature;
  onClose: () => void;
  onApplySamplePhotos: () => void;
  onOpenWaypointManager: () => void;
}

export function RouteStreetViewPromptModal({
  feature,
  onClose,
  onApplySamplePhotos,
  onOpenWaypointManager,
}: RouteStreetViewPromptModalProps) {
  // Create a demo feature for the interactive tutorial player
  const demoFeature = useMemo<PlanFeature>(() => {
    const coords =
      feature.coords.length >= 2
        ? feature.coords
        : [
            [-36.326, -57.698],
            [-36.327, -57.697],
            [-36.328, -57.696],
            [-36.329, -57.695],
            [-36.33, -57.694],
          ];

    const count = coords.length;
    return {
      ...feature,
      coords,
      routeWaypoints: coords.map((_, i) => {
        const sample = SAMPLE_STREETVIEW_WAYPOINTS[i % SAMPLE_STREETVIEW_WAYPOINTS.length];
        return {
          index: i,
          title: sample.title,
          caption: sample.caption,
          image: sample.image,
        };
      }),
    };
  }, [feature]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl text-ink max-h-[92dvh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-subtle/50">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <FootprintsIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  ¡Ruta creada!
                </span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  {feature.coords.length} puntos trazados
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink sm:text-xl">
                ¿Quieres activar el modo Street View virtual?
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Explanation banner */}
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 text-xs sm:text-sm text-ink leading-relaxed">
            <p className="font-semibold text-ink flex items-center gap-1.5">
              <SparklesIcon className="h-4 w-4 text-amber-500 shrink-0" />
              Emula la experiencia de Google Street View sobre tu plano
            </p>
            <p className="mt-1 text-muted">
              Puedes subir fotos en cada punto de tu recorrido. Al explorar tu mapa, los visitantes podrán <strong>hacer clic y caminar virtualmente</strong> de foto en foto con indicadores de dirección, nombres de zonas y mini-mapa en tiempo real.
            </p>
          </div>

          {/* Interactive Tutorial Mini-Viewer */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <InfoIcon className="h-3.5 w-3.5 text-amber-500" />
                Prueba interactiva del funcionamiento (haz clic en avanzar o en los puntos):
              </span>
            </div>

            <div className="h-[320px] sm:h-[380px] w-full overflow-hidden rounded-xl border border-line shadow-inner">
              <StreetViewPlayer
                feature={demoFeature}
                isModal={false}
                canEdit={false}
              />
            </div>
          </div>

          {/* Value points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-line bg-subtle/40 p-3">
              <p className="text-xs font-bold text-ink">🚶‍♂️ Caminata foto a foto</p>
              <p className="mt-1 text-[11px] text-muted">
                Flechas interactivas en pantalla y teclado para avanzar o retroceder de punto en punto.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-subtle/40 p-3">
              <p className="text-xs font-bold text-ink">🗺️ Mini-mapa sincronizado</p>
              <p className="mt-1 text-[11px] text-muted">
                Un radar muestra el haz de visión de la cámara orientándose según la dirección del camino.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-subtle/40 p-3">
              <p className="text-xs font-bold text-ink">📱 100% Celular e iFrame</p>
              <p className="mt-1 text-[11px] text-muted">
                Los asistentes en el predio o en tu web oficial disfrutan del paseo sin instalar nada.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-line px-5 py-4 bg-subtle/30">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            Continuar sin fotos por ahora
          </button>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <button
              type="button"
              onClick={onOpenWaypointManager}
              className="flex-1 sm:flex-initial inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-4 text-xs font-semibold text-ink shadow-2xs hover:bg-subtle transition-all active:scale-98"
            >
              <CameraIcon className="h-4 w-4 text-muted" />
              Subir mis propias fotos
            </button>

            <button
              type="button"
              onClick={onApplySamplePhotos}
              className="flex-1 sm:flex-initial inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 text-xs font-bold text-black shadow-md hover:from-amber-400 hover:to-orange-400 transition-all active:scale-98"
            >
              <SparklesIcon className="h-4 w-4" />
              Cargar fotos de ejemplo y probar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
