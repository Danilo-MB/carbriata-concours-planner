import { useEffect } from 'react';
import L from 'leaflet';
import { basemaps } from '../data/basemaps';
import type { Basemap } from '../types/plan';
import { createSatelliteTileLayer } from '../utils/satelliteTileLayer';

export function useBasemap(map: L.Map | null, basemap: Basemap): void {
  useEffect(() => {
    if (!map) return;
    const config = basemaps[basemap] ?? basemaps.satellite;
    const layer = (config === basemaps.satellite ? createSatelliteTileLayer(config.url, config.options) : L.tileLayer(config.url, config.options)).addTo(map);
    layer.bringToBack();
    return () => {
      layer.remove();
    };
  }, [map, basemap]);
}