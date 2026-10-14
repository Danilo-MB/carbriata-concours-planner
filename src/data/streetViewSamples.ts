import type { LatLng, PlanFeature, RouteWaypoint } from '../types/plan';

export interface SampleWaypointData {
  title: string;
  caption: string;
  image: string;
}

export const SAMPLE_STREETVIEW_WAYPOINTS: SampleWaypointData[] = [
  {
    title: 'Acceso y Entrada Principal',
    caption: 'Pórtico de bienvenida, control de acreditaciones y acceso peatonal al evento.',
    image: '/streetview/point1_entrance.jpg',
  },
  {
    title: 'Paseo Central Arbolado',
    caption: 'Avenida principal con jardines florales, cartelería digital y circulación fluida.',
    image: '/streetview/point2_promenade.jpg',
  },
  {
    title: 'Pabellón de Stands y Sponsors',
    caption: 'Pabellones modernos, carpas de exhibición, stands de marcas y demostraciones.',
    image: '/streetview/point3_stands.jpg',
  },
  {
    title: 'Patio Gastronómico & Food Trucks',
    caption: 'Pérgolas de madera con guirnaldas de luces, mesas al aire libre y variedad culinaria.',
    image: '/streetview/point4_foodcourt.jpg',
  },
  {
    title: 'Plaza Central & Escenario Principal',
    caption: 'Gran explanada verde para el público con escenario central y shows en vivo.',
    image: '/streetview/point5_plaza.jpg',
  },
];

/**
 * Returns waypoints filled with sample photos for a given number of coordinates.
 */
export function generateSampleWaypointsForCoords(coordsCount: number): RouteWaypoint[] {
  const waypoints: RouteWaypoint[] = [];
  const count = Math.max(coordsCount, 1);
  for (let i = 0; i < count; i++) {
    const sample = SAMPLE_STREETVIEW_WAYPOINTS[i % SAMPLE_STREETVIEW_WAYPOINTS.length];
    const isSingleCycle = count <= SAMPLE_STREETVIEW_WAYPOINTS.length;
    waypoints.push({
      index: i,
      title: isSingleCycle ? sample.title : `${sample.title} (${i + 1})`,
      caption: sample.caption,
      image: sample.image,
    });
  }
  return waypoints;
}

/**
 * Checks if a feature has at least one waypoint photo.
 */
export function hasStreetViewPhotos(feature: PlanFeature | null | undefined): boolean {
  if (!feature || feature.kind !== 'line') return false;
  if (!feature.routeWaypoints || feature.routeWaypoints.length === 0) return false;
  return feature.routeWaypoints.some((w) => !!w.image && w.image.trim().length > 0);
}

/**
 * Returns effective waypoints for all coordinates in a feature.
 * If a coordinate has no explicit waypoint entry, provides a default entry.
 */
export function getEffectiveWaypoints(feature: PlanFeature): RouteWaypoint[] {
  if (feature.kind !== 'line') return [];
  const coordsCount = feature.coords.length;
  const existingMap = new Map<number, RouteWaypoint>();
  (feature.routeWaypoints || []).forEach((w) => existingMap.set(w.index, w));

  const result: RouteWaypoint[] = [];
  for (let i = 0; i < coordsCount; i++) {
    if (existingMap.has(i)) {
      result.push(existingMap.get(i)!);
    } else {
      result.push({
        index: i,
        title: `Punto ${i + 1}`,
      });
    }
  }
  return result;
}

/**
 * Calculate geographical bearing between two points in degrees (0 - 360).
 */
export function calculateBearing(start: LatLng, end: LatLng): number {
  const [lat1, lon1] = start;
  const [lat2, lon2] = end;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

/**
 * Human-readable compass direction name.
 */
export function getCompassDirection(bearing: number): string {
  const directions = [
    { label: 'Norte', min: 337.5, max: 360 },
    { label: 'Norte', min: 0, max: 22.5 },
    { label: 'Noreste', min: 22.5, max: 67.5 },
    { label: 'Este', min: 67.5, max: 112.5 },
    { label: 'Sureste', min: 112.5, max: 157.5 },
    { label: 'Sur', min: 157.5, max: 202.5 },
    { label: 'Suroeste', min: 202.5, max: 247.5 },
    { label: 'Oeste', min: 247.5, max: 292.5 },
    { label: 'Noroeste', min: 292.5, max: 337.5 },
  ];

  for (const d of directions) {
    if (bearing >= d.min && bearing < d.max) return d.label;
  }
  return 'Norte';
}
