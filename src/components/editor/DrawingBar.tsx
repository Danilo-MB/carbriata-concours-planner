import React from 'react';
import { motion } from 'framer-motion';
import { Undo2Icon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Tool } from '../../types/plan';
import type { TranslationKey } from '../../locales/translations';

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
  const { t } = useLanguage();
  const multiPoint = tool === 'area' || tool === 'line';

  return (
    <div className="pointer-events-none absolute left-3 right-14 top-3 z-10 flex justify-start sm:inset-x-3 sm:right-3 sm:justify-center">
      <motion.div
        role="status"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-auto flex w-full max-w-sm flex-col gap-1.5 rounded-2xl border border-white/20 bg-zinc-900/95 p-2.5 text-white shadow-float backdrop-blur-md dark:border-zinc-700/80 dark:bg-zinc-950/95 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-2 sm:rounded-xl sm:py-1.5 sm:pl-3.5 sm:pr-1.5">
        
        {/* Mobile Info Row / Desktop Inline Text */}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:justify-start">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 animate-pulse sm:hidden" aria-hidden="true" />
            <p className="truncate text-xs leading-snug text-white/95 sm:text-sm sm:overflow-visible sm:whitespace-normal">
              {getInstruction(tool, pointCount, t)}
              {multiPoint && pointCount > 0 && (
                <span className="hidden tabular-nums text-zinc-300 sm:inline">
                  {' '}· {pointCount} {pointCount === 1 ? t('vertex') : t('vertices')}
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
              {pointCount} {pointCount === 1 ? t('point') : t('points')}
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
              aria-label={t('undo')}
              title={`${t('undo')} (Backspace)`}
              className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent sm:grid sm:h-9 sm:w-9 sm:p-0 sm:place-items-center">
              <Undo2Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="sm:hidden">{t('undo')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="h-7 shrink-0 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-zinc-200 transition-colors duration-150 hover:bg-white/15 sm:h-9 sm:px-3 sm:text-sm">
            {t('cancel')}
          </button>

          {multiPoint && (
            <button
              type="button"
              onClick={onFinish}
              disabled={!canFinish}
              className="h-7 shrink-0 whitespace-nowrap rounded-lg bg-accent px-3 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-accent/90 disabled:bg-white/15 disabled:text-white/40 sm:h-9 sm:px-3.5 sm:text-sm">
              {t('finish')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function getInstruction(tool: Exclude<Tool, 'select'>, count: number, t: (k: TranslationKey) => string): string {
  switch (tool) {
    case 'area':
      if (count === 0) return t('drawAreaStart');
      if (count < 3) return t('drawAreaContinue');
      return t('drawAreaClose');
    case 'line':
      if (count === 0) return t('drawLineStart');
      if (count < 2) return t('drawLineContinue');
      return t('drawLineFinish');
    case 'rectangle':
      return count === 0 ? t('drawRectStart') : t('drawRectEnd');
    case 'point':
      return t('drawPoint');
  }
}