/**
 * CARBRIATA CONCOURS - Map Engine
 * MapLibre GL JS wrapper for 2D & 3D High-Res Satellite Visualization
 * Supports 3D Polygon Extrusions (Stands, Tents, VIP Pavilions) and Custom Markers
 */

import { CATEGORIES } from '../data/defaultData.js';

export class MapEngine {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = options;
    this.map = null;
    this.currentPitch = 55;
    this.is3D = true;
    this.isOrbiting = false;
    this.orbitAnimId = null;
    this.markers = [];
    this.currentTileLayer = 'satellite';
    this.onFeatureClick = options.onFeatureClick || null;
    this.onMapClick = options.onMapClick || null;
  }

  init(initialCenter = [-57.6972, -36.3265], initialZoom = 16.5) {
    return new Promise((resolve) => {
      // MapLibre GL Base Style with Google Satellite HD & Esri World Imagery
      const style = {
        version: 8,
        sources: {
          'google-hybrid': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 20
          },
          'google-satellite': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 20
          },
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            maxzoom: 18, // Overzooms seamlessly in MapLibre; stops ArcGIS from returning 'Map data not yet available'
            attribution: 'Esri, Maxar, Earthstar Geographics'
          },
          'osm-labels': {
            type: 'raster',
            tiles: [
              'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            maxzoom: 19
          },
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            maxzoom: 19
          },
          'osm-standard': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'base-raster',
            type: 'raster',
            source: 'google-hybrid',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      };

      this.map = new window.maplibregl.Map({
        container: this.containerId,
        style: style,
        center: initialCenter,
        zoom: initialZoom,
        pitch: this.currentPitch,
        bearing: -25,
        maxPitch: 85,
        maxZoom: 21,
        attributionControl: false
      });

      // Add standard navigation controls
      this.map.addControl(
        new window.maplibregl.NavigationControl({
          visualizePitch: true,
          showCompass: true,
          showZoom: true
        }),
        'bottom-right'
      );

      this.map.on('load', () => {
        this._setupGeoJsonLayers();
        this._setupEventListeners();
        resolve(this);
      });
    });
  }

  _setupGeoJsonLayers() {
    // 1. Zones Data Source (Polygons)
    this.map.addSource('carbriata-zones-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // 2D Fill Layer (always visible so clicking inside works reliably in 2D and 3D)
    this.map.addLayer({
      id: 'carbriata-zones-fill-2d',
      type: 'fill',
      source: 'carbriata-zones-source',
      layout: { visibility: 'visible' },
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': ['get', 'opacity']
      }
    });

    // 2D Outline Border Layer
    this.map.addLayer({
      id: 'carbriata-zones-border',
      type: 'line',
      source: 'carbriata-zones-source',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2.5,
        'line-opacity': 0.95
      }
    });

    // 3D Extrusion Layer (Real 3D Stand and Tent volumes!)
    this.map.addLayer({
      id: 'carbriata-zones-extrusion-3d',
      type: 'fill-extrusion',
      source: 'carbriata-zones-source',
      layout: { visibility: 'visible' }, // Shown in 3D mode
      paint: {
        'fill-extrusion-color': ['get', 'color'],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': ['get', 'opacity']
      }
    });

    // 2. Routes Data Source (Lines: Dynamic Straight, Parade Loop)
    this.map.addSource('carbriata-routes-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Route Outer Glow / Casing
    this.map.addLayer({
      id: 'carbriata-routes-glow',
      type: 'line',
      source: 'carbriata-routes-source',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['+', ['get', 'width'], 4],
        'line-opacity': 0.35,
        'line-blur': 3
      }
    });

    // Route Main Line
    this.map.addLayer({
      id: 'carbriata-routes-main',
      type: 'line',
      source: 'carbriata-routes-source',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['get', 'width'],
        'line-opacity': 0.95
      }
    });

    // 3. Drawing In-Progress Temporary Source
    this.map.addSource('carbriata-draw-temp-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    this.map.addLayer({
      id: 'draw-temp-fill',
      type: 'fill',
      source: 'carbriata-draw-temp-source',
      paint: {
        'fill-color': '#d4af37',
        'fill-opacity': 0.4
      }
    });

    this.map.addLayer({
      id: 'draw-temp-line',
      type: 'line',
      source: 'carbriata-draw-temp-source',
      paint: {
        'line-color': '#f5e8b6',
        'line-width': 3,
        'line-dasharray': [2, 2]
      }
    });

    this.map.addLayer({
      id: 'draw-temp-points',
      type: 'circle',
      source: 'carbriata-draw-temp-source',
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 6,
        'circle-color': '#d4af37',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });
  }

  _setupEventListeners() {
    const zoneLayers = ['carbriata-zones-extrusion-3d', 'carbriata-zones-fill-2d', 'carbriata-zones-border'];
    const routeLayers = ['carbriata-routes-main', 'carbriata-routes-glow'];

    // Cursor pointer on hover for all zones and routes
    [...zoneLayers, ...routeLayers].forEach(layerId => {
      this.map.on('mouseenter', layerId, () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', layerId, () => {
        this.map.getCanvas().style.cursor = '';
      });
    });

    // Click on any zone element (3d extrusion, 2d fill, or outline)
    zoneLayers.forEach(layerId => {
      this.map.on('click', layerId, (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          if (this.onFeatureClick) this.onFeatureClick('zone', props.id);
        }
      });
    });

    // Click on any route element (main line or glow)
    routeLayers.forEach(layerId => {
      this.map.on('click', layerId, (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          if (this.onFeatureClick) this.onFeatureClick('route', props.id);
        }
      });
    });

    // Map click handler for drawing
    this.map.on('click', (e) => {
      if (this.onMapClick) this.onMapClick(e);
    });
  }

  setTileLayer(layerType) {
    this.currentTileLayer = layerType;
    let sourceId = 'google-hybrid';
    let showLabels = false;

    if (layerType === 'satellite') {
      sourceId = 'google-hybrid';
      showLabels = false;
    } else if (layerType === 'esri') {
      sourceId = 'esri-satellite';
      showLabels = false;
    } else if (layerType === 'dark') {
      sourceId = 'carto-dark';
      showLabels = false;
    } else if (layerType === 'streets') {
      sourceId = 'osm-standard';
      showLabels = false;
    }

    if (this.map.getLayer('base-raster')) {
      // Re-route source
      this.map.removeLayer('base-raster');
      if (this.map.getLayer('overlay-labels')) {
        this.map.removeLayer('overlay-labels');
      }

      this.map.addLayer({
        id: 'base-raster',
        type: 'raster',
        source: sourceId,
        minzoom: 0,
        maxzoom: 22
      }, 'carbriata-zones-fill-2d');

      if (showLabels) {
        this.map.addLayer({
          id: 'overlay-labels',
          type: 'raster',
          source: 'osm-labels',
          minzoom: 0,
          maxzoom: 22
        }, 'carbriata-zones-fill-2d');
      }
    }
  }

  set2DMode() {
    this.is3D = false;
    this.stopOrbit();
    this.map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 1000
    });

    if (this.map.getLayer('carbriata-zones-extrusion-3d')) {
      this.map.setLayoutProperty('carbriata-zones-extrusion-3d', 'visibility', 'none');
    }
  }

  set3DMode(pitch = 60, bearing = -25) {
    this.is3D = true;
    this.map.easeTo({
      pitch: pitch,
      bearing: bearing,
      duration: 1200
    });

    if (this.map.getLayer('carbriata-zones-extrusion-3d')) {
      this.map.setLayoutProperty('carbriata-zones-extrusion-3d', 'visibility', 'visible');
    }
  }

  toggleOrbit() {
    if (this.isOrbiting) {
      this.stopOrbit();
      return false;
    } else {
      this.startOrbit();
      return true;
    }
  }

  startOrbit() {
    this.isOrbiting = true;
    if (this.map.getPitch() < 30) {
      this.map.setPitch(60);
    }
    const rotateCamera = () => {
      if (!this.isOrbiting) return;
      this.map.rotateTo((this.map.getBearing() + 0.18) % 360, { duration: 0 });
      this.orbitAnimId = requestAnimationFrame(rotateCamera);
    };
    rotateCamera();
  }

  stopOrbit() {
    this.isOrbiting = false;
    if (this.orbitAnimId) {
      cancelAnimationFrame(this.orbitAnimId);
      this.orbitAnimId = null;
    }
  }

  flyTo(center, zoom = 16.5, pitch = 55, bearing = -20) {
    this.map.flyTo({
      center: center,
      zoom: zoom,
      pitch: this.is3D ? pitch : 0,
      bearing: this.is3D ? bearing : 0,
      essential: true,
      duration: 1800
    });
  }

  // Update Zones on Map
  updateZones(zones) {
    const geojson = {
      type: 'FeatureCollection',
      features: zones.map(z => ({
        type: 'Feature',
        properties: {
          id: z.id,
          name: z.name,
          category: z.category,
          color: z.color || '#d4af37',
          height: z.height || 4,
          opacity: z.opacity || 0.7,
          area: z.area || 0
        },
        geometry: {
          type: 'Polygon',
          coordinates: [z.coordinates]
        }
      }))
    };

    const src = this.map.getSource('carbriata-zones-source');
    if (src) src.setData(geojson);
  }

  // Update Routes on Map
  updateRoutes(routes) {
    const geojson = {
      type: 'FeatureCollection',
      features: routes.map(r => ({
        type: 'Feature',
        properties: {
          id: r.id,
          name: r.name,
          category: r.category,
          color: r.color || '#ef4444',
          width: r.width || 6,
          lengthMeters: r.lengthMeters || 0
        },
        geometry: {
          type: 'LineString',
          coordinates: r.coordinates
        }
      }))
    };

    const src = this.map.getSource('carbriata-routes-source');
    if (src) src.setData(geojson);
  }

  // Render or Update Custom HTML Markers for Attractions
  updateMarkers(attractions, onMarkerClick, onMarkerDragEnd, isDraggable = true) {
    // Clear existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    attractions.forEach(item => {
      const el = document.createElement('div');
      el.className = 'custom-car-marker';
      el.setAttribute('data-id', item.id);
      if (isDraggable) {
        el.setAttribute('title', 'Mantén presionado para mover, o haz clic para editar');
      }

      const featuredPhoto = (item.photos && item.photos.length > 0)
        ? item.photos[0]
        : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80';

      const shortTitle = item.title.length > 18 ? item.title.substring(0, 17) + '…' : item.title;
      const catConfig = CATEGORIES[item.category] || CATEGORIES.cars;
      const catColor = catConfig.color || '#d4af37';
      const catIcon = catConfig.icon || 'fa-car-side';

      el.innerHTML = `
        <div class="marker-pin-wrapper">
          <span class="marker-title-pill">${shortTitle}</span>
          <div class="marker-medallion" style="border-color: ${catColor};">
            <img src="${featuredPhoto}" class="marker-thumb-img" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80'" />
            <span class="marker-badge-icon" style="background-color: ${catColor};"><i class="fa-solid ${catIcon}"></i></span>
          </div>
          <div class="marker-pin-stem" style="border-top-color: ${catColor};"></div>
        </div>
      `;

      let isDraggingMarker = false;

      const marker = new window.maplibregl.Marker({
        element: el,
        anchor: 'bottom',
        draggable: isDraggable
      })
        .setLngLat(item.coordinates)
        .addTo(this.map);

      marker.on('dragstart', () => {
        isDraggingMarker = true;
        el.classList.add('dragging');
      });

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        item.coordinates = [lngLat.lng, lngLat.lat];
        el.classList.remove('dragging');
        if (onMarkerDragEnd) onMarkerDragEnd(item);
        setTimeout(() => {
          isDraggingMarker = false;
        }, 120);
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isDraggingMarker) return;
        if (onMarkerClick) onMarkerClick(item);
      });

      this.markers.push(marker);
    });
  }

  // Temporary Draw Preview
  updateDrawTemp(features) {
    const src = this.map.getSource('carbriata-draw-temp-source');
    if (src) {
      src.setData({
        type: 'FeatureCollection',
        features: features
      });
    }
  }

  clearDrawTemp() {
    this.updateDrawTemp([]);
  }
}
