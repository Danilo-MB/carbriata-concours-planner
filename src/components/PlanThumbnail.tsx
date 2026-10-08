import React, { useMemo } from 'react';
import { polygonArea } from '../utils/geo';
import { fallbackCategory } from '../utils/plan';
import type { Project } from '../types/plan';

const W = 160;
const H = 100;
const PAD = 10;

interface Shape {
  id: string;
  kind: 'area' | 'line' | 'point';
  color: string;
  points: [number, number][];
  size: number;
}

export function PlanThumbnail({ project, className = '' }: {project: Project;className?: string;}) {
  const shapes = useMemo(() => buildShapes(project), [project]);

  return (
    <div className={`relative bg-[#E4E0D4] ${className}`}>
      {shapes ?
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
          {shapes.
        filter((s) => s.kind === 'area').
        map((s) =>
        <polygon
          key={s.id}
          points={s.points.map((p) => p.join(',')).join(' ')}
          fill={s.color}
          fillOpacity={0.45}
          stroke={s.color}
          strokeWidth={0.8}
          strokeLinejoin="round" />

        )}
          {shapes.
        filter((s) => s.kind === 'line').
        map((s) =>
        <polyline
          key={s.id}
          points={s.points.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={s.color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round" />

        )}
          {shapes.
        filter((s) => s.kind === 'point').
        map((s) =>
        <circle key={s.id} cx={s.points[0][0]} cy={s.points[0][1]} r={2.2} fill={s.color} stroke="#fff" strokeWidth={0.8} />
        )}
        </svg> :

      <div className="absolute inset-0 grid place-items-center text-sm text-[#17191c]/70">No elements yet</div>
      }
    </div>);

}

function buildShapes(project: Project): Shape[] | null {
  const all = project.features.flatMap((f) => f.coords);
  if (all.length === 0) return null;
  const lats = all.map((c) => c[0]);
  const lngs = all.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const kx = Math.cos((minLat + maxLat) / 2 * Math.PI / 180);
  const spanX = Math.max((Math.max(...lngs) - minLng) * kx, 1e-4);
  const spanY = Math.max(maxLat - minLat, 1e-4);
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
  const offsetX = (W - spanX * scale) / 2;
  const offsetY = (H - spanY * scale) / 2;
  const colors = new Map(project.categories.map((c) => [c.id, c.color]));

  return project.features.
  map((f) => ({
    id: f.id,
    kind: f.kind,
    color: colors.get(f.categoryId) ?? fallbackCategory.color,
    size: f.kind === 'area' ? polygonArea(f.coords) : 0,
    points: f.coords.map(([lat, lng]) => [
    Math.round((offsetX + (lng - minLng) * kx * scale) * 10) / 10,
    Math.round((offsetY + (maxLat - lat) * scale) * 10) / 10]
    ) as [number, number][]
  })).
  sort((a, b) => b.size - a.size);
}