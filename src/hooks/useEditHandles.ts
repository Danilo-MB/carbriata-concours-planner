import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import { centroid, pathLength, polygonArea, translate } from '../utils/geo';
import { areaDimensionIcon, computeEdgeMetrics, edgeDimensionIcon } from '../utils/dimensions';
import { midIcon, moveIcon, vertexIcon } from '../utils/mapIcons';
import { isTrashHot } from '../utils/trashTarget';
import type { MapCallbacks } from '../types/map';
import type { LatLng, PlanFeature } from '../types/plan';

/**
 * Shows draggable handles for the selected area or path:
 * vertices (reshape), midpoints (add a vertex) and a center handle (move all).
 */
export function useEditHandles(
map: L.Map | null,
feature: PlanFeature | null,
enabled: boolean,
getLayer: (id: string) => L.Layer | undefined,
callbacks: MutableRefObject<MapCallbacks>)
: void {
  const featureId = feature?.id ?? null;
  const kind = feature?.kind ?? null;
  const sig = feature ? JSON.stringify(feature.coords) : '';

  useEffect(() => {
    if (!map || !featureId || !enabled || kind === null || kind === 'point') return;

    const closed = kind === 'area';
    const minPoints = closed ? 3 : 2;
    let work: LatLng[] = (JSON.parse(sig) as LatLng[]).map(([a, b]) => [a, b]);
    const group = L.layerGroup().addTo(map);
    const vertices: L.Marker[] = [];
    const mids: L.Marker[] = [];
    const edgeMarkers: L.Marker[] = [];
    let areaMarker: L.Marker | null = null;

    const apply = () => {
      const layer = getLayer(featureId);
      if (layer instanceof L.Polyline) layer.setLatLngs(work);
    };
    const commit = () => callbacks.current.onGeometryChange(featureId, work.map(([a, b]) => [a, b] as LatLng));
    const setVisible = (markers: L.Marker[], visible: boolean) => markers.forEach((m) => m.setOpacity(visible ? 1 : 0));

    const updateDimensions = () => {
      // 1. Edges / sides
      const edges = computeEdgeMetrics(work, closed);
      while (edgeMarkers.length > edges.length) {
        const m = edgeMarkers.pop();
        m?.remove();
      }
      edges.forEach((edge, idx) => {
        if (!edgeMarkers[idx]) {
          const marker = L.marker(edge.mid, {
            icon: edgeDimensionIcon(edge.length),
            interactive: false,
            keyboard: false,
            zIndexOffset: 850
          }).addTo(group);
          edgeMarkers[idx] = marker;
        } else {
          edgeMarkers[idx].setLatLng(edge.mid);
          edgeMarkers[idx].setIcon(edgeDimensionIcon(edge.length));
        }
      });

      // 2. Central Area (for closed figures)
      if (closed && work.length >= 3) {
        const area = polygonArea(work);
        const perim = pathLength(work, true);
        const center = centroid(work);
        if (!areaMarker) {
          areaMarker = L.marker(center, {
            icon: areaDimensionIcon(area, perim),
            interactive: false,
            keyboard: false,
            zIndexOffset: 860
          }).addTo(group);
        } else {
          areaMarker.setLatLng(center);
          areaMarker.setIcon(areaDimensionIcon(area, perim));
        }
      } else if (areaMarker) {
        areaMarker.remove();
        areaMarker = null;
      }
    };

    const moveHandle = L.marker(centroid(work), {
      icon: moveIcon,
      draggable: true,
      keyboard: false,
      zIndexOffset: 1200,
      title: 'Arrastra para mover toda la figura'
    });

    const restore = () => {
      setVisible(vertices, true);
      setVisible(mids, true);
      setVisible(edgeMarkers, true);
      if (areaMarker) areaMarker.setOpacity(1);
      moveHandle.setOpacity(1);
      moveHandle.setLatLng(centroid(work));
      // Sync mids
      const segs = closed ? work.length : work.length - 1;
      for (let s = 0; s < segs && s < mids.length; s++) {
        const a = work[s];
        const b = work[(s + 1) % work.length];
        mids[s].setLatLng([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      }
      updateDimensions();
    };

    work.forEach((point, index) => {
      const marker = L.marker(point, { icon: vertexIcon, draggable: true, keyboard: false, zIndexOffset: 1000 });
      marker.on('dragstart', () => {
        setVisible(mids, false);
        moveHandle.setOpacity(0);
      });
      marker.on('drag', () => {
        const ll = marker.getLatLng();
        work[index] = [ll.lat, ll.lng];
        apply();
        updateDimensions();
      });
      marker.on('dragend', () => {
        restore();
        if (isTrashHot()) callbacks.current.onDelete(featureId);else
        commit();
      });
      const removePoint = (e: L.LeafletEvent) => {
        L.DomEvent.stopPropagation(e);
        const original = (e as L.LeafletMouseEvent).originalEvent;
        if (original) L.DomEvent.preventDefault(original);
        if (work.length <= minPoints) return;
        work = work.filter((_, i) => i !== index);
        apply();
        updateDimensions();
        commit();
      };
      marker.on('dblclick', removePoint);
      marker.on('contextmenu', removePoint);
      marker.addTo(group);
      vertices.push(marker);
    });

    const segments = closed ? work.length : work.length - 1;
    for (let i = 0; i < segments; i++) {
      const a = work[i];
      const b = work[(i + 1) % work.length];
      const mid = L.marker([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], {
        icon: midIcon,
        draggable: true,
        keyboard: false,
        zIndexOffset: 900,
        title: 'Arrastra para añadir un vértice'
      });
      let base: LatLng[] = [];
      mid.on('dragstart', () => {
        base = work.slice();
        setVisible(mids, false);
        mid.setOpacity(1);
        moveHandle.setOpacity(0);
      });
      mid.on('drag', () => {
        const ll = mid.getLatLng();
        work = [...base.slice(0, i + 1), [ll.lat, ll.lng], ...base.slice(i + 1)];
        apply();
        updateDimensions();
      });
      mid.on('dragend', () => {
        restore();
        if (isTrashHot()) callbacks.current.onDelete(featureId);else
        commit();
      });
      mid.addTo(group);
      mids.push(mid);
    }

    let start: L.LatLng | null = null;
    let base: LatLng[] = [];
    moveHandle.on('dragstart', () => {
      start = moveHandle.getLatLng();
      base = work.slice();
      setVisible(vertices, false);
      setVisible(mids, false);
    });
    moveHandle.on('drag', () => {
      if (!start) return;
      const ll = moveHandle.getLatLng();
      work = translate(base, ll.lat - start.lat, ll.lng - start.lng);
      apply();
      updateDimensions();
    });
    moveHandle.on('dragend', () => {
      restore();
      if (isTrashHot()) callbacks.current.onDelete(featureId);else
      commit();
    });
    moveHandle.addTo(group);

    // Initial dimension display
    updateDimensions();

    return () => {
      group.remove();
    };
  }, [map, featureId, kind, sig, enabled, getLayer, callbacks]);
}