import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { basemaps } from '../data/basemaps';
import { fallbackCategory } from '../utils/plan';
import type { Project } from '../types/plan';

interface PlanThumbnailProps {
  project: Project;
  className?: string;
}

export function PlanThumbnail({ project, className = '' }: PlanThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create non-interactive preview map
    const map = L.map(containerRef.current, {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false
    });
    mapRef.current = map;

    // Add satellite or street tile basemap
    const config = basemaps[project.basemap] ?? basemaps.satellite;
    L.tileLayer(config.url, {
      ...config.options,
      maxZoom: 19
    }).addTo(map);

    // Render features on top of satellite map
    const catMap = new Map(project.categories.map((c) => [c.id, c]));
    const featureGroup = L.featureGroup().addTo(map);
    const allCoords: [number, number][] = [];

    for (const f of project.features) {
      if (project.hiddenCategoryIds?.includes(f.categoryId)) continue;
      const cat = catMap.get(f.categoryId) ?? fallbackCategory;
      const color = f.color || cat.color;

      if (f.kind === 'area' && f.coords.length >= 3) {
        L.polygon(f.coords, {
          color,
          weight: f.strokeWidth ?? 2,
          fillColor: color,
          fillOpacity: f.opacity ?? 0.45,
          interactive: false
        }).addTo(featureGroup);
        f.coords.forEach((coord) => allCoords.push(coord));
      } else if (f.kind === 'line' && f.coords.length >= 2) {
        L.polyline(f.coords, {
          color,
          weight: f.strokeWidth ?? 3.5,
          opacity: f.opacity ?? 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        }).addTo(featureGroup);
        f.coords.forEach((coord) => allCoords.push(coord));
      } else if (f.kind === 'point' && f.coords.length >= 1) {
        L.circleMarker(f.coords[0], {
          radius: 5,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: f.opacity ?? 1,
          interactive: false
        }).addTo(featureGroup);
        allCoords.push(f.coords[0]);
      }
    }

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords.map(([lat, lng]) => [lat, lng]));
      if (bounds.isValid()) {
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
          map.setView(bounds.getNorthEast(), Math.min(Math.max(project.center.zoom, 16), 17));
        } else {
          map.fitBounds(bounds, { padding: [24, 24], maxZoom: 18 });
        }
      } else {
        map.setView([project.center.lat, project.center.lng], project.center.zoom);
      }
    } else {
      map.setView([project.center.lat, project.center.lng], project.center.zoom);
    }

    // Re-adjust size once rendered in container
    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      map.invalidateSize();
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords.map(([lat, lng]) => [lat, lng]));
        if (bounds.isValid()) {
          if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
            map.setView(bounds.getNorthEast(), Math.min(Math.max(project.center.zoom, 16), 17));
          } else {
            map.fitBounds(bounds, { padding: [24, 24], maxZoom: 18 });
          }
        }
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, [
    project.id,
    project.updatedAt,
    project.basemap,
    project.center.lat,
    project.center.lng,
    project.center.zoom,
    project.features,
    project.categories,
    project.hiddenCategoryIds
  ]);

  return (
    <div className={`relative overflow-hidden bg-[#181c20] ${className}`}>
      {/* Real basemap + features container */}
      <div ref={containerRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Subtle vignette for contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

      {/* Live status badge */}
      <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{project.basemap === 'streets' ? 'Callejero' : 'Satelital'}</span>
        <span className="text-white/40">·</span>
        <span>
          {project.features.length === 0
            ? 'Sin elementos'
            : `${project.features.length} ${project.features.length === 1 ? 'elemento' : 'elementos'}`}
        </span>
      </div>
    </div>
  );
}