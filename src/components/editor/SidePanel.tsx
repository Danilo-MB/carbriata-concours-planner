import React from 'react';
import { ChevronUpIcon } from 'lucide-react';
import { measureFeature } from '../../utils/geo';
import { ElementDetails } from './ElementDetails';
import { ElementList } from './ElementList';
import { LayerSwatch } from './LayerSwatch';
import { PlanSettings } from './PlanSettings';
import type { Editor } from '../../hooks/useEditor';
import type { PanelView, PlanFeature, Project } from '../../types/plan';

interface SidePanelProps {
  project: Project;
  editor: Editor;
  onSelectFromList: (id: string) => void;
  onZoomTo: (feature: PlanFeature) => void;
  onSaveCenter: () => void;
  onGoToCenter: () => void;
  onExport: () => void;
  onRename: (patch: Partial<Pick<Project, 'name' | 'location' | 'description'>>) => void;
}

const tabs: {id: PanelView;label: string;}[] = [
{ id: 'elements', label: 'Elements' },
{ id: 'plan', label: 'Plan & layers' }];


export function SidePanel({ project, editor, onSelectFromList, onZoomTo, onSaveCenter, onGoToCenter, onExport, onRename }: SidePanelProps) {
  const { selected, sheetOpen, setSheetOpen } = editor;
  const selectedCategory = selected ? project.categories.find((c) => c.id === selected.categoryId) : undefined;

  return (
    <aside
      aria-label="Plan panel"
      className={`relative z-10 flex shrink-0 flex-col border-t border-line bg-surface transition-[height] duration-300 ease-snappy lg:h-auto lg:w-[380px] lg:border-l lg:border-t-0 ${
      sheetOpen ? 'h-[58dvh]' : 'h-[68px]'}`
      }>
      
      <button
        type="button"
        onClick={() => setSheetOpen(!sheetOpen)}
        aria-expanded={sheetOpen}
        className="relative flex h-[68px] shrink-0 items-center gap-3 px-4 text-left lg:hidden">
        
        <span aria-hidden className="absolute left-1/2 top-1.5 h-1 w-9 -translate-x-1/2 rounded-full bg-line" />
        {selected ?
        <>
            {selectedCategory && <LayerSwatch category={selectedCategory} />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{selected.name || 'Untitled'}</span>
              <span className="block truncate text-xs tabular-nums text-muted">{measureFeature(selected).primary}</span>
            </span>
          </> :

        <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink">
              {project.features.length} {project.features.length === 1 ? 'element' : 'elements'}
            </span>
            <span className="block text-xs text-muted">{project.categories.length} layers · tap to browse</span>
          </span>
        }
        <ChevronUpIcon
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ease-snappy ${sheetOpen ? 'rotate-180' : ''}`}
          aria-hidden />
        
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {selected ?
        <ElementDetails
          key={selected.id}
          feature={selected}
          categories={project.categories}
          autoFocus={editor.autoFocusId === selected.id}
          onAutoFocused={editor.clearAutoFocus}
          onBack={() => editor.select(null)}
          onChange={(patch) => editor.updateFeature(selected.id, patch)}
          onZoomTo={() => onZoomTo(selected)}
          onDuplicate={() => editor.duplicateFeature(selected.id)}
          onDelete={() => editor.deleteFeature(selected.id)} /> :


        <>
            <div className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-3">
              <div role="tablist" aria-label="Panel sections" className="grid grid-cols-2 rounded-lg bg-subtle p-1">
                {tabs.map((t) => {
                const active = editor.panel === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => editor.setPanel(t.id)}
                    className={`h-8 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 ${
                    active ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`
                    }>
                    
                      {t.label}
                    </button>);

              })}
              </div>
            </div>
            <div role="tabpanel">
              {editor.panel === 'elements' ?
            <ElementList project={project} onSelect={onSelectFromList} onToggleLayer={editor.toggleLayer} onDelete={editor.deleteFeature} /> :

            <PlanSettings
              project={project}
              editor={editor}
              onRename={onRename}
              onSaveCenter={onSaveCenter}
              onGoToCenter={onGoToCenter}
              onExport={onExport} />

            }
            </div>
          </>
        }
      </div>
    </aside>);

}