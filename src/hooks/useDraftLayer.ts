import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import type { MapCallbacks } from '../types/map';
import type { LatLng, Tool } from '../types/plan';

/** Renders the in-progress shape while the user is drawing. */
export function useDraftLayer(
map: L.Map | null,
tool: Tool,
draft: LatLng[],
color: string,
callbacks: MutableRefObject<MapCallbacks>)
: void {
  useEffect(() => {
    if (!map || tool === 'select' || tool === 'point' || draft.length === 0) return;

    const group = L.layerGroup().addTo(map);
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
      onMove = (e) => rect.setBounds(L.latLngBounds(corner, e.latlng));
    } else {
      const closing = tool === 'area';
      if (closing && draft.length >= 3) L.polygon(draft, shapeStyle).addTo(group);else
      L.polyline(draft, { ...shapeStyle, fill: false }).addTo(group);

      const last = draft[draft.length - 1];
      const rubber = L.polyline([last, last], {
        color,
        weight: 2,
        dashArray: '2 6',
        opacity: 0.9,
        interactive: false
      }).addTo(group);
      onMove = (e) => {
        const cursor: L.LatLngExpression = e.latlng;
        rubber.setLatLngs(closing && draft.length >= 2 ? [last, cursor, draft[0]] : [last, cursor]);
      };

      const canClose = closing && draft.length >= 3;
      const canEnd = !closing && draft.length >= 2;
      draft.forEach((point, i) => {
        const finisher = canClose && i === 0 || canEnd && i === draft.length - 1;
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
          marker.bindTooltip(closing ? 'Close shape' : 'Finish path', { direction: 'top', offset: [0, -8] });
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
    };
  }, [map, tool, draft, color, callbacks]);
}