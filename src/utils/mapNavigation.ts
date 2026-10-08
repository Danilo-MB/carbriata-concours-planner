import L from 'leaflet';
import { round6 } from './geo';
import type { MapView, PlaceResult, PlanFeature } from '../types/plan';

function shouldAnimate(): boolean {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function zoomToFeature(map: L.Map, feature: PlanFeature): void {
  const animate = shouldAnimate();
  if (feature.kind === 'point') {
    map.setView(feature.coords[0], Math.max(map.getZoom(), 18), { animate });
    return;
  }
  map.fitBounds(L.latLngBounds(feature.coords), { padding: [48, 48], maxZoom: 19, animate });
}

export function goToView(map: L.Map, view: MapView): void {
  map.setView([view.lat, view.lng], view.zoom, { animate: shouldAnimate() });
}

export function goToPlace(map: L.Map, place: PlaceResult): void {
  const animate = shouldAnimate();
  if (place.bounds) map.fitBounds(place.bounds, { maxZoom: 17, animate });else
  map.setView([place.lat, place.lng], 17, { animate });
}

export function readView(map: L.Map): MapView {
  const center = map.getCenter();
  return { lat: round6(center.lat), lng: round6(center.lng), zoom: Math.round(map.getZoom() * 2) / 2 };
}