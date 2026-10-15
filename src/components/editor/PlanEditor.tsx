import React, { useState, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type L from 'leaflet';
import { useProjects } from '../../contexts/ProjectsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useEditor } from '../../hooks/useEditor';
import { downloadTextFile, geojsonFileName, toGeoJSON } from '../../utils/geojson';
import { formatArea, formatLength, getFeaturesBounds, getFeaturesGeometricCenter, getOptimalZoomForBounds, pathLength, polygonArea } from '../../utils/geo';
import { goToPlace, goToView, readView, zoomToFeature } from '../../utils/mapNavigation';
import { canExportGeoJSON, fallbackCategory, pickCategory } from '../../utils/plan';
import { ClearAllModal } from './ClearAllModal';
import { DrawingBar } from './DrawingBar';
import { EditorHeader } from './EditorHeader';
import { EmbedHeader } from './EmbedHeader';
import { VisitorHeader } from './VisitorHeader';
import { EditorToolbar } from './EditorToolbar';
import { MapCanvas } from './MapCanvas';
import { MapControls } from './MapControls';
import { SelectedDimensionBar } from './SelectedDimensionBar';
import { SidePanel } from './SidePanel';
import { RouteStreetViewPromptModal } from '../streetview/RouteStreetViewPromptModal';
import { StreetViewPlayer } from '../streetview/StreetViewPlayer';
import { generateSampleWaypointsForCoords, hasStreetViewPhotos } from '../../data/streetViewSamples';
import { FootprintsIcon } from 'lucide-react';
import type { FeatureKind, PlaceResult, PlanFeature, Project, ViewMode } from '../../types/plan';

interface PlanEditorProps {
  project: Project;
  initialMode?: ViewMode;
  isEmbed?: boolean;
  isVisitorOnly?: boolean;
}

export function PlanEditor({
  project,
  initialMode,
  isEmbed = false,
  isVisitorOnly = false
}: PlanEditorProps) {
  const effectiveInitialMode = isEmbed || isVisitorOnly ? 'visitor' : initialMode;
  const { user } = useAuth();
  const { updateProject } = useProjects();
  const update = useCallback((fn: (p: Project) => Project) => updateProject(project.id, fn), [project.id, updateProject]);
  const editor = useEditor(project, update, effectiveInitialMode);
  const mapRef = useRef<L.Map | null>(null);
  const [tilted, setTilted] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [streetViewFeature, setStreetViewFeature] = useState<PlanFeature | null>(null);
  const [streetViewInitialIndex, setStreetViewInitialIndex] = useState<number>(0);

  const handleOpenStreetView = useCallback((feature: PlanFeature, initialIndex = 0) => {
    setStreetViewFeature(feature);
    setStreetViewInitialIndex(initialIndex);
  }, []);

  const streetViewRoutes = useMemo(() => {
    return project.features.filter((f) => f.kind === 'line' && hasStreetViewPhotos(f));
  }, [project.features]);

  const draftKind: FeatureKind = editor.tool === 'line' ? 'line' : editor.tool === 'point' ? 'point' : 'area';
  const draftColor = pickCategory(project.categories, draftKind).color;

  const draftMetrics = useMemo(() => {
    if (editor.tool === 'area' && editor.draft.length >= 3) {
      return `${formatArea(polygonArea(editor.draft))} · Perím: ${formatLength(pathLength(editor.draft, true))}`;
    }
    if (editor.tool === 'line' && editor.draft.length >= 2) {
      return `Longitud: ${formatLength(pathLength(editor.draft))}`;
    }
    return undefined;
  }, [editor.tool, editor.draft]);

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
  const handleGoToCenter = () => withMap((m) => {
    if (project.features && project.features.length > 0) {
      const bounds = getFeaturesBounds(project.features);
      if (bounds) {
        m.fitBounds(bounds, { padding: [48, 48], maxZoom: 18.5, animate: true });
        return;
      }
    }
    goToView(m, project.center);
  });
  const handlePickPlace = (place: PlaceResult) => withMap((m) => goToPlace(m, place));

  const effectiveCenter = useMemo(() => {
    if (project.features && project.features.length > 0) {
      const geomCenter = getFeaturesGeometricCenter(project.features);
      const bounds = getFeaturesBounds(project.features);
      if (geomCenter) {
        return {
          lat: geomCenter[0],
          lng: geomCenter[1],
          zoom: bounds ? getOptimalZoomForBounds(bounds) : project.center.zoom
        };
      }
    }
    return project.center;
  }, [project.features, project.center]);

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
    if (!canExportGeoJSON(user)) {
      toast.error('La exportación de archivos GeoJSON está reservada para el plan PRO.');
      return;
    }
    downloadTextFile(geojsonFileName(project), JSON.stringify(toGeoJSON(project), null, 2), 'application/geo+json');
    toast.success('GeoJSON descargado');
  };

  const handleRename = (patch: Partial<Pick<Project, 'name' | 'location' | 'description' | 'websiteUrl'>>) =>
  update((p) => ({ ...p, ...patch }));

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-canvas">
      {isEmbed ? (
        <EmbedHeader project={project} />
      ) : isVisitorOnly ? (
        <VisitorHeader
          project={project}
          onPickPlace={handlePickPlace}
          onOpenStreetView={handleOpenStreetView}
        />
      ) : (
        <EditorHeader
          project={project}
          mode={editor.mode}
          onModeChange={editor.setMode}
          onPickPlace={handlePickPlace}
        />
      )}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative min-h-0 flex-1 overflow-hidden">
          <MapCanvas
            mapRef={mapRef}
            initialView={effectiveCenter}
            basemap={project.basemap}
            features={editor.visibleFeatures}
            categories={project.categories}
            selectedId={editor.selectedId}
            tool={editor.mode === 'visitor' ? 'select' : editor.tool}
            mode={editor.mode}
            tilted={tilted}
            draft={editor.mode === 'visitor' ? [] : editor.draft}
            draftColor={draftColor}
            onSelect={editor.select}
            onMapClick={editor.handleMapClick}
            onFinishDraft={editor.finishDraft}
            onGeometryChange={editor.setGeometry}
            onDelete={editor.deleteFeature}
          />

          {/* Floating Street View Pill on Map for 1-click exploration */}
          {streetViewRoutes.length > 0 && !editor.selected && (
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex">
              <button
                type="button"
                onClick={() => handleOpenStreetView(streetViewRoutes[0], 0)}
                className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-amber-400/50 bg-black/85 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-float backdrop-blur-md transition-all hover:bg-black hover:scale-105 active:scale-95"
              >
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-500 text-black shadow-sm">
                  <FootprintsIcon className="h-3.5 w-3.5" />
                </span>
                <span>Recorrido Virtual 360°</span>
              </button>
            </div>
          )}

          <AnimatePresence>
            {editor.mode === 'editor' && editor.tool !== 'select' && (
              <DrawingBar
                key="drawing-bar"
                tool={editor.tool}
                pointCount={editor.draft.length}
                draftMetrics={draftMetrics}
                canFinish={editor.canFinish}
                onUndo={editor.undoDraftPoint}
                onCancel={editor.cancelDraft}
                onFinish={editor.finishDraft}
              />
            )}

            {editor.selected && (editor.selected.kind === 'area' || editor.selected.kind === 'line') && (
              <SelectedDimensionBar
                key={`selected-dim-${editor.selected.id}`}
                feature={editor.selected}
                category={
                  project.categories.find((c) => c.id === editor.selected?.categoryId) ||
                  fallbackCategory
                }
                onDeselect={() => {
                  editor.select(null);
                  editor.setSheetOpen(false);
                }}
                onZoomTo={() => handleZoomTo(editor.selected!)}
                onOpenStreetView={
                  editor.selected.kind === 'line'
                    ? (idx) => handleOpenStreetView(editor.selected!, idx)
                    : undefined
                }
              />
            )}
          </AnimatePresence>

          <MapControls
            basemap={project.basemap}
            canDelete={editor.mode === 'editor' && editor.tool === 'select' && !!editor.selected}
            onZoomIn={() => withMap((m) => m.zoomIn())}
            onZoomOut={() => withMap((m) => m.zoomOut())}
            onGoToCenter={handleGoToCenter}
            onSaveCenter={handleSaveCenter}
            onLocate={handleLocate}
            onBasemap={editor.setBasemap}
            tilted={tilted}
            onToggleTilt={() => setTilted((value) => !value)}
            onDelete={() => editor.mode === 'editor' && editor.selected && editor.deleteFeature(editor.selected.id)}
          />

          {!isEmbed && !isVisitorOnly && editor.mode === 'editor' && (
            <div className={editor.sheetOpen ? 'hidden lg:block' : 'block'}>
              <EditorToolbar
                tool={editor.tool}
                onChange={editor.setTool}
                onClearAll={() => setShowClearAllModal(true)}
                hasFeatures={project.features.length > 0}
              />
            </div>
          )}
        </main>
        <SidePanel
          project={project}
          editor={editor}
          onSelectFromList={handleSelectFromList}
          onZoomTo={handleZoomTo}
          onSaveCenter={handleSaveCenter}
          onGoToCenter={handleGoToCenter}
          onExport={handleExport}
          onRename={handleRename}
          onOpenStreetView={handleOpenStreetView}
        />
      </div>

      <ClearAllModal
        isOpen={showClearAllModal}
        elementCount={project.features.length}
        onConfirm={editor.deleteAllFeatures}
        onClose={() => setShowClearAllModal(false)}
      />

      {/* Street View Prompt Modal after drawing a route */}
      <AnimatePresence>
        {editor.newlyCreatedRoute && (
          <RouteStreetViewPromptModal
            key="route-streetview-prompt"
            feature={editor.newlyCreatedRoute}
            onClose={() => editor.setNewlyCreatedRoute(null)}
            onApplySamplePhotos={() => {
              const route = editor.newlyCreatedRoute!;
              const samples = generateSampleWaypointsForCoords(route.coords.length, route);
              editor.updateFeature(route.id, { routeWaypoints: samples });
              editor.setNewlyCreatedRoute(null);
              handleOpenStreetView({ ...route, routeWaypoints: samples }, 0);
              toast.success('¡Fotos asignadas a tu recorrido virtual!');
            }}
            onOpenWaypointManager={() => {
              const route = editor.newlyCreatedRoute!;
              editor.setNewlyCreatedRoute(null);
              editor.select(route.id);
              editor.setSheetOpen(true);
            }}
          />
        )}

        {/* Full Interactive Street View Player */}
        {streetViewFeature && (
          <StreetViewPlayer
            key={`streetview-${streetViewFeature.id}`}
            feature={streetViewFeature}
            initialIndex={streetViewInitialIndex}
            onClose={() => setStreetViewFeature(null)}
            canEdit={editor.mode === 'editor' && !isVisitorOnly && !isEmbed}
            onUpdateWaypoint={(idx, patch) => {
              const currentWps = [...(streetViewFeature.routeWaypoints || [])];
              const existingIdx = currentWps.findIndex((w) => w.index === idx);
              if (existingIdx >= 0) {
                currentWps[existingIdx] = { ...currentWps[existingIdx], ...patch };
              } else {
                currentWps.push({ index: idx, title: `Punto ${idx + 1}`, ...patch });
              }
              editor.updateFeature(streetViewFeature.id, { routeWaypoints: currentWps });
              setStreetViewFeature((f) => (f ? { ...f, routeWaypoints: currentWps } : null));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}