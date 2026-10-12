import React from 'react';
import { Trash2Icon } from 'lucide-react';
import { drawingTools } from '../../data/tools';
import type { Tool } from '../../types/plan';

interface EditorToolbarProps {
  tool: Tool;
  onChange: (tool: Tool) => void;
  onClearAll?: () => void;
  hasFeatures?: boolean;
}

export function EditorToolbar({ tool, onChange, onClearAll, hasFeatures = false }: EditorToolbarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-2 sm:bottom-6 sm:px-3">
      <div
        role="toolbar"
        aria-label="Drawing tools"
        className="pointer-events-auto flex max-w-[calc(100vw-16px)] items-center gap-0.5 overflow-x-auto rounded-2xl bg-surface p-1 shadow-float scrollbar-none sm:max-w-none sm:gap-1 sm:p-1.5">
        {drawingTools.map((t) => {
          const active = tool === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              title={`${t.label} (${t.shortcut})`}
              onClick={() => onChange(active && t.id !== 'select' ? 'select' : t.id)}
              className={`flex min-w-[46px] flex-col items-center gap-0.5 whitespace-nowrap rounded-xl px-1.5 py-1 text-[10px] font-medium transition-[background-color,color,transform] duration-150 ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:min-w-[68px] sm:px-2 sm:py-1.5 sm:text-[11px] ${
              active ? 'bg-ink text-on-ink' : 'text-ink hover:bg-subtle'}`
              }>
              
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              {t.label}
            </button>);

        })}

        {onClearAll && (
          <>
            <div className="mx-0.5 h-6 w-px bg-line sm:h-7" aria-hidden="true" />
            <button
              type="button"
              onClick={onClearAll}
              disabled={!hasFeatures}
              title="Borrar todo (Eliminar todos los elementos del mapa)"
              className={`flex min-w-[46px] flex-col items-center gap-0.5 whitespace-nowrap rounded-xl px-1.5 py-1 text-[10px] font-medium transition-[background-color,color,transform,opacity] duration-150 ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-danger sm:min-w-[68px] sm:px-2 sm:py-1.5 sm:text-[11px] ${
                hasFeatures
                  ? 'text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/15'
                  : 'cursor-not-allowed opacity-35 text-muted'
              }`}>
              <Trash2Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <span className="sm:hidden">Borrar</span>
              <span className="hidden sm:inline">Borrar todo</span>
            </button>
          </>
        )}
      </div>
    </div>);

}