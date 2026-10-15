import type { LatLng, PlanFeature } from '../types/plan';

const EARTH_RADIUS = 6378137;

const toRad = (deg: number) => deg * Math.PI / 180;

export function distance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
}

export function pathLength(coords: LatLng[], closed = false): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) total += distance(coords[i - 1], coords[i]);
  if (closed && coords.length > 2) total += distance(coords[coords.length - 1], coords[0]);
  return total;
}

export function polygonArea(coords: LatLng[]): number {
  if (coords.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[(i + 1) % coords.length];
    total += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  return Math.abs(total * EARTH_RADIUS * EARTH_RADIUS / 2);
}

export function centroid(coords: LatLng[]): LatLng {
  const sum = coords.reduce<LatLng>((acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng], [0, 0]);
  return [sum[0] / coords.length, sum[1] / coords.length];
}

/**
 * Calculates the bounding box containing all features: [[minLat, minLng], [maxLat, maxLng]]
 */
export function getFeaturesBounds(features: PlanFeature[]): [LatLng, LatLng] | null {
  if (!features || features.length === 0) return null;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  let count = 0;

  for (const feature of features) {
    if (!feature.coords || feature.coords.length === 0) continue;
    for (const [lat, lng] of feature.coords) {
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) continue;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      count++;
    }
  }

  if (count === 0) return null;
  return [
    [round6(minLat), round6(minLng)],
    [round6(maxLat), round6(maxLng)]
  ];
}

/**
 * Calculates the geometric center (midpoint of the bounding box) of all drawn elements.
 * Returns [centerLat, centerLng] or null if no elements.
 */
export function getFeaturesGeometricCenter(features: PlanFeature[]): LatLng | null {
  const bounds = getFeaturesBounds(features);
  if (!bounds) return null;
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  return [
    round6((minLat + maxLat) / 2),
    round6((minLng + maxLng) / 2)
  ];
}

/**
 * Calculates an optimal initial zoom level to frame a given bounding box.
 */
export function getOptimalZoomForBounds(bounds: [LatLng, LatLng]): number {
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  const dLat = Math.abs(maxLat - minLat);
  const dLng = Math.abs(maxLng - minLng);
  const maxSpan = Math.max(dLat, dLng);

  if (maxSpan === 0) return 18;
  if (maxSpan < 0.0015) return 18;
  if (maxSpan < 0.0035) return 17.5;
  if (maxSpan < 0.008) return 16.5;
  if (maxSpan < 0.018) return 15.5;
  if (maxSpan < 0.04) return 14.5;
  if (maxSpan < 0.08) return 13.5;
  if (maxSpan < 0.16) return 12.5;
  if (maxSpan < 0.32) return 11.5;
  return 10.5;
}

export function translate(coords: LatLng[], dLat: number, dLng: number): LatLng[] {
  return coords.map(([lat, lng]) => [lat + dLat, lng + dLng]);
}

export function rectFromCorners(a: LatLng, b: LatLng): LatLng[] {
  return [
  [a[0], a[1]],
  [a[0], b[1]],
  [b[0], b[1]],
  [b[0], a[1]]];

}

export function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export function formatArea(m2: number): string {
  if (m2 >= 10000) {
    return `${(m2 / 10000).toLocaleString('en-US', { maximumFractionDigits: m2 >= 100000 ? 1 : 2 })} ha`;
  }
  return `${Math.round(m2).toLocaleString('en-US')} m²`;
}

export function formatLength(m: number): string {
  if (m >= 1000) return `${(m / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 })} km`;
  return `${Math.round(m).toLocaleString('en-US')} m`;
}

export function formatCoords([lat, lng]: LatLng): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function measureFeature(feature: PlanFeature): {primary: string;secondary?: string;} {
  if (feature.kind === 'area') {
    return {
      primary: formatArea(polygonArea(feature.coords)),
      secondary: `Perimeter ${formatLength(pathLength(feature.coords, true))}`
    };
  }
  if (feature.kind === 'line') {
    return { primary: formatLength(pathLength(feature.coords)), secondary: `${feature.coords.length} points` };
  }
  return { primary: formatCoords(feature.coords[0]) };
}

/**
 * Calculates the geographic point located at 50% along a polyline's total distance.
 */
export function polylineMidpoint(coords: LatLng[]): LatLng {
  if (!coords || coords.length === 0) return [0, 0];
  if (coords.length === 1) return coords[0];
  const total = pathLength(coords);
  if (total === 0) return coords[0];
  const target = total / 2;
  let acc = 0;
  for (let i = 1; i < coords.length; i++) {
    const segLen = distance(coords[i - 1], coords[i]);
    if (acc + segLen >= target) {
      const ratio = segLen > 0 ? (target - acc) / segLen : 0;
      const lat = coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * ratio;
      const lng = coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * ratio;
      return [round6(lat), round6(lng)];
    }
    acc += segLen;
  }
  return coords[Math.floor(coords.length / 2)];
}