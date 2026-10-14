import React from 'react';
import { ChevronUpIcon, ExternalLinkIcon, EyeIcon, FootprintsIcon, GlobeIcon } from 'lucide-react';
import { measureFeature } from '../../utils/geo';
import { fallbackCategory } from '../../utils/plan';
import { hasStreetViewPhotos } from '../../data/streetViewSamples';
import { ElementDetails } from './ElementDetails';
import { VisitorElementDetails } from './VisitorElementDetails';
import { ElementList } from './ElementList';
import { LayerSwatch } from './LayerSwatch';
import { PlanSettings } from './PlanSettings';
import { useLanguage } from '../../contexts/LanguageContext';
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
  onRename: (patch: Partial<Pick<Project, 'name' | 'location' | 'description' | 'websiteUrl'>>) => void;
  onOpenStreetView?: (feature: PlanFeature, initialIndex?: number) => void;
}

export function SidePanel({
  project,
  editor,
  onSelectFromList,
  onZoomTo,
  onSaveCenter,
  onGoToCenter,
  onExport,
  onRename,
  onOpenStreetView
}: SidePanelProps) {
  const { t } = useLanguage();
  const { selected, sheetOpen, setSheetOpen, mode } = editor;
  const selectedCategory = selected ? project.categories.find((c) => c.id === selected.categoryId) : undefined;

  const tabs: { id: PanelView; label: string }[] = [
    { id: 'elements', label: t('elements') },
    { id: 'plan', label: t('planAndLayers') }
  ];

  return (
    <aside
      aria-label={t('planAndLayers')}
      className={`relative z-10 flex shrink-0 flex-col border-t border-line bg-surface transition-[height] duration-300 ease-snappy lg:h-auto lg:w-[380px] lg:border-l lg:border-t-0 ${
        sheetOpen ? 'h-[58dvh]' : 'h-[68px]'
      }`}>
      {/* Mobile Collapsible Peek Header */}
      <button
        type="button"
        onClick={() => setSheetOpen(!sheetOpen)}
        aria-expanded={sheetOpen}
        className="relative flex h-[68px] shrink-0 items-center gap-3 px-4 text-left lg:hidden">
        <span aria-hidden className="absolute left-1/2 top-1.5 h-1 w-9 -translate-x-1/2 rounded-full bg-line" />
        {selected ? (
          <>
            {selectedCategory && <LayerSwatch category={selectedCategory} />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{selected.name || t('untitled')}</span>
              <span className="block truncate text-xs tabular-nums text-muted">{measureFeature(selected).primary}</span>
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink">
              {project.features.length} {project.features.length === 1 ? t('point') : t('elements').toLowerCase()}
            </span>
            <span className="block text-xs text-muted">
              {mode === 'visitor' ? t('visitorModeSub') : `${project.categories.length} ${t('layersCountSub')}`}
            </span>
          </span>
        )}
        <ChevronUpIcon
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ease-snappy ${sheetOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Panel Scrollable Body */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {selected ? (
          mode === 'visitor' ? (
            <VisitorElementDetails
              key={selected.id}
              feature={selected}
              category={selectedCategory || fallbackCategory}
              onBack={() => editor.select(null)}
              onZoomTo={() => onZoomTo(selected)}
              onSwitchToEditor={() => editor.setMode('editor')}
              onOpenStreetView={(idx) => onOpenStreetView?.(selected, idx)}
            />
          ) : (
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
              onDelete={() => editor.deleteFeature(selected.id)}
              onOpenStreetView={(idx) => onOpenStreetView?.(selected, idx)}
            />
          )
        ) : mode === 'visitor' ? (
          <>
            <div className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-ink">{t('placesAndPOIs')}</h2>
                  <p className="text-xs text-muted">{t('visitorHint')}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <EyeIcon className="h-3 w-3" />
                  {t('visitorBadge')}
                </span>
              </div>
            </div>

            {/* Official Website Banner if configured */}
            {project.websiteUrl && (
              <div className="border-b border-line bg-subtle/30 px-4 py-2.5">
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle">
                  <span className="flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span>{t('visitOfficialWebsite')}</span>
                  </span>
                  <ExternalLinkIcon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                </a>
              </div>
            )}

            {/* Street View Virtual Tours Banner in Visitor Mode */}
            {(() => {
              const streetViewRoutes = project.features.filter((f) => f.kind === 'line' && hasStreetViewPhotos(f));
              if (streetViewRoutes.length === 0 || !onOpenStreetView) return null;
              return (
                <div className="border-b border-line bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-black shadow-md">
                        <FootprintsIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-bold text-ink">
                          Paseo Street View 360
                        </h3>
                        <p className="truncate text-[11px] text-muted">
                          {streetViewRoutes.length} {streetViewRoutes.length === 1 ? 'recorrido interactivo' : 'recorridos interactivos'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenStreetView(streetViewRoutes[0], 0)}
                      className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black shadow-sm hover:bg-amber-400 active:scale-95 transition-all"
                    >
                      Caminar →
                    </button>
                  </div>
                </div>
              );
            })()}

            <ElementList
              project={project}
              readOnly={true}
              onSelect={onSelectFromList}
              onToggleLayer={editor.toggleLayer}
              onOpenStreetView={onOpenStreetView}
            />
          </>
        ) : (
          <>
            <div className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-3">
              <div role="tablist" aria-label="Secciones del panel" className="grid grid-cols-2 rounded-lg bg-subtle p-1">
                {tabs.map((tTab) => {
                  const active = editor.panel === tTab.id;
                  return (
                    <button
                      key={tTab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => editor.setPanel(tTab.id)}
                      className={`h-8 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 ${
                        active ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                      }`}>
                      {tTab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div role="tabpanel">
              {editor.panel === 'elements' ? (
                <ElementList
                  project={project}
                  onSelect={onSelectFromList}
                  onToggleLayer={editor.toggleLayer}
                  onDelete={editor.deleteFeature}
                  onOpenStreetView={onOpenStreetView}
                />
              ) : (
                <PlanSettings
                  project={project}
                  editor={editor}
                  onRename={onRename}
                  onSaveCenter={onSaveCenter}
                  onGoToCenter={onGoToCenter}
                  onExport={onExport}
                />
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}