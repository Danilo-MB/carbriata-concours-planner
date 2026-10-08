import React, { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type L from 'leaflet';
import { useProjects } from '../../contexts/ProjectsContext';
import { useEditor } from '../../hooks/useEditor';
import { downloadTextFile, geojsonFileName, toGeoJSON } from '../../utils/geojson';
import { goToPlace, goToView, readView, zoomToFeature } from '../../utils/mapNavigation';
import { pickCategory } from '../../utils/plan';
import { DrawingBar } from './DrawingBar';
import { EditorHeader } from './EditorHeader';
import { EditorToolbar } from './EditorToolbar';
import { MapCanvas } from './MapCanvas';
import { MapControls } from './MapControls';
import { SidePanel } from './SidePanel';
import type { FeatureKind, PlaceResult, PlanFeature, Project } from '../../types/plan';

export function PlanEditor({ project }: {project: Project;}) {
  const { updateProject } = useProjects();
  const update = useCallback((fn: (p: Project) => Project) => updateProject(project.id, fn), [project.id, updateProject]);
  const editor = useEditor(project, update);
  const mapRef = useRef<L.Map | null>(null);
  const [tilted, setTilted] = useState(false);

  const draftKind: FeatureKind = editor.tool === 'line' ? 'line' : editor.tool === 'point' ? 'point' : 'area';
  const draftColor = pickCategory(project.categories, draftKind).color;

  const withMap = (fn: (map: L.Map) => void) => {
    if (mapRef.current) fn(mapRef.current);
  };

  const handleSelectFromList = (id: string) => {
    const feature = project.features.find((f) => f.id === id);
    if (!feature) return;
    if (project.hiddenCategoryIds.includes(feature.categoryId)) editor.toggleLayer(feature.categoryId);
    editor.select(id);
    withMap((m) => zoomToFeature(m, feature));
  };

  const handleZoomTo = (feature: PlanFeature) => withMap((m) => zoomToFeature(m, feature));
  const handleSaveCenter = () => withMap((m) => editor.saveCenter(readView(m)));
  const handleGoToCenter = () => withMap((m) => goToView(m, project.center));
  const handlePickPlace = (place: PlaceResult) => withMap((m) => goToPlace(m, place));

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error('Location isn’t available on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => withMap((m) => m.setView([pos.coords.latitude, pos.coords.longitude], 18)),
      () => toast.error('Couldn’t get your location', { description: 'Check that location access is allowed.' }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleExport = () => {
    downloadTextFile(geojsonFileName(project), JSON.stringify(toGeoJSON(project), null, 2), 'application/geo+json');
    toast.success('GeoJSON downloaded');
  };

  const handleRename = (patch: Partial<Pick<Project, 'name' | 'location' | 'description'>>) =>
  update((p) => ({ ...p, ...patch }));

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-canvas">
      <EditorHeader project={project} onPickPlace={handlePickPlace} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative min-h-0 flex-1 overflow-hidden">
          <MapCanvas
            mapRef={mapRef}
            initialView={project.center}
            basemap={project.basemap}
            features={editor.visibleFeatures}
            categories={project.categories}
            selectedId={editor.selectedId}
            tool={editor.tool}
            tilted={tilted}
            draft={editor.draft}
            draftColor={draftColor}
            onSelect={editor.select}
            onMapClick={editor.handleMapClick}
            onFinishDraft={editor.finishDraft}
            onGeometryChange={editor.setGeometry}
            onDelete={editor.deleteFeature} />
          
          <AnimatePresence>
            {editor.tool !== 'select' &&
            <DrawingBar
              key="drawing-bar"
              tool={editor.tool}
              pointCount={editor.draft.length}
              canFinish={editor.canFinish}
              onUndo={editor.undoDraftPoint}
              onCancel={editor.cancelDraft}
              onFinish={editor.finishDraft} />

            }
          </AnimatePresence>
          <MapControls
            basemap={project.basemap}
            canDelete={editor.tool === 'select' && !!editor.selected}
            onZoomIn={() => withMap((m) => m.zoomIn())}
            onZoomOut={() => withMap((m) => m.zoomOut())}
            onGoToCenter={handleGoToCenter}
            onSaveCenter={handleSaveCenter}
            onLocate={handleLocate}
            onBasemap={editor.setBasemap}
            tilted={tilted}
            onToggleTilt={() => setTilted((value) => !value)}
            onDelete={() => editor.selected && editor.deleteFeature(editor.selected.id)} />
          
          <EditorToolbar tool={editor.tool} onChange={editor.setTool} />
        </main>
        <SidePanel
          project={project}
          editor={editor}
          onSelectFromList={handleSelectFromList}
          onZoomTo={handleZoomTo}
          onSaveCenter={handleSaveCenter}
          onGoToCenter={handleGoToCenter}
          onExport={handleExport}
          onRename={handleRename} />
        
      </div>
    </div>);

}