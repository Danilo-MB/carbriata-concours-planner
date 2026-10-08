import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import { centroid, distance, pathLength, polygonArea, rectFromCorners } from '../utils/geo';
import { areaDimensionIcon, computeEdgeMetrics, edgeDimensionIcon } from '../utils/dimensions';
import type { MapCallbacks } from '../types/map';
import type { LatLng, Tool } from '../types/plan';

/** Renders the in-progress shape and live dimensions while the user is drawing. */
export function useDraftLayer(
  map: L.Map | null,
  tool: Tool,
  draft: LatLng[],
  color: string,
  callbacks: MutableRefObject<MapCallbacks>
): void {
  useEffect(() => {
    if (!map || tool === 'select' || tool === 'point' || draft.length === 0) return;

    const group = L.layerGroup().addTo(map);
    const dimGroup = L.layerGroup().addTo(map);

    const shapeStyle: L.PathOptions = {
      color,
      weight: 2.5,
      dashArray: '6 6',
      fillColor: color,
      fillOpacity: 0.18,
      interactive: false
    };

    let onMove: (e: L.LeafletMouseEvent) => void = () => undefined;

    if (tool === 'rectangle') {
      const corner = L.latLng(draft[0][0], draft[0][1]);
      const rect = L.rectangle(L.latLngBounds(corner, corner), shapeStyle).addTo(group);
      L.circleMarker(corner, {
        radius: 6,
        color: '#fff',
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
        interactive: false
      }).addTo(group);

      const edgeMarkers: L.Marker[] = [];
      let areaMarker: L.Marker | null = null;

      onMove = (e) => {
        rect.setBounds(L.latLngBounds(corner, e.latlng));
        const corners = rectFromCorners([corner.lat, corner.lng], [e.latlng.lat, e.latlng.lng]);
        const edges = computeEdgeMetrics(corners, true);

        edges.forEach((edge, idx) => {
          if (!edgeMarkers[idx]) {
            edgeMarkers[idx] = L.marker(edge.mid, {
              icon: edgeDimensionIcon(edge.length),
              interactive: false,
              zIndexOffset: 850
            }).addTo(dimGroup);
          } else {
            edgeMarkers[idx].setLatLng(edge.mid);
            edgeMarkers[idx].setIcon(edgeDimensionIcon(edge.length));
          }
        });
      };
    } else {
      const closing = tool === 'area';
      if (closing && draft.length >= 3) L.polygon(draft, shapeStyle).addTo(group);
      else L.polyline(draft, { ...shapeStyle, fill: false }).addTo(group);

      // Render dimensions for already committed edges
      const committedEdges = computeEdgeMetrics(draft, false);
      committedEdges.forEach((edge) => {
        L.marker(edge.mid, {
          icon: edgeDimensionIcon(edge.length),
          interactive: false,
          zIndexOffset: 850
        }).addTo(dimGroup);
      });

      const last = draft[draft.length - 1];
      const rubber = L.polyline([last, last], {
        color,
        weight: 2,
        dashArray: '2 6',
        opacity: 0.9,
        interactive: false
      }).addTo(group);

      // Dynamic markers for the active rubber-band segments
      const rubberEdgeMarker1 = L.marker(last, {
        icon: edgeDimensionIcon(0),
        interactive: false,
        zIndexOffset: 855
      }).addTo(dimGroup);

      let rubberEdgeMarker2: L.Marker | null = null;
      let draftAreaMarker: L.Marker | null = null;

      if (closing && draft.length >= 2) {
        rubberEdgeMarker2 = L.marker(draft[0], {
          icon: edgeDimensionIcon(0),
          interactive: false,
          zIndexOffset: 855
        }).addTo(dimGroup);
      }

      onMove = (e) => {
        const cursor: L.LatLng = e.latlng;
        rubber.setLatLngs(closing && draft.length >= 2 ? [last, cursor, draft[0]] : [last, cursor]);

        // Update rubber band distance to cursor
        const d1 = distance(last, [cursor.lat, cursor.lng]);
        const mid1: LatLng = [(last[0] + cursor.lat) / 2, (last[1] + cursor.lng) / 2];
        rubberEdgeMarker1.setLatLng(mid1);
        rubberEdgeMarker1.setIcon(edgeDimensionIcon(d1));

        // If closing shape, update closing distance and candidate area
        if (closing && draft.length >= 2) {
          const first = draft[0];
          const d2 = distance([cursor.lat, cursor.lng], first);
          const mid2: LatLng = [(cursor.lat + first[0]) / 2, (cursor.lng + first[1]) / 2];
          if (rubberEdgeMarker2) {
            rubberEdgeMarker2.setLatLng(mid2);
            rubberEdgeMarker2.setIcon(edgeDimensionIcon(d2));
          }
        }
      };

      const canClose = closing && draft.length >= 3;
      const canEnd = !closing && draft.length >= 2;
      draft.forEach((point, i) => {
        const finisher = (canClose && i === 0) || (canEnd && i === draft.length - 1);
        const marker = L.circleMarker(point, {
          radius: finisher ? 9 : 5,
          color: '#fff',
          weight: 2,
          fillColor: color,
          fillOpacity: 1,
          interactive: finisher,
          bubblingMouseEvents: false
        }).addTo(group);

        if (finisher) {
          marker.bindTooltip(closing ? 'Cerrar figura' : 'Terminar recorrido', {
            direction: 'top',
            offset: [0, -8]
          });
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            callbacks.current.onFinishDraft();
          });
        }
      });
    }

    map.on('mousemove', onMove);
    return () => {
      map.off('mousemove', onMove);
      group.remove();
      dimGroup.remove();
    };
  }, [map, tool, draft, color, callbacks]);
}