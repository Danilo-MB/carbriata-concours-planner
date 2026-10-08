import L from 'leaflet';
import { centroid, distance, formatArea, formatLength, pathLength, polygonArea } from './geo';
import type { LatLng } from '../types/plan';

export function formatMetricDistance(m: number): string {
  if (!Number.isFinite(m) || m < 0.05) return '0 m';
  if (m < 10) return `${m.toFixed(1)} m`;
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 })} km`;
}

export function edgeDimensionIcon(lengthMeters: number): L.DivIcon {
  const text = formatMetricDistance(lengthMeters);
  return L.divIcon({
    className: 'plan-dim-edge-wrap',
    html: `<div class="plan-dim-edge">${text}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

export function areaDimensionIcon(areaM2: number, perimeterMeters: number): L.DivIcon {
  const areaText = formatArea(areaM2);
  const perimText = formatLength(perimeterMeters);
  return L.divIcon({
    className: 'plan-dim-area-wrap',
    html: `<div class="plan-dim-area">
      <span class="plan-dim-area-val">${areaText}</span>
      <span class="plan-dim-area-sub">Perímetro: ${perimText}</span>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

export interface EdgeMetric {
  index: number;
  from: LatLng;
  to: LatLng;
  mid: LatLng;
  length: number;
  label: string;
}

export function computeEdgeMetrics(coords: LatLng[], closed: boolean): EdgeMetric[] {
  if (coords.length < 2) return [];
  const segments = closed ? coords.length : coords.length - 1;
  const metrics: EdgeMetric[] = [];
  for (let i = 0; i < segments; i++) {
    const from = coords[i];
    const to = coords[(i + 1) % coords.length];
    const len = distance(from, to);
    metrics.push({
      index: i,
      from,
      to,
      mid: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2],
      length: len,
      label: formatMetricDistance(len)
    });
  }
  return metrics;
}
