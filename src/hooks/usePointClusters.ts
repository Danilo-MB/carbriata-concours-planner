import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import { clusterScreenPoints } from '../utils/clusterPoints';
import { escapeHtml, pinHtml, pinIcon } from '../utils/mapIcons';
import { isTrashHot } from '../utils/trashTarget';
import { fallbackCategory } from '../utils/plan';
import type { MapCallbacks } from '../types/map';
import type { Category, PlanFeature, Tool } from '../types/plan';

const CLUSTER_RADIUS_PX = 38;

export function usePointClusters(
map: L.Map | null,
features: PlanFeature[],
categories: Category[],
selectedId: string | null,
tool: Tool,
callbacks: MutableRefObject<MapCallbacks>)
: void {
  const expandedId = useRef<string | null>(null);
  const renderRef = useRef<(group: L.LayerGroup) => void>(() => undefined);

  renderRef.current = (group) => {
    group.clearLayers();
    if (!map) return;

    const byId = new Map(categories.map((category) => [category.id, category]));
    const points = features.filter((feature) => feature.kind === 'point');
    const loose = tool === 'select' ? points.filter((feature) => feature.id !== selectedId) : points;
    const selected = tool === 'select' ? points.find((feature) => feature.id === selectedId) : undefined;
    const clusters = tool === 'select' ? clusterScreenPoints(loose, (feature) => map.latLngToContainerPoint(feature.coords[0]), CLUSTER_RADIUS_PX) : loose.map((feature) => ({
      id: feature.id,
      items: [feature],
      anchor: map.latLngToContainerPoint(feature.coords[0])
    }));

    if (expandedId.current && !clusters.some((cluster) => cluster.items.length > 1 && cluster.id === expandedId.current)) {
      expandedId.current = null;
    }

    if (selected) addSingleMarker(group, selected, categoryOf(selected, byId), true, callbacks);

    for (const cluster of clusters) {
      const latlng = map.containerPointToLatLng([cluster.anchor.x, cluster.anchor.y]);
      if (cluster.items.length === 1) {
        addSingleMarker(group, cluster.items[0], categoryOf(cluster.items[0], byId), false, callbacks);
        continue;
      }
      if (cluster.id === expandedId.current) {
        addSpider(group, cluster.items, latlng, byId, callbacks, () => {
          expandedId.current = null;
          renderRef.current(group);
        });
        continue;
      }
      addClusterMarker(group, cluster.items, latlng, byId, () => {
        expandedId.current = cluster.id;
        renderRef.current(group);
      });
    }
  };

  useEffect(() => {
    if (!map) return;
    if (tool !== 'select') expandedId.current = null;
    const group = L.layerGroup().addTo(map);
    const redraw = () => renderRef.current(group);
    redraw();
    map.on('moveend', redraw);
    map.on('zoomend', redraw);
    map.on('click', collapseOnMap);
    return () => {
      map.off('moveend', redraw);
      map.off('zoomend', redraw);
      map.off('click', collapseOnMap);
      group.remove();
    };

    function collapseOnMap() {
      if (!expandedId.current) return;
      expandedId.current = null;
      renderRef.current(group);
    }
  }, [map, features, categories, selectedId, tool]);
}

function categoryOf(feature: PlanFeature, byId: Map<string, Category>): Category {
  return byId.get(feature.categoryId) ?? fallbackCategory;
}

function addSingleMarker(
group: L.LayerGroup,
feature: PlanFeature,
category: Category,
selected: boolean,
callbacks: MutableRefObject<MapCallbacks>): void {
  const hasImages = feature.images && feature.images.length > 0;
  const labelText = escapeHtml(feature.name.trim() || 'Untitled');
  const label = hasImages ? `${labelText} 📷` : labelText;
  const color = feature.color || category.color;

  const marker = L.marker(feature.coords[0], {
    icon: pinIcon(color, category.icon, selected),
    keyboard: false,
    riseOnHover: true,
    opacity: feature.opacity ?? 1,
    zIndexOffset: selected ? 800 : 0
  }).bindTooltip(label, {
    permanent: false,
    direction: 'top',
    className: 'plan-label',
    offset: [0, -18]
  });

  marker.on('click', (event: L.LeafletMouseEvent) => {
    const current = callbacks.current;
    if (current.tool === 'select') {
      L.DomEvent.stopPropagation(event);
      current.onSelect(feature.id);
      return;
    }
    current.onMapClick([event.latlng.lat, event.latlng.lng]);
  });
  marker.on('dragend', () => {
    if (isTrashHot()) {
      callbacks.current.onDelete(feature.id);
      return;
    }
    const ll = marker.getLatLng();
    callbacks.current.onGeometryChange(feature.id, [[ll.lat, ll.lng]]);
  });
  marker.addTo(group);
  if (!callbacks.current.isVisitor && selected && marker.dragging) marker.dragging.enable();
}

function addClusterMarker(
group: L.LayerGroup,
items: PlanFeature[],
latlng: L.LatLng,
byId: Map<string, Category>,
onExpand: () => void)
: void {
  const colors = [...new Set(items.map((item) => item.color || categoryOf(item, byId).color))].slice(0, 3);
  const names = items.map((item) => item.name.trim() || 'Untitled');
  const summary = names.slice(0, 3).join(', ') + (names.length > 3 ? `, and ${names.length - 3} more` : '');
  const marker = L.marker(latlng, {
    icon: L.divIcon({
      className: 'plan-cluster-root',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      html: `<button type="button" class="plan-cluster" aria-label="Show ${items.length} markers">
        <span class="plan-cluster-badge">${items.length}</span>
        <span class="plan-cluster-colors" aria-hidden="true">${colors.map((color) => `<span style="background:${color}"></span>`).join('')}</span>
      </button>`
    }),
    keyboard: false,
    zIndexOffset: 500
  });
  marker.bindTooltip(escapeHtml(summary), { direction: 'top', className: 'plan-label', offset: [0, -8] });
  marker.on('click', (event: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(event);
    onExpand();
  });
  marker.addTo(group);
}

function addSpider(
group: L.LayerGroup,
items: PlanFeature[],
latlng: L.LatLng,
byId: Map<string, Category>,
callbacks: MutableRefObject<MapCallbacks>,
onCollapse: () => void)
: void {
  const radius = Math.max(68, 50 + items.length * 8);
  const nodes = items.map((item, index) => {
    const angle = index * 2 * Math.PI / items.length - Math.PI / 2;
    const category = categoryOf(item, byId);
    const color = item.color || category.color;
    const name = item.name.trim() || 'Untitled';
    return {
      dx: Math.round(radius * Math.cos(angle)),
      dy: Math.round(radius * Math.sin(angle)),
      html: `<button type="button" class="plan-spider-node" data-feature-id="${escapeHtml(item.id)}" style="--dx:${Math.round(radius * Math.cos(angle))}px; --dy:${Math.round(radius * Math.sin(angle))}px" aria-label="${escapeHtml(name)}">
        ${pinHtml(color, category.icon, false)}
        <span class="plan-spider-name">${escapeHtml(name)}</span>
      </button>`
    };
  });
  const lines = nodes.map((node) =>
    `<line x1="0" y1="0" x2="${node.dx}" y2="${node.dy}" stroke="rgb(23 25 28)" stroke-width="4" />
     <line x1="0" y1="0" x2="${node.dx}" y2="${node.dy}" stroke="#fff" stroke-width="2" stroke-dasharray="3 3" />`
  ).join('');

  const marker = L.marker(latlng, {
    icon: L.divIcon({
      className: 'plan-spider-root',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      html: `<div class="plan-spider">
        <svg class="plan-spider-lines" viewBox="-240 -240 480 480" aria-hidden="true">${lines}</svg>
        <button type="button" class="plan-spider-close" data-collapse aria-label="Collapse markers">×</button>
        ${nodes.map((node) => node.html).join('')}
      </div>`
    }),
    keyboard: false,
    zIndexOffset: 900
  });

  marker.on('click', (event: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(event);
    const target = event.originalEvent.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-collapse]')) {
      onCollapse();
      return;
    }
    const node = target.closest('[data-feature-id]');
    const id = node?.getAttribute('data-feature-id');
    if (!id) return;
    callbacks.current.onSelect(id);
    onCollapse();
  });
  marker.addTo(group);
}
