import { useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import { escapeHtml, pinIcon } from '../utils/mapIcons';
import { fallbackCategory } from '../utils/plan';
import { hasStreetViewPhotos } from '../data/streetViewSamples';
import { formatLength, pathLength, polylineMidpoint } from '../utils/geo';
import type { MapCallbacks } from '../types/map';
import type { Category, FeatureKind, PlanFeature, Tool } from '../types/plan';

type FeatureLayer = L.Marker | L.Polyline;

interface Entry {
  layer: FeatureLayer;
  hitbox?: L.Polyline;
  badge?: L.Marker;
  kind: FeatureKind;
  geomSig: string;
  styleSig: string;
  label: string;
}

export function useFeatureLayers(
  map: L.Map | null,
  features: PlanFeature[],
  categories: Category[],
  selectedId: string | null,
  tool: Tool,
  callbacks: MutableRefObject<MapCallbacks>
) {
  const entries = useRef(new Map<string, Entry>());

  useEffect(() => {
    if (!map) return;
    const byId = new Map(categories.map((c) => [c.id, c]));
    const seen = new Set<string>();

    for (const feature of features) {
      if (feature.kind === 'point') continue;
      seen.add(feature.id);
      const category = byId.get(feature.categoryId) ?? fallbackCategory;
      const selected = feature.id === selectedId;
      const geomSig = JSON.stringify(feature.coords);
      const effectiveColor = feature.color || category.color;
      const effectiveOpacity = feature.opacity;
      const effectiveStrokeWidth = feature.strokeWidth;
      const styleSig = `${effectiveColor}|${effectiveOpacity ?? 'def'}|${effectiveStrokeWidth ?? 'def'}|${category.icon}|${selected}`;
      const hasStreetView = feature.kind === 'line' && hasStreetViewPhotos(feature);
      const hasImages = (feature.images && feature.images.length > 0) || hasStreetView;
      const labelText = escapeHtml(feature.name.trim() || 'Untitled');
      const distInfo = feature.kind === 'line' ? ` · ${formatLength(pathLength(feature.coords))}` : '';
      const label = hasStreetView
        ? `${labelText}${distInfo} 🚶‍♂️📷`
        : hasImages
        ? `${labelText}${distInfo} 📷`
        : `${labelText}${distInfo}`;

      let entry = entries.current.get(feature.id);
      if (entry && entry.kind !== feature.kind) {
        entry.layer.remove();
        entry.hitbox?.remove();
        entry.badge?.remove();
        entries.current.delete(feature.id);
        entry = undefined;
      }

      if (!entry) {
        const layer = createLayer(feature, category, selected, label);
        let hitbox: L.Polyline | undefined;
        let badge: L.Marker | undefined;

        if (feature.kind === 'line') {
          // Generous 30px transparent buffer line for easy clicking & hovering
          hitbox = L.polyline(feature.coords, {
            weight: 30,
            opacity: 0.0001,
            fill: false,
            interactive: true,
            className: 'route-hitbox'
          });

          // Interactive route badge centered along the path
          const mid = polylineMidpoint(feature.coords);
          badge = L.marker(mid, {
            icon: routeBadgeIcon(feature, category, selected),
            interactive: true,
            keyboard: false,
            zIndexOffset: selected ? 400 : 200
          });

          // Interactive hover link between hitbox, visible line, and badge
          const onHover = () => {
            const pathEl = layer.getElement();
            if (pathEl) pathEl.classList.add('route-hovered');
            const badgeEl = badge?.getElement();
            if (badgeEl) badgeEl.querySelector('.route-badge')?.classList.add('is-hovered');
          };
          const onLeave = () => {
            const pathEl = layer.getElement();
            if (pathEl) pathEl.classList.remove('route-hovered');
            const badgeEl = badge?.getElement();
            if (badgeEl) badgeEl.querySelector('.route-badge')?.classList.remove('is-hovered');
          };

          hitbox.on('mouseover', onHover);
          hitbox.on('mouseout', onLeave);
          layer.on('mouseover', onHover);
          layer.on('mouseout', onLeave);
          badge.on('mouseover', onHover);
          badge.on('mouseout', onLeave);

          hitbox.bindTooltip(label, {
            permanent: false,
            sticky: true,
            direction: 'top',
            className: 'plan-label',
            offset: [0, -10]
          });

          bindEvents(hitbox, feature.id, callbacks);
          bindEvents(badge, feature.id, callbacks);

          hitbox.addTo(map);
          badge.addTo(map);
        }

        bindEvents(layer, feature.id, callbacks);
        layer.addTo(map);
        entry = { layer, hitbox, badge, kind: feature.kind, geomSig, styleSig, label };
        entries.current.set(feature.id, entry);
      } else {
        if (entry.geomSig !== geomSig) {
          setGeometry(entry, feature);
          entry.geomSig = geomSig;
        }
        if (entry.styleSig !== styleSig) {
          applyStyle(entry, feature, category, selected);
          entry.styleSig = styleSig;
        }
        if (entry.label !== label) {
          entry.layer.setTooltipContent?.(label);
          entry.hitbox?.setTooltipContent?.(label);
          if (entry.badge) {
            entry.badge.setIcon(routeBadgeIcon(feature, category, selected));
          }
          entry.label = label;
        }
      }

      const layer = entry.layer;
      if (layer instanceof L.Marker) {
        layer.setZIndexOffset(selected ? 800 : 0);
        if (layer.dragging) {
          if (!callbacks.current.isVisitor && selected && tool === 'select') layer.dragging.enable();
          else layer.dragging.disable();
        }
      } else if (selected) {
        layer.bringToFront();
        entry.hitbox?.bringToFront();
      }
    }

    entries.current.forEach((entry, id) => {
      if (!seen.has(id)) {
        entry.layer.remove();
        entry.hitbox?.remove();
        entry.badge?.remove();
        entries.current.delete(id);
      }
    });
  }, [map, features, categories, selectedId, tool, callbacks]);

  useEffect(() => {
    const current = entries.current;
    return () => {
      current.forEach((entry) => {
        entry.layer.remove();
        entry.hitbox?.remove();
        entry.badge?.remove();
      });
      current.clear();
    };
  }, [map]);

  return useCallback((id: string): FeatureLayer | undefined => entries.current.get(id)?.layer, []);
}

function areaStyle(color: string, selected: boolean, opacity?: number, strokeWidth?: number): L.PathOptions {
  return {
    color,
    weight: strokeWidth ?? (selected ? 3 : 2),
    fillColor: color,
    fillOpacity: opacity ?? (selected ? 0.45 : 0.28),
    dashArray: selected ? '6 4' : ''
  };
}

function lineStyle(color: string, selected: boolean, opacity?: number, strokeWidth?: number): L.PolylineOptions {
  return {
    color,
    weight: strokeWidth ?? (selected ? 8 : 5),
    opacity: opacity ?? 0.95,
    lineCap: 'round',
    lineJoin: 'round',
    className: 'route-glow'
  };
}

function routeBadgeIcon(feature: PlanFeature, category: Category, selected: boolean): L.DivIcon {
  const color = feature.color || category.color;
  const name = escapeHtml(feature.name.trim() || 'Ruta');
  const len = formatLength(pathLength(feature.coords));
  const hasStreetView = hasStreetViewPhotos(feature);
  const hasPhotos = (feature.images && feature.images.length > 0) || hasStreetView;
  const selectedCls = selected ? 'is-selected' : '';

  const html = `
    <div class="route-badge ${selectedCls}" title="${name} (${len}) · Clic para seleccionar">
      <span class="route-badge-dot" style="background-color: ${color};"></span>
      <div class="route-badge-details">
        <span class="route-badge-name">${name}</span>
        <span class="route-badge-sep">·</span>
        <span class="route-badge-len">${len}</span>
        ${hasStreetView ? '<span class="route-badge-icon" title="Street View">🚶‍♂️</span>' : hasPhotos ? '<span class="route-badge-icon" title="Fotos">📷</span>' : ''}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'route-badge-wrap',
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

function createLayer(feature: PlanFeature, category: Category, selected: boolean, label: string): FeatureLayer {
  const color = feature.color || category.color;
  if (feature.kind === 'point') {
    const marker = L.marker(feature.coords[0], {
      icon: pinIcon(color, category.icon, selected),
      keyboard: false,
      riseOnHover: true,
      opacity: feature.opacity ?? 1
    }).bindTooltip(label, {
      permanent: false,
      direction: 'top',
      className: 'plan-label',
      offset: [0, -14]
    });
    return marker;
  }
  if (feature.kind === 'area') {
    return L.polygon(feature.coords, areaStyle(color, selected, feature.opacity, feature.strokeWidth)).bindTooltip(label, {
      permanent: false,
      sticky: true,
      direction: 'top',
      className: 'plan-label',
      offset: [0, -10]
    });
  }
  return L.polyline(feature.coords, lineStyle(color, selected, feature.opacity, feature.strokeWidth)).bindTooltip(label, {
    permanent: false,
    sticky: true,
    direction: 'top',
    className: 'plan-label',
    offset: [0, -10]
  });
}

function bindEvents(layer: FeatureLayer | L.Marker | L.Polyline, id: string, callbacks: MutableRefObject<MapCallbacks>): void {
  layer.on('click', (e: L.LeafletMouseEvent) => {
    const cb = callbacks.current;
    if (cb.tool === 'select') {
      L.DomEvent.stopPropagation(e);
      cb.onSelect(id);
      return;
    }
    // Markers and route hitboxes forward clicks to the map while drawing.
    cb.onMapClick([e.latlng.lat, e.latlng.lng]);
  });
  if (layer instanceof L.Marker && (layer as any).dragging) {
    layer.on('dragend', () => {
      const ll = layer.getLatLng();
      callbacks.current.onGeometryChange(id, [[ll.lat, ll.lng]]);
    });
  }
}

function setGeometry(entry: Entry, feature: PlanFeature): void {
  if (entry.layer instanceof L.Marker) {
    entry.layer.setLatLng(feature.coords[0]);
  } else {
    entry.layer.setLatLngs(feature.coords);
    if (entry.hitbox) {
      entry.hitbox.setLatLngs(feature.coords);
    }
    if (entry.badge && feature.coords.length > 0) {
      entry.badge.setLatLng(polylineMidpoint(feature.coords));
    }
  }
}

function applyStyle(entry: Entry, feature: PlanFeature, category: Category, selected: boolean): void {
  const color = feature.color || category.color;
  if (entry.layer instanceof L.Marker) {
    entry.layer.setIcon(pinIcon(color, category.icon, selected));
    if (feature.opacity !== undefined) {
      entry.layer.setOpacity(feature.opacity);
    }
    return;
  }
  entry.layer.setStyle(
    feature.kind === 'area'
      ? areaStyle(color, selected, feature.opacity, feature.strokeWidth)
      : lineStyle(color, selected, feature.opacity, feature.strokeWidth)
  );
  if (entry.badge) {
    entry.badge.setIcon(routeBadgeIcon(feature, category, selected));
    entry.badge.setZIndexOffset(selected ? 400 : 200);
  }
}