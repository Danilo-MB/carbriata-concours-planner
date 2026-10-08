import type { TileLayerOptions } from 'leaflet';
import type { Basemap } from '../types/plan';

export const basemaps: Record<Basemap, {label: string;url: string;options: TileLayerOptions;}> = {
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics'
    }
  },
  streets: {
    label: 'Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution: '© Esri, HERE, Garmin, USGS'
    }
  }
};