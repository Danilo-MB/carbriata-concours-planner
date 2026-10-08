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