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
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-start pr-14 lg:justify-center lg:pr-0">
      <motion.div
        role="status"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-auto flex max-w-full items-center gap-1.5 rounded-xl bg-ink py-1.5 pl-3.5 pr-1.5 text-on-ink shadow-float">
        <p className="min-w-0 flex-1 text-sm leading-snug">
          {instruction(tool, pointCount)}
          {multiPoint && pointCount > 0 && (
            <span className="ml-1.5 tabular-nums text-on-ink/80">
              · {pointCount} {pointCount === 1 ? 'vértice' : 'vértices'}
              {draftMetrics && (
                <span className="ml-1.5 font-semibold text-amber-400">· {draftMetrics}</span>
              )}
            </span>
          )}
        </p>

        {multiPoint && (
          <button
            type="button"
            onClick={onUndo}
            disabled={pointCount === 0}
            aria-label="Deshacer último vértice"
            title="Deshacer último vértice (Backspace)"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors duration-150 hover:bg-on-ink/10 disabled:opacity-40 disabled:hover:bg-transparent">
            <Undo2Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="h-9 shrink-0 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-on-ink/10">
          Cancelar
        </button>

        {multiPoint && (
          <button
            type="button"
            onClick={onFinish}
            disabled={!canFinish}
            className="h-9 shrink-0 whitespace-nowrap rounded-lg bg-accent px-3.5 text-sm font-semibold text-white transition-colors duration-150 disabled:bg-on-ink/15 disabled:text-on-ink/50">
            Finalizar
          </button>
        )}
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