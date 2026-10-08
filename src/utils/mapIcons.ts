import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { MoveIcon } from 'lucide-react';
import { categoryIcons } from '../data/categoryIcons';
import type { CategoryIconKey } from '../types/plan';

const svgCache = new Map<CategoryIconKey, string>();

function iconSvg(key: CategoryIconKey): string {
  const cached = svgCache.get(key);
  if (cached) return cached;
  const svg = renderToStaticMarkup(
    createElement(categoryIcons[key], { size: 16, color: '#fff', strokeWidth: 2.25, 'aria-hidden': true })
  );
  svgCache.set(key, svg);
  return svg;
}

export function escapeHtml(value: string): string {
  return value.
  replace(/&/g, '&amp;').
  replace(/</g, '&lt;').
  replace(/>/g, '&gt;').
  replace(/"/g, '&quot;');
}

export function pinHtml(color: string, icon: CategoryIconKey, selected: boolean): string {
  return `<div class="plan-pin${selected ? ' is-selected' : ''}" style="background:${color}">${iconSvg(icon)}</div>`;
}

export function pinIcon(color: string, icon: CategoryIconKey, selected: boolean): L.DivIcon {
  return L.divIcon({
    className: 'plan-pin-wrap',
    html: pinHtml(color, icon, selected),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    tooltipAnchor: [0, 16]
  });
}

export const vertexIcon = L.divIcon({
  className: 'plan-handle',
  html: '<span class="vertex"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

export const midIcon = L.divIcon({
  className: 'plan-handle',
  html: '<span class="mid"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export const moveIcon = L.divIcon({
  className: 'plan-handle',
  html: `<span class="move">${renderToStaticMarkup(createElement(MoveIcon, { size: 16, strokeWidth: 2.25, 'aria-hidden': true }))}</span>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});