import React from 'react';
import { drawingTools } from '../../data/tools';
import type { Tool } from '../../types/plan';

interface EditorToolbarProps {
  tool: Tool;
  onChange: (tool: Tool) => void;
}

export function EditorToolbar({ tool, onChange }: EditorToolbarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-3">
      <div role="toolbar" aria-label="Drawing tools" className="pointer-events-auto flex gap-1 rounded-2xl bg-surface p-1.5 shadow-float">
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
              className={`flex min-w-[58px] flex-col items-center gap-0.5 whitespace-nowrap rounded-xl px-2 py-1.5 text-[11px] font-medium transition-[background-color,color,transform] duration-150 ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:min-w-[68px] ${
              active ? 'bg-ink text-on-ink' : 'text-ink hover:bg-subtle'}`
              }>
              
              <Icon className="h-5 w-5" aria-hidden />
              {t.label}
            </button>);

        })}
      </div>
    </div>);

}