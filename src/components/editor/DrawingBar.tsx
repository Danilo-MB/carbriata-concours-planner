import React from 'react';
import { motion } from 'framer-motion';
import { Undo2Icon } from 'lucide-react';
import type { Tool } from '../../types/plan';

interface DrawingBarProps {
  tool: Exclude<Tool, 'select'>;
  pointCount: number;
  canFinish: boolean;
  onUndo: () => void;
  onCancel: () => void;
  onFinish: () => void;
}

export function DrawingBar({ tool, pointCount, canFinish, onUndo, onCancel, onFinish }: DrawingBarProps) {
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
          {multiPoint && pointCount > 0 &&
          <span className="ml-1.5 tabular-nums text-on-ink/60">
              · {pointCount} {pointCount === 1 ? 'point' : 'points'}
            </span>
          }
        </p>
        {multiPoint &&
        <button
          type="button"
          onClick={onUndo}
          disabled={pointCount === 0}
          aria-label="Undo last point"
          title="Undo last point (Backspace)"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors duration-150 hover:bg-on-ink/10 disabled:opacity-40 disabled:hover:bg-transparent">
          
            <Undo2Icon className="h-4 w-4" aria-hidden />
          </button>
        }
        <button
          type="button"
          onClick={onCancel}
          className="h-9 shrink-0 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-on-ink/10">
          
          Cancel
        </button>
        {multiPoint &&
        <button
          type="button"
          onClick={onFinish}
          disabled={!canFinish}
          className="h-9 shrink-0 whitespace-nowrap rounded-lg bg-accent px-3 text-sm font-semibold text-white transition-colors duration-150 disabled:bg-on-ink/15 disabled:text-on-ink/50">
          
            Finish
          </button>
        }
      </motion.div>
    </div>);

}

function instruction(tool: Exclude<Tool, 'select'>, count: number): string {
  switch (tool) {
    case 'area':
      if (count === 0) return 'Tap the map to place the first corner';
      if (count < 3) return 'Keep adding corners';
      return 'Tap the first point or Finish to close';
    case 'line':
      if (count === 0) return 'Tap the map to start the path';
      if (count < 2) return 'Tap to add the next point';
      return 'Add more points or Finish';
    case 'rectangle':
      return count === 0 ? 'Tap the first corner' : 'Now tap the opposite corner';
    case 'point':
      return 'Tap where the marker goes';
  }
}