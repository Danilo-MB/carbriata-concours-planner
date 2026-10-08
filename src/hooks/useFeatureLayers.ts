import { useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import { escapeHtml, pinIcon } from '../utils/mapIcons';
import { fallbackCategory } from '../utils/plan';
import type { MapCallbacks } from '../types/map';
import type { Category, FeatureKind, PlanFeature, Tool } from '../types/plan';

type FeatureLayer = L.Marker | L.Polyline;

interface Entry {
  layer: FeatureLayer;
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
callbacks: MutableRefObject<MapCallbacks>)
{
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
      const styleSig = `${category.color}|${category.icon}|${selected}`;
      const hasImages = feature.images && feature.images.length > 0;
      const labelText = escapeHtml(feature.name.trim() || 'Untitled');
      const label = hasImages ? `${labelText} 📷` : labelText;

      let entry = entries.current.get(feature.id);
      if (entry && entry.kind !== feature.kind) {
        entry.layer.remove();
        entries.current.delete(feature.id);
        entry = undefined;
      }

      if (!entry) {
        const layer = createLayer(feature, category, selected, label);
        bindEvents(layer, feature.id, callbacks);
        layer.addTo(map);
        entry = { layer, kind: feature.kind, geomSig, styleSig, label };
        entries.current.set(feature.id, entry);
      } else {
        if (entry.geomSig !== geomSig) {
          setGeometry(entry.layer, feature);
          entry.geomSig = geomSig;
        }
        if (entry.styleSig !== styleSig) {
          applyStyle(entry.layer, feature.kind, category, selected);
          entry.styleSig = styleSig;
        }
        if (entry.label !== label) {
          entry.layer.setTooltipContent(label);
          entry.label = label;
        }
      }

      const layer = entry.layer;
      if (layer instanceof L.Marker) {
        layer.setZIndexOffset(selected ? 800 : 0);
        if (layer.dragging) {
          if (!callbacks.current.isVisitor && selected && tool === 'select') layer.dragging.enable();else
          layer.dragging.disable();
        }
      } else if (selected) {
        layer.bringToFront();
        layer.closeTooltip();
      } else {
        layer.openTooltip();
      }
    }

    entries.current.forEach((entry, id) => {
      if (!seen.has(id)) {
        entry.layer.remove();
        entries.current.delete(id);
      }
    });
  }, [map, features, categories, selectedId, tool, callbacks]);

  useEffect(() => {
    const current = entries.current;
    return () => {
      current.forEach((entry) => entry.layer.remove());
      current.clear();
    };
  }, [map]);

  return useCallback((id: string): FeatureLayer | undefined => entries.current.get(id)?.layer, []);
}

function areaStyle(color: string, selected: boolean): L.PathOptions {
  return {
    color,
    weight: selected ? 3 : 2,
    fillColor: color,
    fillOpacity: selected ? 0.42 : 0.26,
    dashArray: selected ? '6 4' : ''
  };
}

function lineStyle(color: string, selected: boolean): L.PolylineOptions {
  return { color, weight: selected ? 7 : 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' };
}

function createLayer(feature: PlanFeature, category: Category, selected: boolean, label: string): FeatureLayer {
  if (feature.kind === 'point') {
    return L.marker(feature.coords[0], {
      icon: pinIcon(category.color, category.icon, selected),
      keyboard: false,
      riseOnHover: true
    }).bindTooltip(label, { permanent: true, direction: 'bottom', className: 'plan-label', offset: [0, 2] });
  }
  if (feature.kind === 'area') {
    return L.polygon(feature.coords, areaStyle(category.color, selected)).bindTooltip(label, {
      permanent: true,
      direction: 'center',
      className: 'plan-label'
    });
  }
  return L.polyline(feature.coords, lineStyle(category.color, selected)).bindTooltip(label, {
    permanent: true,
    direction: 'center',
    className: 'plan-label'
  });
}

function bindEvents(layer: FeatureLayer, id: string, callbacks: MutableRefObject<MapCallbacks>): void {
  layer.on('click', (e: L.LeafletMouseEvent) => {
    const cb = callbacks.current;
    if (cb.tool === 'select') {
      L.DomEvent.stopPropagation(e);
      cb.onSelect(id);
      return;
    }
    // Markers don't bubble clicks to the map, so forward them while drawing.
    if (layer instanceof L.Marker) cb.onMapClick([e.latlng.lat, e.latlng.lng]);
  });
  if (layer instanceof L.Marker) {
    layer.on('dragend', () => {
      const ll = layer.getLatLng();
      callbacks.current.onGeometryChange(id, [[ll.lat, ll.lng]]);
    });
  }
}

function setGeometry(layer: FeatureLayer, feature: PlanFeature): void {
  if (layer instanceof L.Marker) layer.setLatLng(feature.coords[0]);else
  layer.setLatLngs(feature.coords);
}

function applyStyle(layer: FeatureLayer, kind: FeatureKind, category: Category, selected: boolean): void {
  if (layer instanceof L.Marker) {
    layer.setIcon(pinIcon(category.color, category.icon, selected));
    return;
  }
  layer.setStyle(kind === 'area' ? areaStyle(category.color, selected) : lineStyle(category.color, selected));
}