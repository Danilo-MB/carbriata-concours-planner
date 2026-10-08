import React, { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import { tiltedContainerPoint } from '../../utils/mapTilt';
import { useBasemap } from '../../hooks/useBasemap';
import { useDraftLayer } from '../../hooks/useDraftLayer';
import { useEditHandles } from '../../hooks/useEditHandles';
import { useFeatureLayers } from '../../hooks/useFeatureLayers';
import { usePointClusters } from '../../hooks/usePointClusters';
import { useLatestRef } from '../../hooks/useLatestRef';
import type { MapCallbacks } from '../../types/map';
import type { Basemap, Category, LatLng, MapView, PlanFeature, Tool } from '../../types/plan';

interface MapCanvasProps {
  mapRef: MutableRefObject<L.Map | null>;
  initialView: MapView;
  basemap: Basemap;
  features: PlanFeature[];
  categories: Category[];
  selectedId: string | null;
  tool: Tool;
  tilted: boolean;
  draft: LatLng[];
  draftColor: string;
  onSelect: (id: string | null) => void;
  onMapClick: (point: LatLng) => void;
  onFinishDraft: () => void;
  onGeometryChange: (id: string, coords: LatLng[]) => void;
  onDelete: (id: string) => void;
}

export function MapCanvas({
  mapRef,
  initialView,
  basemap,
  features,
  categories,
  selectedId,
  tool,
  tilted,
  draft,
  draftColor,
  onSelect,
  onMapClick,
  onFinishDraft,
  onGeometryChange,
  onDelete
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialViewRef = useRef(initialView);
  const [map, setMap] = useState<L.Map | null>(null);
  const callbacks = useLatestRef<MapCallbacks>({ tool, onSelect, onMapClick, onFinishDraft, onGeometryChange, onDelete });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { lat, lng, zoom } = initialViewRef.current;
    const instance = L.map(el, { center: [lat, lng], zoom, zoomControl: false, maxZoom: 21, minZoom: 3, zoomSnap: 0.5 });
    instance.attributionControl.setPrefix(false);

    instance.mouseEventToContainerPoint = (event: MouseEvent) => {
      if (getComputedStyle(el).transform === 'none') {
        return L.Map.prototype.mouseEventToContainerPoint.call(instance, event);
      }
      const point = tiltedContainerPoint(el, event.clientX, event.clientY);
      return L.point(point.x, point.y);
    };

    const updateLabels = () => el.classList.toggle('labels-hidden', instance.getZoom() < 15);
    instance.on('zoomend', updateLabels);
    updateLabels();

    instance.on('click', (e: L.LeafletMouseEvent) => {
      const cb = callbacks.current;
      if (cb.tool === 'select') cb.onSelect(null);else
      cb.onMapClick([e.latlng.lat, e.latlng.lng]);
    });

    const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
    observer.observe(el);

    mapRef.current = instance;
    setMap(instance);
    return () => {
      observer.disconnect();
      instance.remove();
      mapRef.current = null;
    };
  }, [callbacks, mapRef]);

  useEffect(() => {
    containerRef.current?.classList.toggle('is-tilted', tilted);
  }, [tilted]);

  useEffect(() => {
    if (!map) return;
    const drawing = tool !== 'select';
    map.getContainer().classList.toggle('is-drawing', drawing);
    if (drawing) map.doubleClickZoom.disable();else
    map.doubleClickZoom.enable();
  }, [map, tool]);

  useBasemap(map, basemap);
  const getLayer = useFeatureLayers(map, features, categories, selectedId, tool, callbacks);
  usePointClusters(map, features, categories, selectedId, tool, callbacks);
  const selectedFeature = features.find((f) => f.id === selectedId) ?? null;
  useEditHandles(map, selectedFeature, tool === 'select', getLayer, callbacks);
  useDraftLayer(map, tool, draft, draftColor, callbacks);

  return <div ref={containerRef} className="isolate h-full w-full" role="application" aria-label="Plan map" />;
}