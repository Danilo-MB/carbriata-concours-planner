/**
 * CARBRIATA CONCOURS - Draw Manager
 * Interactive visual tools for delimiting areas/zones (polygons), precision metric stands/marquees (exact boxes),
 * routes (lines), and attractions (points) with real-world dimensions in meters.
 */

export class DrawManager {
  constructor(mapEngine, callbacks = {}) {
    this.mapEngine = mapEngine;
    this.map = mapEngine.map;
    // callbacks: onPolygonComplete, onRouteComplete, onPointComplete, onModeChange, onDrawProgress
    this.callbacks = callbacks;

    this.currentMode = 'idle'; // 'idle' | 'polygon' | 'box' | 'route' | 'point'
    this.activePoints = [];
    this.isDrawing = false;
    this.mouseMoveHandler = null;
    this.wheelHandler = null;

    // Precise Box / Marquee Dimensions (in meters)
    this.boxWidth = 6;     // Frente / Ancho (m)
    this.boxLength = 3;    // Fondo / Largo (m)
    this.boxRotation = 0;  // Orientación en grados (0° - 360°)
    this.boxPreset = 'car-single';

    // Circle Dimensions (in meters)
    this.circleRadius = 5; // Radio (m) -> Diámetro 10m
    this.circlePreset = 'circle-10';

    // Triangle Dimensions (in meters)
    this.triangleBase = 10;   // Base (m)
    this.triangleHeight = 10; // Altura (m)
    this.triangleRotation = 0; // Giro en grados (0° - 360°)
    this.trianglePreset = 'tri-10';

    this.lastCursorCoords = null;
    this.previewMarkers = [];

    this._bindEvents();
  }

  _bindEvents() {
    // Escape key cancels drawing; Enter key finishes line/polygon
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentMode !== 'idle') {
        this.cancelDraw();
      }
      if (e.key === 'Enter' && this.isDrawing) {
        this.finishDraw();
      }
    });

    // Double-click to complete line or polygon
    this.map.on('dblclick', (e) => {
      if (this.currentMode === 'polygon' || this.currentMode === 'route') {
        e.preventDefault();
        this.finishDraw();
      }
    });

    // Mouse wheel when holding Shift in Box or Triangle mode: rotate shape
    this.wheelHandler = (e) => {
      if ((this.currentMode === 'box' || this.currentMode === 'triangle') && (e.shiftKey || e.altKey)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 5 : -5;
        if (this.currentMode === 'box') {
          this.boxRotation = (this.boxRotation + delta + 360) % 360;
          if (this.callbacks.onRotationChange) {
            this.callbacks.onRotationChange(this.boxRotation, 'box');
          }
        } else if (this.currentMode === 'triangle') {
          this.triangleRotation = (this.triangleRotation + delta + 360) % 360;
          if (this.callbacks.onRotationChange) {
            this.callbacks.onRotationChange(this.triangleRotation, 'triangle');
          }
        }
        if (this.lastCursorCoords) {
          this._updatePreview(this.lastCursorCoords);
        }
      }
    };
    this.map.getCanvas().addEventListener('wheel', this.wheelHandler, { passive: false });
  }

  setMode(mode) {
    this.cancelDraw();
    this.currentMode = mode;
    this.map.getCanvas().style.cursor = mode === 'idle' ? '' : 'crosshair';

    // In Box, Circle, or Triangle mode, setup mouse movement preview immediately
    if (mode === 'box' || mode === 'circle' || mode === 'triangle') {
      this.mouseMoveHandler = (moveEvent) => {
        this.lastCursorCoords = [moveEvent.lngLat.lng, moveEvent.lngLat.lat];
        this._updatePreview(this.lastCursorCoords);
      };
      this.map.on('mousemove', this.mouseMoveHandler);
    }

    if (this.callbacks.onModeChange) {
      this.callbacks.onModeChange(mode);
    }
  }

  setBoxDimensions(widthM, lengthM, rotationDeg = 0, preset = 'custom') {
    this.boxWidth = Math.max(0.5, parseFloat(widthM) || 6);
    this.boxLength = Math.max(0.5, parseFloat(lengthM) || 3);
    this.boxRotation = ((parseFloat(rotationDeg) || 0) % 360 + 360) % 360;
    this.boxPreset = preset;

    if (this.currentMode === 'box' && this.lastCursorCoords) {
      this._updatePreview(this.lastCursorCoords);
    }
  }

  setCircleDimensions(radiusM, preset = 'custom') {
    this.circleRadius = Math.max(0.5, parseFloat(radiusM) || 5);
    this.circlePreset = preset;

    if (this.currentMode === 'circle' && this.lastCursorCoords) {
      this._updatePreview(this.lastCursorCoords);
    }
  }

  setTriangleDimensions(baseM, heightM, rotationDeg = 0, preset = 'custom') {
    this.triangleBase = Math.max(0.5, parseFloat(baseM) || 10);
    this.triangleHeight = Math.max(0.5, parseFloat(heightM) || 10);
    this.triangleRotation = ((parseFloat(rotationDeg) || 0) % 360 + 360) % 360;
    this.trianglePreset = preset;

    if (this.currentMode === 'triangle' && this.lastCursorCoords) {
      this._updatePreview(this.lastCursorCoords);
    }
  }

  handleMapClick(e) {
    if (this.currentMode === 'idle') return;

    const coords = [e.lngLat.lng, e.lngLat.lat];

    if (this.currentMode === 'point') {
      // Single click places attraction / POI
      if (this.callbacks.onPointComplete) {
        this.callbacks.onPointComplete(coords);
      }
      this.setMode('idle');
      return;
    }

    if (this.currentMode === 'box') {
      // Click stamps the precise metric box onto the map
      const ring = this.createPreciseRectangle(coords, this.boxWidth, this.boxLength, this.boxRotation);
      const areaM2 = Math.round(this.boxWidth * this.boxLength);

      if (this.callbacks.onPolygonComplete) {
        this.callbacks.onPolygonComplete(ring, areaM2, {
          isPreciseBox: true,
          shape: 'rectangle',
          width: this.boxWidth,
          length: this.boxLength,
          rotation: this.boxRotation,
          preset: this.boxPreset
        });
      }
      this.setMode('idle');
      return;
    }

    if (this.currentMode === 'circle') {
      // Click stamps the precise circle polygon onto the map
      const ring = this.createPreciseCircle(coords, this.circleRadius, 48);
      const areaM2 = Math.round(Math.PI * this.circleRadius * this.circleRadius);

      if (this.callbacks.onPolygonComplete) {
        this.callbacks.onPolygonComplete(ring, areaM2, {
          isPreciseBox: true,
          shape: 'circle',
          radius: this.circleRadius,
          diameter: Math.round(this.circleRadius * 2),
          preset: this.circlePreset
        });
      }
      this.setMode('idle');
      return;
    }

    if (this.currentMode === 'triangle') {
      // Click stamps the precise triangle polygon onto the map
      const ring = this.createPreciseTriangle(coords, this.triangleBase, this.triangleHeight, this.triangleRotation);
      const areaM2 = Math.round((this.triangleBase * this.triangleHeight) / 2);

      if (this.callbacks.onPolygonComplete) {
        this.callbacks.onPolygonComplete(ring, areaM2, {
          isPreciseBox: true,
          shape: 'triangle',
          base: this.triangleBase,
          height: this.triangleHeight,
          rotation: this.triangleRotation,
          preset: this.trianglePreset
        });
      }
      this.setMode('idle');
      return;
    }

    if (this.currentMode === 'polygon' || this.currentMode === 'route') {
      this.isDrawing = true;

      // Check if clicking close to the first point to close polygon (< 15 meters)
      if (this.currentMode === 'polygon' && this.activePoints.length >= 3) {
        const first = this.activePoints[0];
        const dist = this._calculateDistance(coords, first);
        if (dist < 15) {
          this.finishDraw();
          return;
        }
      }

      this.activePoints.push(coords);
      this._updatePreview(coords);

      // Track mouse move for rubberband line and live metric measurements
      if (!this.mouseMoveHandler) {
        this.mouseMoveHandler = (moveEvent) => {
          if (!this.isDrawing) return;
          const currentMouse = [moveEvent.lngLat.lng, moveEvent.lngLat.lat];
          this.lastCursorCoords = currentMouse;
          this._updatePreview(currentMouse);
        };
        this.map.on('mousemove', this.mouseMoveHandler);
      }
    }
  }

  _updatePreview(cursorCoords) {
    this._clearPreviewMarkers();

    // 1a. Box / Rectangle Mode Preview
    if (this.currentMode === 'box') {
      if (!cursorCoords) return;
      const ring = this.createPreciseRectangle(cursorCoords, this.boxWidth, this.boxLength, this.boxRotation);

      const features = [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [ring]
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: ring
          }
        },
        // Center pivot point
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: cursorCoords
          }
        }
      ];

      // Add corner points
      for (let i = 0; i < 4; i++) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: ring[i]
          }
        });
      }

      this.mapEngine.updateDrawTemp(features);
      this._renderBoxDimensionMarkers(ring, this.boxWidth, this.boxLength);

      if (this.callbacks.onDrawProgress) {
        this.callbacks.onDrawProgress({
          mode: 'box',
          shape: 'rectangle',
          width: this.boxWidth,
          length: this.boxLength,
          areaM2: Math.round(this.boxWidth * this.boxLength),
          rotation: this.boxRotation
        });
      }
      return;
    }

    // 1b. Circle Mode Preview
    if (this.currentMode === 'circle') {
      if (!cursorCoords) return;
      const ring = this.createPreciseCircle(cursorCoords, this.circleRadius, 48);
      const areaM2 = Math.round(Math.PI * this.circleRadius * this.circleRadius);

      const features = [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [ring]
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: ring
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: cursorCoords
          }
        }
      ];

      this.mapEngine.updateDrawTemp(features);
      this._renderCircleDimensionMarkers(cursorCoords, this.circleRadius);

      if (this.callbacks.onDrawProgress) {
        this.callbacks.onDrawProgress({
          mode: 'circle',
          shape: 'circle',
          radius: this.circleRadius,
          diameter: Math.round(this.circleRadius * 2),
          areaM2
        });
      }
      return;
    }

    // 1c. Triangle Mode Preview
    if (this.currentMode === 'triangle') {
      if (!cursorCoords) return;
      const ring = this.createPreciseTriangle(cursorCoords, this.triangleBase, this.triangleHeight, this.triangleRotation);
      const areaM2 = Math.round((this.triangleBase * this.triangleHeight) / 2);

      const features = [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [ring]
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: ring
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: cursorCoords
          }
        }
      ];

      for (let i = 0; i < 3; i++) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: ring[i]
          }
        });
      }

      this.mapEngine.updateDrawTemp(features);
      this._renderTriangleDimensionMarkers(ring, this.triangleBase, this.triangleHeight);

      if (this.callbacks.onDrawProgress) {
        this.callbacks.onDrawProgress({
          mode: 'triangle',
          shape: 'triangle',
          base: this.triangleBase,
          height: this.triangleHeight,
          rotation: this.triangleRotation,
          areaM2
        });
      }
      return;
    }

    // 2. Freehand Polygon & Route Previews
    if (this.activePoints.length === 0) return;

    const features = [];
    const pts = [...this.activePoints];

    if (cursorCoords) {
      pts.push(cursorCoords);
    }

    if (this.currentMode === 'polygon') {
      if (pts.length >= 3) {
        const closed = [...pts, pts[0]];
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [closed]
          }
        });
      }
      // Line preview
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: pts
        }
      });

      // Calculate live measurements
      if (cursorCoords && this.activePoints.length >= 1) {
        const lastPt = this.activePoints[this.activePoints.length - 1];
        const currentSegmentM = this._calculateDistance(lastPt, cursorCoords);
        const totalPerimeterM = this._calculateRouteLength(pts);
        const liveAreaM2 = pts.length >= 3 ? Math.round(this._calculatePolygonArea(pts)) : 0;

        if (this.callbacks.onDrawProgress) {
          this.callbacks.onDrawProgress({
            mode: 'polygon',
            currentSegmentM,
            totalPerimeterM,
            liveAreaM2,
            pointCount: this.activePoints.length
          });
        }
      }
    } else if (this.currentMode === 'route') {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: pts
        }
      });

      if (cursorCoords && this.activePoints.length >= 1) {
        const lastPt = this.activePoints[this.activePoints.length - 1];
        const currentSegmentM = this._calculateDistance(lastPt, cursorCoords);
        const totalLengthM = this._calculateRouteLength(pts);

        if (this.callbacks.onDrawProgress) {
          this.callbacks.onDrawProgress({
            mode: 'route',
            currentSegmentM,
            totalLengthM,
            pointCount: this.activePoints.length
          });
        }
      }
    }

    // Add vertex points
    this.activePoints.forEach(pt => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: pt
        }
      });
    });

    this.mapEngine.updateDrawTemp(features);
  }

  _renderBoxDimensionMarkers(ring, widthM, lengthM) {
    // ring: 0=TL, 1=TR, 2=BR, 3=BL, 4=TL
    // Midpoint of top edge (Width)
    const midTop = [
      (ring[0][0] + ring[1][0]) / 2,
      (ring[0][1] + ring[1][1]) / 2
    ];
    // Midpoint of right edge (Length)
    const midRight = [
      (ring[1][0] + ring[2][0]) / 2,
      (ring[1][1] + ring[2][1]) / 2
    ];

    const createBadge = (text) => {
      const el = document.createElement('div');
      el.className = 'dimension-map-badge';
      el.innerText = text;
      return el;
    };

    const markerW = new window.maplibregl.Marker({
      element: createBadge(`${widthM.toFixed(1)} m`),
      anchor: 'center'
    }).setLngLat(midTop).addTo(this.map);

    const markerL = new window.maplibregl.Marker({
      element: createBadge(`${lengthM.toFixed(1)} m`),
      anchor: 'center'
    }).setLngLat(midRight).addTo(this.map);

    this.previewMarkers.push(markerW, markerL);
  }

  _renderCircleDimensionMarkers(centerCoords, radiusM) {
    const radLat = centerCoords[1] * Math.PI / 180;
    const metersPerDegreeLat = 111132.954 - 559.822 * Math.cos(2 * radLat) + 1.175 * Math.cos(4 * radLat);
    const topEdgeCoord = [centerCoords[0], centerCoords[1] + (radiusM / metersPerDegreeLat)];

    const createBadge = (text) => {
      const el = document.createElement('div');
      el.className = 'dimension-map-badge';
      el.innerText = text;
      return el;
    };

    const markerBadge = new window.maplibregl.Marker({
      element: createBadge(`Ø ${(radiusM * 2).toFixed(1)} m`),
      anchor: 'bottom'
    }).setLngLat(topEdgeCoord).addTo(this.map);

    this.previewMarkers.push(markerBadge);
  }

  _renderTriangleDimensionMarkers(ring, baseM, heightM) {
    const createBadge = (text) => {
      const el = document.createElement('div');
      el.className = 'dimension-map-badge';
      el.innerText = text;
      return el;
    };

    const midBase = [
      (ring[1][0] + ring[2][0]) / 2,
      (ring[1][1] + ring[2][1]) / 2
    ];

    const markerB = new window.maplibregl.Marker({
      element: createBadge(`Base ${baseM.toFixed(1)} m`),
      anchor: 'top'
    }).setLngLat(midBase).addTo(this.map);

    const markerH = new window.maplibregl.Marker({
      element: createBadge(`Alt ${heightM.toFixed(1)} m`),
      anchor: 'bottom'
    }).setLngLat(ring[0]).addTo(this.map);

    this.previewMarkers.push(markerB, markerH);
  }

  _clearPreviewMarkers() {
    if (this.previewMarkers && this.previewMarkers.length > 0) {
      this.previewMarkers.forEach(m => m.remove());
      this.previewMarkers = [];
    }
  }

  finishDraw() {
    if (this.currentMode === 'polygon') {
      if (this.activePoints.length < 3) {
        alert('Un área requiere al menos 3 puntos para delimitar un terreno.');
        return;
      }
      const ring = [...this.activePoints];
      const areaM2 = this._calculatePolygonArea(ring);
      ring.push(this.activePoints[0]);

      if (this.callbacks.onPolygonComplete) {
        this.callbacks.onPolygonComplete(ring, Math.round(areaM2), { isPreciseBox: false });
      }
    } else if (this.currentMode === 'route') {
      if (this.activePoints.length < 2) {
        alert('Una ruta requiere al menos 2 puntos.');
        return;
      }
      const distM = this._calculateRouteLength(this.activePoints);
      if (this.callbacks.onRouteComplete) {
        this.callbacks.onRouteComplete([...this.activePoints], Math.round(distM));
      }
    }

    this.cancelDraw();
  }

  cancelDraw() {
    this.activePoints = [];
    this.isDrawing = false;
    this.lastCursorCoords = null;
    this._clearPreviewMarkers();
    this.mapEngine.clearDrawTemp();

    if (this.mouseMoveHandler) {
      this.map.off('mousemove', this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }

    this.map.getCanvas().style.cursor = '';
    this.currentMode = 'idle';

    if (this.callbacks.onModeChange) {
      this.callbacks.onModeChange('idle');
    }
  }

  // --- Exact Metric Polygon Generation (Geodesic / WGS84) ---
  createPreciseRectangle(centerLngLat, widthMeters, lengthMeters, rotationDeg = 0) {
    const [centerLng, centerLat] = centerLngLat;
    const radLat = centerLat * Math.PI / 180;

    // WGS84 ellipsoidal distance in meters per degree at this specific latitude
    const metersPerDegreeLat = 111132.954 - 559.822 * Math.cos(2 * radLat) + 1.175 * Math.cos(4 * radLat);
    const metersPerDegreeLng = 111412.84 * Math.cos(radLat) - 93.5 * Math.cos(3 * radLat);

    const halfW = widthMeters / 2;
    const halfL = lengthMeters / 2;
    const radRot = (rotationDeg * Math.PI) / 180;
    const cosR = Math.cos(radRot);
    const sinR = Math.sin(radRot);

    // 4 local corners relative to center in meters:
    // 0: Top-Left, 1: Top-Right, 2: Bottom-Right, 3: Bottom-Left
    const localCorners = [
      [-halfW, halfL],
      [halfW, halfL],
      [halfW, -halfL],
      [-halfW, -halfL]
    ];

    const ring = localCorners.map(([x, y]) => {
      // Clockwise rotation (heading / bearing angle)
      const rx = x * cosR + y * sinR;
      const ry = -x * sinR + y * cosR;

      const lng = centerLng + (rx / metersPerDegreeLng);
      const lat = centerLat + (ry / metersPerDegreeLat);
      return [lng, lat];
    });

    // Close polygon ring
    ring.push([ring[0][0], ring[0][1]]);
    return ring;
  }

  createPreciseCircle(centerLngLat, radiusMeters, pointsCount = 48) {
    const [centerLng, centerLat] = centerLngLat;
    const radLat = centerLat * Math.PI / 180;
    const metersPerDegreeLat = 111132.954 - 559.822 * Math.cos(2 * radLat) + 1.175 * Math.cos(4 * radLat);
    const metersPerDegreeLng = 111412.84 * Math.cos(radLat) - 93.5 * Math.cos(3 * radLat);

    const ring = [];
    for (let i = 0; i < pointsCount; i++) {
      const theta = (i / pointsCount) * 2 * Math.PI;
      const dx = radiusMeters * Math.cos(theta);
      const dy = radiusMeters * Math.sin(theta);
      const lng = centerLng + (dx / metersPerDegreeLng);
      const lat = centerLat + (dy / metersPerDegreeLat);
      ring.push([lng, lat]);
    }
    ring.push([ring[0][0], ring[0][1]]);
    return ring;
  }

  createPreciseTriangle(centerLngLat, baseMeters, heightMeters, rotationDeg = 0) {
    const [centerLng, centerLat] = centerLngLat;
    const radLat = centerLat * Math.PI / 180;
    const metersPerDegreeLat = 111132.954 - 559.822 * Math.cos(2 * radLat) + 1.175 * Math.cos(4 * radLat);
    const metersPerDegreeLng = 111412.84 * Math.cos(radLat) - 93.5 * Math.cos(3 * radLat);

    const radRot = (rotationDeg * Math.PI) / 180;
    const cosR = Math.cos(radRot);
    const sinR = Math.sin(radRot);

    const h23 = (2 / 3) * heightMeters;
    const h13 = (1 / 3) * heightMeters;
    const bHalf = baseMeters / 2;

    const localCorners = [
      [0, h23],
      [bHalf, -h13],
      [-bHalf, -h13]
    ];

    const ring = localCorners.map(([x, y]) => {
      const rx = x * cosR + y * sinR;
      const ry = -x * sinR + y * cosR;
      const lng = centerLng + (rx / metersPerDegreeLng);
      const lat = centerLat + (ry / metersPerDegreeLat);
      return [lng, lat];
    });

    ring.push([ring[0][0], ring[0][1]]);
    return ring;
  }

  getPolygonCentroid(coords) {
    if (!coords || coords.length === 0) return [0, 0];
    let sumLng = 0;
    let sumLat = 0;
    const n = (coords.length > 1 && coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1])
      ? coords.length - 1
      : coords.length;

    for (let i = 0; i < n; i++) {
      sumLng += coords[i][0];
      sumLat += coords[i][1];
    }
    return [sumLng / n, sumLat / n];
  }

  getPolygonPerimeter(coords) {
    if (!coords || coords.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      total += this._calculateDistance(coords[i], coords[i + 1]);
    }
    return Math.round(total);
  }

  // --- Geometry Helpers (Haversine & Spherical Shoelace) ---
  _calculateDistance(coord1, coord2) {
    const R = 6371000; // meters
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  _calculateRouteLength(coords) {
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      total += this._calculateDistance(coords[i], coords[i + 1]);
    }
    return total;
  }

  _calculatePolygonArea(coords) {
    const R = 6371000;
    if (coords.length < 3) return 0;
    let total = 0;

    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      const lon1 = p1[0] * Math.PI / 180;
      const lat1 = p1[1] * Math.PI / 180;
      const lon2 = p2[0] * Math.PI / 180;
      const lat2 = p2[1] * Math.PI / 180;

      total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    return Math.abs(total * R * R / 2);
  }
}
