import React from 'react';
import { motion } from 'framer-motion';
import { Undo2Icon } from 'lucide-react';
import type { Tool } from '../../types/plan';

interface DrawingBarProps {
  tool: Exclude<Tool, 'select'>;
  pointCount: number;
  draftMetrics?: string;
  canFinish: boolean;
  onUndo: () => void;
  onCancel: () => void;
  onFinish: () => void;
}

export function DrawingBar({
  tool,
  pointCount,
  draftMetrics,
  canFinish,
  onUndo,
  onCancel,
  onFinish
}: DrawingBarProps) {
  const multiPoint = tool === 'area' || tool === 'line';
  return (
    <div className="pointer-events-none absolute left-3 right-14 top-3 z-10 flex justify-start sm:inset-x-3 sm:right-3 sm:justify-center">
      <motion.div
        role="status"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-auto flex w-full max-w-sm flex-col gap-1.5 rounded-2xl bg-ink/95 p-2.5 text-on-ink shadow-float backdrop-blur-md sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-2 sm:rounded-xl sm:bg-ink sm:py-1.5 sm:pl-3.5 sm:pr-1.5">
        
        {/* Mobile Info Row / Desktop Inline Text */}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:justify-start">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 animate-pulse sm:hidden" aria-hidden="true" />
            <p className="truncate text-xs leading-snug text-white/95 sm:text-sm sm:overflow-visible sm:whitespace-normal">
              {instruction(tool, pointCount)}
              {multiPoint && pointCount > 0 && (
                <span className="hidden tabular-nums text-on-ink/80 sm:inline">
                  {' '}· {pointCount} {pointCount === 1 ? 'vértice' : 'vértices'}
                  {draftMetrics && (
                    <span className="ml-1.5 font-semibold text-amber-400">· {draftMetrics}</span>
                  )}
                </span>
              )}
            </p>
          </div>

          {/* Mobile Badge for points and metrics */}
          {multiPoint && pointCount > 0 && (
            <div className="shrink-0 font-mono text-[11px] font-semibold text-amber-400 sm:hidden">
              {pointCount} {pointCount === 1 ? 'pto' : 'ptos'}
              {draftMetrics && <span className="ml-1 text-white/90">· {draftMetrics}</span>}
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-end gap-1.5 border-t border-white/10 pt-1.5 sm:border-t-0 sm:pt-0">
          {multiPoint && (
            <button
              type="button"
              onClick={onUndo}
              disabled={pointCount === 0}
              aria-label="Deshacer último vértice"
              title="Deshacer último vértice (Backspace)"
              className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-white/90 transition-colors hover:bg-on-ink/10 disabled:opacity-30 disabled:hover:bg-transparent sm:grid sm:h-9 sm:w-9 sm:p-0 sm:place-items-center">
              <Undo2Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="sm:hidden">Deshacer</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="h-7 shrink-0 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-white/90 transition-colors duration-150 hover:bg-on-ink/10 sm:h-9 sm:px-3 sm:text-sm">
            Cancelar
          </button>

          {multiPoint && (
            <button
              type="button"
              onClick={onFinish}
              disabled={!canFinish}
              className="h-7 shrink-0 whitespace-nowrap rounded-lg bg-accent px-3 text-xs font-semibold text-white shadow-sm transition-colors duration-150 disabled:bg-on-ink/15 disabled:text-on-ink/40 sm:h-9 sm:px-3.5 sm:text-sm">
              Finalizar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function instruction(tool: Exclude<Tool, 'select'>, count: number): string {
  switch (tool) {
    case 'area':
      if (count === 0) return 'Toca el mapa para colocar el primer vértice';
      if (count < 3) return 'Sigue añadiendo vértices para delimitar el área';
      return 'Toca el primer punto o "Finalizar" para cerrar la figura';
    case 'line':
      if (count === 0) return 'Toca el mapa para iniciar el recorrido';
      if (count < 2) return 'Toca para añadir el siguiente tramo';
      return 'Añade más tramos o presiona "Finalizar"';
    case 'rectangle':
      return count === 0 ? 'Toca para fijar la primera esquina' : 'Arrastra y toca para fijar la esquina opuesta';
    case 'point':
      return 'Toca donde desees ubicar el marcador';
  }
}