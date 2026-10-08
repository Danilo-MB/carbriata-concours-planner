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
    this.attractionsData = [];
    this.onMarkerClick = null;
    this.onMarkerDragEnd = null;
    this.isDraggableMarkers = true;
    this.expandedClusterId = null;
    this.clusterRadiusPx = 38;
    this._clusterRenderTimer = null;
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

      let isResolved = false;
      const finishInit = () => {
        if (isResolved) return;
        isResolved = true;
        try {
          this._setupGeoJsonLayers();
          this._setupEventListeners();
        } catch (err) {
          console.warn('Map initialization layer setup warning:', err);
        }
        resolve(this);
      };

      if (this.map.loaded()) {
        finishInit();
      } else {
        this.map.on('load', finishInit);
        // Fallback safeguard: Resolve after 1800ms if MapLibre style/tile loading is slow
        setTimeout(finishInit, 1800);
      }
    });
  }

  _setupGeoJsonLayers() {
    if (this.map.getSource('carbriata-zones-source')) {
      return; // Already setup
    }
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
        'fill-extrusion-opacity': 0.75
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
    if (this._eventsConfigured) return;
    this._eventsConfigured = true;
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
        if (this.options.isDrawingActive && this.options.isDrawingActive()) return;
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          if (this.onFeatureClick) this.onFeatureClick('zone', props.id);
        }
      });
    });

    // Click on any route element (main line or glow)
    routeLayers.forEach(layerId => {
      this.map.on('click', layerId, (e) => {
        if (this.options.isDrawingActive && this.options.isDrawingActive()) return;
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

    // Automatic re-clustering on camera changes (zoom/pan)
    this.map.on('zoomend', () => this._scheduleClusterRender());
    this.map.on('moveend', () => this._scheduleClusterRender());
  }

  _scheduleClusterRender() {
    if (this._clusterRenderTimer) clearTimeout(this._clusterRenderTimer);
    this._clusterRenderTimer = setTimeout(() => {
      this.renderClusteredMarkers();
    }, 80);
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

  // Update Attractions & Render Clustered / Spiderfied Markers
  updateMarkers(attractions, onMarkerClick, onMarkerDragEnd, isDraggable = true) {
    this.attractionsData = Array.isArray(attractions) ? attractions : [];
    this.onMarkerClick = onMarkerClick;
    this.onMarkerDragEnd = onMarkerDragEnd;
    this.isDraggableMarkers = isDraggable;

    this.renderClusteredMarkers();
  }

  collapseCluster() {
    if (this.expandedClusterId) {
      this.expandedClusterId = null;
      this.renderClusteredMarkers();
    }
  }

  expandCluster(clusterId) {
    this.expandedClusterId = clusterId;
    this.renderClusteredMarkers();
  }

  clusterAttractions() {
    if (!this.map || !this.attractionsData || this.attractionsData.length === 0) return [];

    // Filter only attractions with valid [lng, lat] numerical coordinates
    const validItems = this.attractionsData.filter(item =>
      Array.isArray(item.coordinates) &&
      item.coordinates.length === 2 &&
      !isNaN(item.coordinates[0]) &&
      !isNaN(item.coordinates[1])
    );

    const clusters = [];
    const visited = new Set();
    const radiusPx = this.clusterRadiusPx || 38;

    for (let i = 0; i < validItems.length; i++) {
      const itemA = validItems[i];
      if (visited.has(itemA.id)) continue;
      visited.add(itemA.id);

      const ptA = this.map.project(itemA.coordinates);
      const clusterItems = [itemA];

      for (let j = i + 1; j < validItems.length; j++) {
        const itemB = validItems[j];
        if (visited.has(itemB.id)) continue;

        const ptB = this.map.project(itemB.coordinates);
        const dist = Math.hypot(ptA.x - ptB.x, ptA.y - ptB.y);

        if (dist <= radiusPx) {
          visited.add(itemB.id);
          clusterItems.push(itemB);
        }
      }

      if (clusterItems.length === 1) {
        clusters.push({
          type: 'single',
          id: itemA.id,
          item: itemA,
          coordinates: itemA.coordinates
        });
      } else {
        // Average coordinates for cluster anchor
        const avgLng = clusterItems.reduce((sum, it) => sum + it.coordinates[0], 0) / clusterItems.length;
        const avgLat = clusterItems.reduce((sum, it) => sum + it.coordinates[1], 0) / clusterItems.length;
        const clusterId = 'cluster-' + clusterItems.map(it => it.id).sort().join('-');

        clusters.push({
          type: 'cluster',
          id: clusterId,
          items: clusterItems,
          coordinates: [avgLng, avgLat]
        });
      }
    }

    return clusters;
  }

  renderClusteredMarkers() {
    // Clear existing markers
    if (this.markers) {
      this.markers.forEach(m => m.remove());
    }
    this.markers = [];

    const clusters = this.clusterAttractions();

    // If active expanded cluster has unclustered (e.g. user zoomed in deeply), reset it
    if (this.expandedClusterId && !clusters.find(c => c.type === 'cluster' && c.id === this.expandedClusterId)) {
      this.expandedClusterId = null;
    }

    clusters.forEach(c => {
      if (c.type === 'single') {
        this._renderSingleMarker(c.item);
      } else if (c.type === 'cluster') {
        if (c.id === this.expandedClusterId) {
          this._renderExplodedCluster(c);
        } else {
          this._renderCollapsedCluster(c);
        }
      }
    });
  }

  _renderSingleMarker(item) {
    const el = document.createElement('div');
    el.className = 'custom-car-marker';
    el.setAttribute('data-id', item.id);

    const featuredPhoto = (item.photos && item.photos.length > 0)
      ? item.photos[0]
      : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80';

    const shortTitle = item.title.length > 18 ? item.title.substring(0, 17) + '…' : item.title;
    const catConfig = CATEGORIES[item.category] || CATEGORIES.cars;
    const catColor = catConfig.color || '#d4af37';
    const catIcon = catConfig.icon || 'fa-car-side';

    el.innerHTML = `
      <div class="marker-pin-wrapper" title="${item.title}">
        <span class="marker-title-pill">${shortTitle}</span>
        <div class="marker-medallion" style="border-color: ${catColor};">
          <img src="${featuredPhoto}" class="marker-thumb-img" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80'" />
          <span class="marker-badge-icon" style="background-color: ${catColor};"><i class="fa-solid ${catIcon}"></i></span>
        </div>
        <div class="marker-pin-stem" style="border-top-color: ${catColor};"></div>
      </div>
    `;

    const pinWrapper = el.querySelector('.marker-pin-wrapper');
    let isDragging = false;

    const marker = new window.maplibregl.Marker({
      element: el,
      anchor: 'bottom',
      draggable: this.isDraggableMarkers
    })
      .setLngLat(item.coordinates)
      .addTo(this.map);

    marker.on('dragstart', () => {
      isDragging = true;
      pinWrapper.classList.add('dragging');
      if (this.options.onMarkerDragStart) this.options.onMarkerDragStart(item);
    });

    marker.on('drag', () => {
      if (this.options.onMarkerDrag) this.options.onMarkerDrag(marker, item);
    });

    marker.on('dragend', () => {
      pinWrapper.classList.remove('dragging');
      const handled = this.options.onMarkerDragEndCheck && this.options.onMarkerDragEndCheck(marker, item);
      if (!handled) {
        const lngLat = marker.getLngLat();
        item.coordinates = [lngLat.lng, lngLat.lat];
        if (this.onMarkerDragEnd) this.onMarkerDragEnd(item);
        setTimeout(() => {
          isDragging = false;
          this.renderClusteredMarkers();
        }, 100);
      }
    });

    pinWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isDragging) return;
      if (this.options.isDrawingActive && this.options.isDrawingActive()) return;
      if (this.onMarkerClick) this.onMarkerClick(item);
    });

    this.markers.push(marker);
  }

  _renderCollapsedCluster(cluster) {
    const el = document.createElement('div');
    el.className = 'custom-cluster-marker';
    el.setAttribute('data-cluster-id', cluster.id);

    const firstItem = cluster.items[0];
    const topPhoto = (firstItem.photos && firstItem.photos.length > 0)
      ? firstItem.photos[0]
      : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80';

    const count = cluster.items.length;
    const titlesSummary = cluster.items.slice(0, 3).map(it => it.title).join(', ') + (count > 3 ? ` y ${count - 3} más` : '');

    el.innerHTML = `
      <div class="cluster-collapsed-wrapper" title="${titlesSummary} • Clic para desplegar">
        <span class="cluster-title-pill">✦ ${count} Autos ✦</span>
        <div class="cluster-medallion-stack">
          <div class="cluster-stack-leaf-1"></div>
          <div class="cluster-stack-leaf-2"></div>
          <div class="cluster-medallion-main">
            <img src="${topPhoto}" class="marker-thumb-img" alt="${count} autos" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80'" />
            <span class="cluster-badge-count">🏎️ ${count}</span>
          </div>
        </div>
        <div class="marker-pin-stem" style="border-top-color: var(--gold-400);"></div>
      </div>
    `;

    const clusterWrapper = el.querySelector('.cluster-collapsed-wrapper');

    const marker = new window.maplibregl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(cluster.coordinates)
      .addTo(this.map);

    clusterWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.options.isDrawingActive && this.options.isDrawingActive()) return;
      this.expandCluster(cluster.id);
    });

    this.markers.push(marker);
  }

  _renderExplodedCluster(cluster) {
    const el = document.createElement('div');
    el.className = 'spiderfy-container';
    el.setAttribute('data-cluster-id', cluster.id);

    const items = cluster.items;
    const n = items.length;
    const radius = Math.max(68, 50 + n * 8);

    // Compute polar radial offsets for each car
    const offsets = items.map((it, idx) => {
      const angle = (idx * 2 * Math.PI / n) - (Math.PI / 2);
      const dx = Math.round(radius * Math.cos(angle));
      const dy = Math.round(radius * Math.sin(angle));
      return { item: it, dx, dy, angle };
    });

    // Build SVG dashed tether lines
    const svgLines = offsets.map(o => `
      <line x1="0" y1="0" x2="${o.dx}" y2="${o.dy}" stroke="#d4af37" stroke-width="2" stroke-dasharray="3,3" opacity="0.85" />
      <circle cx="${o.dx}" cy="${o.dy}" r="3" fill="#d4af37" />
    `).join('');

    let nodesHtml = '';
    offsets.forEach(o => {
      const item = o.item;
      const featuredPhoto = (item.photos && item.photos.length > 0)
        ? item.photos[0]
        : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80';

      const shortTitle = item.title.length > 16 ? item.title.substring(0, 15) + '…' : item.title;
      const catConfig = CATEGORIES[item.category] || CATEGORIES.cars;
      const catColor = catConfig.color || '#d4af37';
      const catIcon = catConfig.icon || 'fa-car-side';

      nodesHtml += `
        <div class="spiderfy-exploded-node" style="--dx: ${o.dx}px; --dy: ${o.dy}px; transform: translate(${o.dx}px, ${o.dy}px);" data-item-id="${item.id}">
          <div class="marker-pin-wrapper" title="${item.title}">
            <span class="marker-title-pill">${shortTitle}</span>
            <div class="marker-medallion" style="border-color: ${catColor};">
              <img src="${featuredPhoto}" class="marker-thumb-img" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80'" />
              <span class="marker-badge-icon" style="background-color: ${catColor};"><i class="fa-solid ${catIcon}"></i></span>
            </div>
            <div class="marker-pin-stem" style="border-top-color: ${catColor};"></div>
          </div>
        </div>
      `;
    });

    el.innerHTML = `
      <svg class="spiderfy-svg" viewBox="-160 -160 320 320">
        ${svgLines}
      </svg>
      <button class="spiderfy-center-btn" title="Cerrar y colapsar grupo (✖)">
        <i class="fa-solid fa-xmark"></i>
      </button>
      ${nodesHtml}
    `;

    // Center close button handler
    const closeBtn = el.querySelector('.spiderfy-center-btn');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.collapseCluster();
    });

    // Individual exploded node click handlers
    el.querySelectorAll('.spiderfy-exploded-node').forEach(node => {
      const itemId = node.getAttribute('data-item-id');
      const item = items.find(it => it.id === itemId);
      const pinWrapper = node.querySelector('.marker-pin-wrapper');

      pinWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.options.isDrawingActive && this.options.isDrawingActive()) return;
        if (this.onMarkerClick && item) this.onMarkerClick(item);
      });
    });

    const marker = new window.maplibregl.Marker({
      element: el,
      anchor: 'center'
    })
      .setLngLat(cluster.coordinates)
      .addTo(this.map);

    this.markers.push(marker);
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
