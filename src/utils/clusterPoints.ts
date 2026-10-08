export interface ScreenPoint {
  x: number;
  y: number;
}

export interface PointCluster<T> {
  id: string;
  items: T[];
  anchor: ScreenPoint;
}

/**
 * Groups items whose screen positions fall within `radius` pixels of the
 * same seed point. A group of one stays a single marker.
 */
export function clusterScreenPoints<T extends {id: string;}>(
items: T[],
project: (item: T) => ScreenPoint,
radius: number)
: PointCluster<T>[] {
  const clusters: PointCluster<T>[] = [];
  const visited = new Set<string>();

  for (const seed of items) {
    if (visited.has(seed.id)) continue;
    visited.add(seed.id);
    const origin = project(seed);
    const group = [seed];

    for (const other of items) {
      if (visited.has(other.id)) continue;
      const point = project(other);
      if (Math.hypot(origin.x - point.x, origin.y - point.y) <= radius) {
        visited.add(other.id);
        group.push(other);
      }
    }

    const anchor = group.reduce<ScreenPoint>(
      (sum, item) => {
        const point = project(item);
        return { x: sum.x + point.x, y: sum.y + point.y };
      },
      { x: 0, y: 0 }
    );

    clusters.push({
      id: group.map((item) => item.id).sort().join(':'),
      items: group,
      anchor: { x: anchor.x / group.length, y: anchor.y / group.length }
    });
  }

  return clusters;
}
