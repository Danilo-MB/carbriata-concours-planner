/**
 * CARBRIATA CONCOURS - Master Application Orchestrator
 * Coordinates MapEngine, DrawManager, UIManager, and LocalStorage State
 */

import { INITIAL_LOCATIONS, DOLORES_INITIAL_DATA } from './data/defaultData.js?v=18';
import { MapEngine } from './map/mapEngine.js?v=18';
import { DrawManager } from './map/drawManager.js?v=18';
import { UIManager } from './ui/uiManager.js?v=18';
import { ProjectManager, PROJECT_TYPES } from './data/projectManager.js?v=18';

class CarbriataApp {
  constructor() {
    this.projectManager = new ProjectManager();
    this.activeProject = this.projectManager.getActiveProject();
    this.locations = [...INITIAL_LOCATIONS];
    this.currentLocationId = this.activeProject ? this.activeProject.id : 'dolores-2026';
    this.data = this.activeProject ? this.activeProject.data : DOLORES_INITIAL_DATA;
    this.isOrganizerMode = true;

    this.mapEngine = null;
    this.drawManager = null;
    this.ui = null;
    this.pendingDeleteItem = null;
    this.mapEngineInitialized = false;
  }

  async init() {
    // 1. Initialize UI Manager
    this.ui = new UIManager(this);

    // 2. Render Project Selection & Creation Hub (First Screen)
    this.ui.renderProjectHub();

    console.log('🏁 MAPAMETRIC Multi-Industry Land Studio & Hub initialized.');
  }

  async openProject(projectId) {
    const proj = this.projectManager.getProject(projectId);
    if (!proj) return;

    this.projectManager.setActiveProjectId(projectId);
    this.activeProject = proj;
    this.data = proj.data || { zones: [], routes: [], attractions: [] };
    this.currentLocationId = proj.id;

    // 1. Switch View: Hide Hub, Show Studio
    document.getElementById('project-hub-view')?.classList.remove('active');
    const studioView = document.getElementById('studio-view');
    studioView?.classList.add('active');

    // 2. Initialize Map Studio if not done yet
    if (!this.mapEngineInitialized) {
      await this.initMapStudio(proj);
    } else {
      if (this.mapEngine && this.mapEngine.map) {
        this.mapEngine.map.resize();
        this.mapEngine.flyTo(
          proj.coordinates || [-57.6972, -36.3265],
          proj.zoom || 16.5,
          proj.pitch !== undefined ? proj.pitch : 50,
          proj.bearing !== undefined ? proj.bearing : -20
        );
      }
      this.refreshMapData();
    }

    // 3. Update Data & UI for the active domain/project
    this.ui.updateStudioHeaderForProject(proj);
    this.ui.renderSidebar();

    // 4. Force map resize after DOM reflow
    setTimeout(() => {
      if (this.mapEngine && this.mapEngine.map) {
        this.mapEngine.map.resize();
      }
    }, 150);
    setTimeout(() => {
      if (this.mapEngine && this.mapEngine.map) {
        this.mapEngine.map.resize();
      }
    }, 450);
  }

  returnToHub() {
    this.saveState();
    document.getElementById('studio-view')?.classList.remove('active');
    document.getElementById('project-hub-view')?.classList.add('active');
    this.ui.renderProjectHub();
  }

  async createProject(params) {
    try {
      const newProj = this.projectManager.createProject(params);
      this.ui.renderProjectHub();
      await this.openProject(newProj.id);
      this.ui.showToast(`Proyecto creado: ${newProj.name}`);
    } catch (err) {
      console.error('Error in createProject:', err);
      this.ui.showToast('Error al crear proyecto: ' + (err.message || 'Error'));
    }
  }

  duplicateProject(id) {
    const cloned = this.projectManager.duplicateProject(id);
    if (cloned) {
      this.ui.renderProjectHub();
      this.ui.showToast(`Proyecto duplicado: ${cloned.name}`);
    }
  }

  deleteProject(id) {
    try {
      this.projectManager.deleteProject(id);
      this.ui.renderProjectHub();
      this.ui.showToast('Proyecto eliminado');
    } catch (err) {
      this.ui.showToast(err.message || 'Error al eliminar');
    }
  }

  async initMapStudio(proj) {
    const center = proj.coordinates || [-57.6972, -36.3265];
    const zoom = proj.zoom || 16.5;
    this.dragState = null;
    this.justDragged = false;
    this.justHandledClick = false;

    this.mapEngine = new MapEngine('map', {
      isDrawingActive: () => this.drawManager && this.drawManager.currentMode !== 'idle',
      onFeatureClick: (type, id) => {
        if (this.drawManager && this.drawManager.currentMode !== 'idle') return;
        if (this.justDragged || this.justHandledClick) return;
        this.handleFeatureClick(type, id);
      },
      onMarkerDragStart: (item) => {
        this.showTrashZone(true);
      },
      onMarkerDrag: (marker, item) => {
        this.checkMarkerOverTrash(marker);
      },
      onMarkerDragEndCheck: (marker, item) => {
        const isOver = this.checkMarkerOverTrash(marker);
        this.showTrashZone(false);
        if (isOver) {
          this.openDeleteConfirmation('attraction', item, marker);
          return true; // Deletion modal opened, don't update coords automatically
        }
        return false;
      },
      onMapClick: (e) => {
        // 0. If a cluster is currently exploded, collapse it on background click
        if (this.mapEngine && this.mapEngine.expandedClusterId) {
          this.mapEngine.collapseCluster();
          return;
        }

        // 1. If currently drawing, let DrawManager handle the click
        if (this.drawManager && this.drawManager.currentMode !== 'idle') {
          this.drawManager.handleMapClick(e);
          return;
        }

        if (this.justDragged || this.justHandledClick) return;

        // 2. In Idle mode: check if clicking inside any area/zone
        if (e.lngLat && this.isOrganizerMode) {
          const clickPt = [e.lngLat.lng, e.lngLat.lat];
          const clickedZone = this.findZoneAtPoint(clickPt);
          if (clickedZone) {
            this.handleFeatureClick('zone', clickedZone.id);
            return;
          }

          // 3. Check if clicking near any route line
          const clickedRoute = this.findRouteNearPoint(clickPt, 18);
          if (clickedRoute) {
            this.handleFeatureClick('route', clickedRoute.id);
            return;
          }
        }
      }
    });

    await this.mapEngine.init(center, zoom);

    // Mousedown on map: Initiate drag for zones or routes
    this.mapEngine.map.on('mousedown', (e) => {
      if (!this.isOrganizerMode) return;
      if (this.drawManager && this.drawManager.currentMode !== 'idle') return;

      const clickPt = [e.lngLat.lng, e.lngLat.lat];
      const hitZone = this.findZoneAtPoint(clickPt);
      if (hitZone) {
        this.dragState = {
          type: 'zone',
          item: hitZone,
          startLngLat: e.lngLat,
          startPoint: { x: e.point.x, y: e.point.y },
          originalCoords: JSON.parse(JSON.stringify(hitZone.coordinates)),
          hasMoved: false
        };
        this.mapEngine.map.dragPan.disable();
        this.showTrashZone(true);
        return;
      }

      const hitRoute = this.findRouteNearPoint(clickPt, 18);
      if (hitRoute) {
        this.dragState = {
          type: 'route',
          item: hitRoute,
          startLngLat: e.lngLat,
          startPoint: { x: e.point.x, y: e.point.y },
          originalCoords: JSON.parse(JSON.stringify(hitRoute.coordinates)),
          hasMoved: false
        };
        this.mapEngine.map.dragPan.disable();
        this.showTrashZone(true);
        return;
      }
    });

    // Mousemove on map: update drag position or show grab cursor
    this.mapEngine.map.on('mousemove', (e) => {
      if (this.dragState && this.dragState.item) {
        const dx = e.point.x - this.dragState.startPoint.x;
        const dy = e.point.y - this.dragState.startPoint.y;
        if (Math.hypot(dx, dy) > 4) {
          this.dragState.hasMoved = true;
          this.mapEngine.map.getCanvas().style.cursor = 'grabbing';

          // Check hover over floating trash zone
          if (e.originalEvent) {
            this.checkPointOverTrash(e.originalEvent.clientX, e.originalEvent.clientY);
          }

          const dLng = e.lngLat.lng - this.dragState.startLngLat.lng;
          const dLat = e.lngLat.lat - this.dragState.startLngLat.lat;

          if (this.dragState.type === 'zone') {
            this.dragState.item.coordinates = this.dragState.originalCoords.map(([lng, lat]) => [
              lng + dLng,
              lat + dLat
            ]);
            this.mapEngine.updateZones(this.data.zones);
          } else if (this.dragState.type === 'route') {
            this.dragState.item.coordinates = this.dragState.originalCoords.map(([lng, lat]) => [
              lng + dLng,
              lat + dLat
            ]);
            this.mapEngine.updateRoutes(this.data.routes);
          }
        }
        return;
      }

      if (!this.drawManager || this.drawManager.currentMode !== 'idle') return;
      if (!this.isOrganizerMode) return;

      const pt = [e.lngLat.lng, e.lngLat.lat];
      const hitZone = this.findZoneAtPoint(pt);
      const hitRoute = this.findRouteNearPoint(pt, 18);

      if (hitZone || hitRoute) {
        this.mapEngine.map.getCanvas().style.cursor = 'grab';
      } else {
        this.mapEngine.map.getCanvas().style.cursor = '';
      }
    });

    // Mouseup on map: drop element and save state or delete if dropped on trash
    const handleMouseUp = (e) => {
      if (this.dragState && this.dragState.item) {
        this.mapEngine.map.dragPan.enable();
        const wasMoved = this.dragState.hasMoved;
        const draggedType = this.dragState.type;
        const draggedItem = this.dragState.item;
        const origCoords = this.dragState.originalCoords;
        const wasOverTrash = e && e.originalEvent ? this.checkPointOverTrash(e.originalEvent.clientX, e.originalEvent.clientY) : false;

        this.dragState = null;
        this.showTrashZone(false);

        if (wasMoved && wasOverTrash) {
          // Revert position on map, then prompt for deletion confirmation
          draggedItem.coordinates = origCoords;
          if (draggedType === 'zone') this.mapEngine.updateZones(this.data.zones);
          if (draggedType === 'route') this.mapEngine.updateRoutes(this.data.routes);
          this.openDeleteConfirmation(draggedType, draggedItem);
          return;
        }

        if (wasMoved) {
          this.justDragged = true;
          this.saveState();
          this.ui.renderSidebar();
          this.ui.showToast(`Ubicación de ${draggedItem.name} actualizada`);
          setTimeout(() => {
            this.justDragged = false;
          }, 300);
        } else {
          // It was a click without dragging -> mark justHandledClick to prevent duplicate map click
          this.justHandledClick = true;
          setTimeout(() => {
            this.justHandledClick = false;
          }, 300);

          if (draggedType === 'zone') {
            this.handleFeatureClick('zone', draggedItem.id);
          } else if (draggedType === 'route') {
            this.handleFeatureClick('route', draggedItem.id);
          }
        }
      }
    };

    this.mapEngine.map.on('mouseup', handleMouseUp);
    window.addEventListener('mouseup', (e) => {
      if (this.dragState) {
        this.mapEngine.map.dragPan.enable();
        this.showTrashZone(false);
        if (this.dragState.hasMoved) {
          this.saveState();
        }
        this.dragState = null;
      }
    });

    // 3. Initialize Drawing Manager
    this.drawManager = new DrawManager(this.mapEngine, {
      onPolygonComplete: (coords, areaM2, meta) => {
        this.ui.openZoneEditor(null, coords, areaM2, meta);
      },
      onRouteComplete: (coords, lengthM) => {
        this.ui.openRouteEditor(null, coords, lengthM);
      },
      onPointComplete: (coords) => {
        this.ui.openAttractionEditor(null, coords);
      },
      onModeChange: (mode) => {
        this._updateDrawToolbarUI(mode);
      },
      onRotationChange: (rotDeg) => {
        if (this.drawManager && this.drawManager.currentMode === 'triangle') {
          const triRotInput = document.getElementById('tri-rot-input');
          if (triRotInput) triRotInput.value = rotDeg;
        } else {
          const boxRotInput = document.getElementById('box-rot-input');
          if (boxRotInput) boxRotInput.value = rotDeg;
        }
      },
      onDrawProgress: (data) => {
        this._updateDrawProgressUI(data);
      }
    });

    // 4. Initial Map Data Render
    this.refreshMapData();

    // 5. Setup Action Buttons & Forms
    this._bindDOMEvents();

    // 6. Initial UI Render
    this.ui.renderSidebar();
    this.mapEngineInitialized = true;
    console.log('🏁 3D Map Studio initialized successfully.');
  }

  saveState() {
    try {
      this.projectManager.saveActiveProjectData(this.data);
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  refreshMapData() {
    this.mapEngine.updateZones(this.data.zones);
    this.mapEngine.updateRoutes(this.data.routes);
    this.mapEngine.updateMarkers(
      this.data.attractions,
      (item) => {
        if (this.isOrganizerMode) {
          this.ui.openAttractionEditor(item);
        } else {
          this.ui.openSpotlight(item);
        }
      },
      (movedItem) => {
        this.saveState();
        this.ui.renderSidebar();
        this.ui.showToast(`Ubicación actualizada: ${movedItem.title}`);
      },
      this.isOrganizerMode
    );
    this.saveState();
  }

  cleanDuplicateAttractions() {
    const seen = new Set();
    const unique = [];
    let removedCount = 0;

    this.data.attractions.forEach(item => {
      const coordStr = item.coordinates ? item.coordinates.map(n => Number(n).toFixed(5)).join(',') : '';
      const key = `${(item.title || '').trim().toLowerCase()}_${coordStr}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      } else {
        removedCount++;
      }
    });

    if (removedCount > 0) {
      this.data.attractions = unique;
      this.refreshMapData();
      this.ui.renderSidebar();
      this.ui.showToast(`Se eliminaron ${removedCount} autos duplicados`);
    } else {
      this.ui.showToast('No se encontraron autos duplicados');
    }
  }

  handleFeatureClick(type, id) {
    if (type === 'zone') {
      const zone = this.data.zones.find(z => z.id === id);
      if (zone) {
        if (this.isOrganizerMode) {
          this.ui.openZoneEditor(zone);
        } else {
          this.mapEngine.set3DMode(65, -30);
          this.mapEngine.flyTo(zone.coordinates[0], 17.5, 65, -30);
        }
      }
    } else if (type === 'route') {
      const route = this.data.routes.find(r => r.id === id);
      if (route) {
        if (this.isOrganizerMode) {
          this.ui.openRouteEditor(route);
        } else {
          const mid = route.coordinates[Math.floor(route.coordinates.length / 2)];
          this.mapEngine.flyTo(mid, 16.5, 60, -25);
        }
      }
    }
  }

  findZoneAtPoint(point) {
    const x = point[0]; // lng
    const y = point[1]; // lat

    // Iterate backwards so the top-most zone is selected if overlapping
    for (let k = this.data.zones.length - 1; k >= 0; k--) {
      const zone = this.data.zones[k];
      const vs = zone.coordinates;
      if (!vs || vs.length < 3) continue;

      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      if (inside) return zone;
    }
    return null;
  }

  findRouteNearPoint(point, thresholdMeters = 18) {
    const px = point[0];
    const py = point[1];

    for (let k = this.data.routes.length - 1; k >= 0; k--) {
      const route = this.data.routes[k];
      const coords = route.coordinates;
      if (!coords || coords.length < 2) continue;

      for (let i = 0; i < coords.length - 1; i++) {
        const dist = this._pointToSegmentDistMeters(px, py, coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
        if (dist <= thresholdMeters) {
          return route;
        }
      }
    }
    return null;
  }

  _pointToSegmentDistMeters(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0) {
      t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    }
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    const R = 6371000;
    const dLat = (projY - py) * Math.PI / 180;
    const dLon = (projX - px) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(py * Math.PI / 180) * Math.cos(projY * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  switchLocation(locationId) {
    const loc = this.locations.find(l => l.id === locationId);
    if (!loc) return;

    this.currentLocationId = locationId;
    const selectElem = document.getElementById('venue-select');
    if (selectElem) selectElem.value = locationId;

    this.mapEngine.flyTo(loc.coordinates, loc.zoom || 16.5, loc.pitch || 55, loc.bearing || -20);
    this.ui.renderSidebar();
  }

  _bindDOMEvents() {
    // Venue Select Dropdown
    const venueSelect = document.getElementById('venue-select');
    if (venueSelect) {
      venueSelect.addEventListener('change', (e) => {
        this.switchLocation(e.target.value);
      });
    }

    // Mode Switch (Organizador / Visitante)
    const btnModeOrg = document.getElementById('btn-mode-organizer');
    const btnModeVis = document.getElementById('btn-mode-visitor');
    const leftToolsPanel = document.getElementById('left-tools-panel');

    if (btnModeOrg && btnModeVis) {
      btnModeOrg.addEventListener('click', () => {
        this.isOrganizerMode = true;
        btnModeOrg.classList.add('active');
        btnModeVis.classList.remove('active');
        if (leftToolsPanel) leftToolsPanel.classList.remove('hidden-mode');
        this.showTrashZone(false);
        this.refreshMapData();
        this.ui.renderSidebar();
        if (this.mapEngine && this.mapEngine.map) this.mapEngine.map.resize();
      });

      btnModeVis.addEventListener('click', () => {
        this.isOrganizerMode = false;
        btnModeVis.classList.add('active');
        btnModeOrg.classList.remove('active');
        if (leftToolsPanel) leftToolsPanel.classList.add('hidden-mode');
        this.showTrashZone(false);
        if (this.drawManager) this.drawManager.cancelDraw();
        this.refreshMapData();
        this.ui.renderSidebar();
        if (this.mapEngine && this.mapEngine.map) this.mapEngine.map.resize();
      });
    }

    // Drawing Tool Buttons
    const btnDrawPoly = document.getElementById('btn-draw-polygon');
    const btnDrawBox = document.getElementById('btn-draw-box');
    const btnShapeCircle = document.getElementById('btn-shape-circle');
    const btnShapeTriangle = document.getElementById('btn-shape-triangle');
    const btnDrawRoute = document.getElementById('btn-draw-route');
    const btnPlacePoi = document.getElementById('btn-place-poi');
    const guideBanner = document.getElementById('drawing-guide-banner');
    const guideText = document.getElementById('guide-text');
    const btnCancelDraw = document.getElementById('btn-cancel-draw');

    if (btnDrawPoly) {
      btnDrawPoly.addEventListener('click', () => {
        this.drawManager.setMode('polygon');
      });
    }
    if (btnDrawBox) {
      btnDrawBox.addEventListener('click', () => {
        this.drawManager.setMode('box');
      });
    }
    if (btnShapeCircle) {
      btnShapeCircle.addEventListener('click', () => {
        this.drawManager.setMode('circle');
      });
    }
    if (btnShapeTriangle) {
      btnShapeTriangle.addEventListener('click', () => {
        this.drawManager.setMode('triangle');
      });
    }
    if (btnDrawRoute) {
      btnDrawRoute.addEventListener('click', () => {
        this.drawManager.setMode('route');
      });
    }
    if (btnPlacePoi) {
      btnPlacePoi.addEventListener('click', () => {
        this.drawManager.setMode('point');
      });
    }
    if (btnCancelDraw) {
      btnCancelDraw.addEventListener('click', () => {
        this.drawManager.cancelDraw();
      });
    }

    // Precision Bar Controls - Rectangle
    const precPreset = document.getElementById('precision-preset-select');
    const boxWInput = document.getElementById('box-width-input');
    const boxLInput = document.getElementById('box-length-input');
    const boxRotInput = document.getElementById('box-rot-input');
    const btnRotSub = document.getElementById('btn-rot-sub');
    const btnRotAdd = document.getElementById('btn-rot-add');
    const areaPillVal = document.getElementById('box-area-pill-val');
    const btnClosePrec = document.getElementById('btn-close-precision');

    const presetValues = {
      'car-single': { w: 6, l: 3 },
      'box-double': { w: 10, l: 5 },
      'sponsor': { w: 12, l: 6 },
      'vip-lounge': { w: 20, l: 10 },
      'grand-pavilion': { w: 40, l: 15 },
      'gazebo-3x3': { w: 3, l: 3 }
    };

    const updatePrecDimensions = () => {
      const w = parseFloat(boxWInput.value) || 6;
      const l = parseFloat(boxLInput.value) || 3;
      const rot = parseFloat(boxRotInput.value) || 0;
      const preset = precPreset ? precPreset.value : 'custom';
      if (areaPillVal) areaPillVal.innerText = `${Math.round(w * l)} m²`;
      this.drawManager.setBoxDimensions(w, l, rot, preset);
    };

    if (precPreset) {
      precPreset.addEventListener('change', () => {
        const p = precPreset.value;
        if (presetValues[p]) {
          boxWInput.value = presetValues[p].w;
          boxLInput.value = presetValues[p].l;
        }
        updatePrecDimensions();
      });
    }

    if (boxWInput && boxLInput) {
      [boxWInput, boxLInput].forEach(inp => {
        inp.addEventListener('input', () => {
          if (precPreset) precPreset.value = 'custom';
          updatePrecDimensions();
        });
      });
    }

    if (boxRotInput) {
      boxRotInput.addEventListener('input', updatePrecDimensions);
    }

    if (btnRotSub && btnRotAdd) {
      btnRotSub.addEventListener('click', () => {
        let r = (parseFloat(boxRotInput.value) || 0) - 15;
        if (r < 0) r += 360;
        boxRotInput.value = r;
        updatePrecDimensions();
      });
      btnRotAdd.addEventListener('click', () => {
        let r = ((parseFloat(boxRotInput.value) || 0) + 15) % 360;
        boxRotInput.value = r;
        updatePrecDimensions();
      });
    }

    // Precision Bar Controls - Circle
    const circlePreset = document.getElementById('circle-preset-select');
    const circleDiaInput = document.getElementById('circle-diameter-input');
    const circleRadInput = document.getElementById('circle-radius-input');

    const circlePresetValues = {
      'circle-6': { r: 3, d: 6 },
      'circle-10': { r: 5, d: 10 },
      'circle-16': { r: 8, d: 16 },
      'circle-24': { r: 12, d: 24 },
      'circle-40': { r: 20, d: 40 }
    };

    const updateCircleDimensions = () => {
      const r = parseFloat(circleRadInput.value) || 5;
      const preset = circlePreset ? circlePreset.value : 'custom';
      if (areaPillVal) areaPillVal.innerText = `${Math.round(Math.PI * r * r)} m²`;
      this.drawManager.setCircleDimensions(r, preset);
    };

    if (circlePreset) {
      circlePreset.addEventListener('change', () => {
        const p = circlePreset.value;
        if (circlePresetValues[p]) {
          circleDiaInput.value = circlePresetValues[p].d;
          circleRadInput.value = circlePresetValues[p].r;
        }
        updateCircleDimensions();
      });
    }

    if (circleDiaInput) {
      circleDiaInput.addEventListener('input', () => {
        const d = parseFloat(circleDiaInput.value) || 10;
        circleRadInput.value = (d / 2).toFixed(1);
        if (circlePreset) circlePreset.value = 'custom';
        updateCircleDimensions();
      });
    }

    if (circleRadInput) {
      circleRadInput.addEventListener('input', () => {
        const r = parseFloat(circleRadInput.value) || 5;
        circleDiaInput.value = (r * 2).toFixed(1);
        if (circlePreset) circlePreset.value = 'custom';
        updateCircleDimensions();
      });
    }

    // Precision Bar Controls - Triangle
    const triPreset = document.getElementById('triangle-preset-select');
    const triBaseInput = document.getElementById('tri-base-input');
    const triHeightInput = document.getElementById('tri-height-input');
    const triRotInput = document.getElementById('tri-rot-input');
    const btnTriRotSub = document.getElementById('btn-tri-rot-sub');
    const btnTriRotAdd = document.getElementById('btn-tri-rot-add');

    const triPresetValues = {
      'tri-6': { b: 6, h: 6 },
      'tri-10': { b: 10, h: 10 },
      'tri-15': { b: 15, h: 12 },
      'tri-24': { b: 24, h: 16 }
    };

    const updateTriDimensions = () => {
      const b = parseFloat(triBaseInput.value) || 10;
      const h = parseFloat(triHeightInput.value) || 10;
      const rot = parseFloat(triRotInput.value) || 0;
      const preset = triPreset ? triPreset.value : 'custom';
      if (areaPillVal) areaPillVal.innerText = `${Math.round((b * h) / 2)} m²`;
      this.drawManager.setTriangleDimensions(b, h, rot, preset);
    };

    if (triPreset) {
      triPreset.addEventListener('change', () => {
        const p = triPreset.value;
        if (triPresetValues[p]) {
          triBaseInput.value = triPresetValues[p].b;
          triHeightInput.value = triPresetValues[p].h;
        }
        updateTriDimensions();
      });
    }

    if (triBaseInput && triHeightInput) {
      [triBaseInput, triHeightInput].forEach(inp => {
        inp.addEventListener('input', () => {
          if (triPreset) triPreset.value = 'custom';
          updateTriDimensions();
        });
      });
    }

    if (triRotInput) {
      triRotInput.addEventListener('input', updateTriDimensions);
    }

    if (btnTriRotSub && btnTriRotAdd) {
      btnTriRotSub.addEventListener('click', () => {
        let r = (parseFloat(triRotInput.value) || 0) - 15;
        if (r < 0) r += 360;
        triRotInput.value = r;
        updateTriDimensions();
      });
      btnTriRotAdd.addEventListener('click', () => {
        let r = ((parseFloat(triRotInput.value) || 0) + 15) % 360;
        triRotInput.value = r;
        updateTriDimensions();
      });
    }

    if (btnClosePrec) {
      btnClosePrec.addEventListener('click', () => {
        this.drawManager.cancelDraw();
      });
    }

    // Floating Trash Dropzone & Deletion Confirm Handlers
    const trashZoneEl = document.getElementById('floating-trash-zone');
    if (trashZoneEl) {
      trashZoneEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        trashZoneEl.classList.add('trash-hover');
      });

      trashZoneEl.addEventListener('dragleave', () => {
        trashZoneEl.classList.remove('trash-hover');
      });

      trashZoneEl.addEventListener('drop', (e) => {
        e.preventDefault();
        trashZoneEl.classList.remove('trash-hover');
        trashZoneEl.classList.remove('trash-active');

        try {
          const raw = e.dataTransfer.getData('text/plain');
          if (raw) {
            const data = JSON.parse(raw);
            let targetItem = null;
            if (data.type === 'attraction') {
              targetItem = this.data.attractions.find(a => a.id === data.id);
            } else if (data.type === 'zone') {
              targetItem = this.data.zones.find(z => z.id === data.id);
            } else if (data.type === 'route') {
              targetItem = this.data.routes.find(r => r.id === data.id);
            }
            if (targetItem) {
              this.openDeleteConfirmation(data.type, targetItem);
            }
          }
        } catch (err) {
          console.warn('Error reading dropped item in trash:', err);
        }
      });
    }

    const btnConfirmDel = document.getElementById('btn-confirm-delete');
    const btnCancelDel = document.getElementById('btn-cancel-delete');
    const btnCloseDel = document.getElementById('btn-close-delete-modal');

    if (btnConfirmDel) btnConfirmDel.addEventListener('click', () => this.confirmDelete());
    if (btnCancelDel) btnCancelDel.addEventListener('click', () => this.cancelDelete());
    if (btnCloseDel) btnCloseDel.addEventListener('click', () => this.cancelDelete());

    // 2D / 3D Buttons
    const btn2D = document.getElementById('btn-view-2d');
    const btn3D = document.getElementById('btn-view-3d');
    if (btn2D && btn3D) {
      btn2D.addEventListener('click', () => {
        btn2D.classList.add('active');
        btn3D.classList.remove('active');
        this.mapEngine.set2DMode();
      });

      btn3D.addEventListener('click', () => {
        btn3D.classList.add('active');
        btn2D.classList.remove('active');
        this.mapEngine.set3DMode(60, -25);
      });
    }

    // 3D Drone Orbit Button
    const btnOrbit = document.getElementById('btn-toggle-orbit');
    if (btnOrbit) {
      btnOrbit.addEventListener('click', () => {
        const isOrbiting = this.mapEngine.toggleOrbit();
        btnOrbit.classList.toggle('active', isOrbiting);
      });
    }

    // Layer Switcher Buttons
    document.querySelectorAll('.layer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const layer = btn.getAttribute('data-layer');
        this.mapEngine.setTileLayer(layer);
      });
    });

    // Close Modals
    document.querySelectorAll('.btn-close-modal, .btn-cancel-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.ui.closeAllModals();
      });
    });

    // Close modal on click outside container
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.ui.closeAllModals();
        }
      });
    });

    // Left Tools Panel Toggle (Collapsing & Reopening)
    const leftToolsPanelEl = document.getElementById('left-tools-panel');
    const btnToggleLeft = document.getElementById('btn-toggle-left-tools');
    const leftTabOpen = document.getElementById('left-tools-tab-open');

    const toggleLeftTools = (forceCollapse = null) => {
      if (!leftToolsPanelEl) return;
      const isCurrentlyCollapsed = leftToolsPanelEl.classList.contains('collapsed');
      const shouldCollapse = forceCollapse !== null ? forceCollapse : !isCurrentlyCollapsed;
      leftToolsPanelEl.classList.toggle('collapsed', shouldCollapse);

      let frames = 0;
      const animateResize = () => {
        if (this.mapEngine && this.mapEngine.map) {
          this.mapEngine.map.resize();
        }
        if (frames++ < 12) {
          requestAnimationFrame(animateResize);
        }
      };
      animateResize();
      setTimeout(() => {
        if (this.mapEngine && this.mapEngine.map) {
          this.mapEngine.map.resize();
        }
      }, 350);
    };

    if (btnToggleLeft) {
      btnToggleLeft.addEventListener('click', () => toggleLeftTools(true));
    }
    if (leftTabOpen) {
      leftTabOpen.addEventListener('click', () => toggleLeftTools(false));
    }

    // Sidebar Toggle Tab & Hide Button
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const btnHideSidebar = document.getElementById('btn-hide-sidebar');
    const sidebar = document.getElementById('sidebar');

    const toggleSidebar = (forceCollapse = null) => {
      if (!sidebar) return;
      const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
      const shouldCollapse = forceCollapse !== null ? forceCollapse : !isCurrentlyCollapsed;
      sidebar.classList.toggle('collapsed', shouldCollapse);

      if (sidebarToggle) {
        const icon = sidebarToggle.querySelector('i');
        if (icon) {
          icon.className = shouldCollapse ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right';
        }
        sidebarToggle.setAttribute('title', shouldCollapse ? 'Mostrar panel lateral' : 'Ocultar panel lateral');
      }

      let frames = 0;
      const animateResize = () => {
        if (this.mapEngine && this.mapEngine.map) {
          this.mapEngine.map.resize();
        }
        if (frames++ < 12) {
          requestAnimationFrame(animateResize);
        }
      };
      animateResize();
      setTimeout(() => {
        if (this.mapEngine && this.mapEngine.map) {
          this.mapEngine.map.resize();
        }
      }, 350);
    };

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => toggleSidebar());
    }
    if (btnHideSidebar) {
      btnHideSidebar.addEventListener('click', () => toggleSidebar(true));
    }

    // --- Photo Upload Handling in Attraction Modal ---
    const fileInput = document.getElementById('attr-photo-file-input');
    const uploaderBox = document.getElementById('attr-photo-upload-box');
    const btnAddPhotoUrl = document.getElementById('btn-add-photo-url');
    const photoUrlInput = document.getElementById('attr-photo-url-input');

    if (uploaderBox && fileInput) {
      uploaderBox.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.ui.tempUploadedPhotos.push(event.target.result);
            this.ui._renderPhotoUploadPreview();
          };
          reader.readAsDataURL(file);
        });
      });
    }

    if (btnAddPhotoUrl && photoUrlInput) {
      btnAddPhotoUrl.addEventListener('click', () => {
        const url = photoUrlInput.value.trim();
        if (url) {
          this.ui.tempUploadedPhotos.push(url);
          photoUrlInput.value = '';
          this.ui._renderPhotoUploadPreview();
        }
      });
    }

    // --- Attraction Form Submission ---
    const attrForm = document.getElementById('attraction-form');
    if (attrForm) {
      attrForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feat = this.ui.editingFeature;

        const title = document.getElementById('attr-title').value.trim();
        const subtitle = document.getElementById('attr-subtitle').value.trim();
        const category = document.getElementById('attr-category').value;
        const year = parseInt(document.getElementById('attr-year').value, 10) || null;
        const hp = document.getElementById('attr-hp').value.trim();
        const engine = document.getElementById('attr-engine').value.trim();
        const owner = document.getElementById('attr-owner').value.trim();
        const badge = document.getElementById('attr-badge').value.trim();
        const desc = document.getElementById('attr-desc').value.trim();
        const soundRev = document.getElementById('attr-sound').value;

        if (feat.data) {
          // Editing existing attraction
          feat.data.title = title;
          feat.data.subtitle = subtitle;
          feat.data.category = category;
          feat.data.year = year;
          feat.data.hp = hp;
          feat.data.engine = engine;
          feat.data.owner = owner;
          feat.data.badge = badge;
          feat.data.description = desc;
          feat.data.soundRev = soundRev;
          feat.data.photos = [...this.ui.tempUploadedPhotos];
        } else {
          // New attraction with validated coordinates
          const center = this.mapEngine ? this.mapEngine.map.getCenter() : { lng: -57.6972, lat: -36.3265 };
          const coords = (feat && feat.coords && Array.isArray(feat.coords) && feat.coords.length === 2 && !isNaN(feat.coords[0]))
            ? feat.coords
            : [center.lng, center.lat];

          const newAttr = {
            id: 'car-' + Date.now(),
            title: title,
            subtitle: subtitle,
            category: category,
            year: year,
            hp: hp,
            engine: engine,
            owner: owner,
            badge: badge || 'Destacado',
            description: desc,
            soundRev: soundRev,
            coordinates: coords,
            photos: [...this.ui.tempUploadedPhotos]
          };
          this.data.attractions.push(newAttr);
        }

        const isEditing = Boolean(feat && feat.data);
        this.ui.closeAllModals();
        this.refreshMapData();
        this.ui.renderSidebar();
        this.ui.showToast(isEditing ? `Cambios guardados: ${title}` : `Auto añadido con éxito: ${title}`);
      });
    }

    // --- Zone Form Submission ---
    const zoneForm = document.getElementById('zone-form');
    if (zoneForm) {
      zoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feat = this.ui.editingFeature;

        const name = document.getElementById('zone-name-input').value.trim();
        const category = document.getElementById('zone-cat-select').value;
        const color = document.getElementById('zone-color-input').value;
        const height = parseFloat(document.getElementById('zone-height-input').value) || 4;
        const opacity = parseFloat(document.getElementById('zone-opacity-input').value) || 0.7;
        const desc = document.getElementById('zone-desc-input').value.trim();

        if (feat.data) {
          // Editing existing zone
          feat.data.name = name;
          feat.data.category = category;
          feat.data.color = color;
          feat.data.height = height;
          feat.data.opacity = opacity;
          feat.data.description = desc;
          if (feat.ring) feat.data.coordinates = feat.ring;
          if (feat.area) feat.data.area = feat.area;
          if (feat.dimensions) feat.data.dimensions = feat.dimensions;
        } else {
          // New Zone from Polygon or Precise Box Drawing
          const newZone = {
            id: 'zone-' + Date.now(),
            name: name,
            category: category,
            color: color,
            height: height,
            opacity: opacity,
            description: desc,
            area: feat.area,
            dimensions: feat.dimensions || (feat.meta && feat.meta.isPreciseBox ? { width: feat.meta.width, length: feat.meta.length, rotation: feat.meta.rotation } : null),
            coordinates: feat.ring
          };
          this.data.zones.push(newZone);
        }

        this.refreshMapData();
        this.ui.renderSidebar();
        this.ui.closeAllModals();
      });
    }

    // --- Route Form Submission ---
    const routeForm = document.getElementById('route-form');
    if (routeForm) {
      routeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feat = this.ui.editingFeature;

        const name = document.getElementById('route-name-input').value.trim();
        const color = document.getElementById('route-color-input').value;
        const width = parseFloat(document.getElementById('route-width-input').value) || 6;
        const desc = document.getElementById('route-desc-input').value.trim();

        if (feat.data) {
          // Editing existing route
          feat.data.name = name;
          feat.data.color = color;
          feat.data.width = width;
          feat.data.description = desc;
        } else {
          // New Route from Line Drawing
          const newRoute = {
            id: 'route-' + Date.now(),
            name: name,
            category: 'track',
            color: color,
            width: width,
            description: desc,
            lengthMeters: feat.length,
            coordinates: feat.line
          };
          this.data.routes.push(newRoute);
        }

        this.refreshMapData();
        this.ui.renderSidebar();
        this.ui.closeAllModals();
      });
    }

    // --- Import / Export Modal Controls ---
    const btnOpenImpExp = document.getElementById('btn-open-import-export');
    if (btnOpenImpExp) {
      btnOpenImpExp.addEventListener('click', () => {
        this.ui.importExportModal.classList.add('open');
      });
    }

    // Download JSON Project
    const btnExportJson = document.getElementById('btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        const jsonStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mapametric-${this.activeProject?.id || this.currentLocationId}-plan.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Download GeoJSON
    const btnExportGeoJson = document.getElementById('btn-export-geojson');
    if (btnExportGeoJson) {
      btnExportGeoJson.addEventListener('click', () => {
        const geojson = {
          type: 'FeatureCollection',
          features: [
            ...this.data.zones.map(z => ({
              type: 'Feature',
              properties: { ...z, featureType: 'zone' },
              geometry: { type: 'Polygon', coordinates: [z.coordinates] }
            })),
            ...this.data.routes.map(r => ({
              type: 'Feature',
              properties: { ...r, featureType: 'route' },
              geometry: { type: 'LineString', coordinates: r.coordinates }
            })),
            ...this.data.attractions.map(a => ({
              type: 'Feature',
              properties: { ...a, featureType: 'attraction' },
              geometry: { type: 'Point', coordinates: a.coordinates }
            }))
          ]
        };
        const jsonStr = JSON.stringify(geojson, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/geo+json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mapametric-${this.activeProject?.id || this.currentLocationId}.geojson`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Import File
    const fileImportInput = document.getElementById('file-import-input');
    if (fileImportInput) {
      fileImportInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.zones && parsed.attractions) {
              this.data = parsed;
              this.saveState();
              this.refreshMapData();
              this.ui.renderSidebar();
              this.ui.closeAllModals();
              this.ui.showToast('¡Plano importado exitosamente!');
            } else {
              this.ui.showToast('El archivo no posee un formato de plano válido.');
            }
          } catch (err) {
            this.ui.showToast('Error al leer el archivo JSON: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset to Dolores 2026 Default
    const btnResetDefault = document.getElementById('btn-reset-default');
    if (btnResetDefault) {
      btnResetDefault.addEventListener('click', () => {
        if (confirm('¿Restaurar el plano original de Dolores Marzo 2026? Se sobreescribirán los cambios no exportados.')) {
          this.data = JSON.parse(JSON.stringify(DOLORES_INITIAL_DATA));
          this.switchLocation('dolores-2026');
          this.refreshMapData();
          this.ui.renderSidebar();
          this.ui.closeAllModals();
        }
      });
    }
  }

  _updateDrawToolbarUI(mode) {
    const btnPoly = document.getElementById('btn-draw-polygon');
    const btnBox = document.getElementById('btn-draw-box');
    const btnCircle = document.getElementById('btn-shape-circle');
    const btnTriangle = document.getElementById('btn-shape-triangle');
    const btnRoute = document.getElementById('btn-draw-route');
    const btnPoi = document.getElementById('btn-place-poi');
    const precBar = document.getElementById('precision-bar');
    const precRectFields = document.getElementById('precision-rect-fields');
    const precCircleFields = document.getElementById('precision-circle-fields');
    const precTriangleFields = document.getElementById('precision-triangle-fields');
    const areaPillVal = document.getElementById('box-area-pill-val');
    const banner = document.getElementById('drawing-guide-banner');
    const guideText = document.getElementById('guide-text');

    if (btnPoly) btnPoly.classList.toggle('active', mode === 'polygon');
    if (btnBox) btnBox.classList.toggle('active', mode === 'box');
    if (btnCircle) btnCircle.classList.toggle('active', mode === 'circle');
    if (btnTriangle) btnTriangle.classList.toggle('active', mode === 'triangle');
    if (btnRoute) btnRoute.classList.toggle('active', mode === 'route');
    if (btnPoi) btnPoi.classList.toggle('active', mode === 'point');

    const isGeometricShape = (mode === 'box' || mode === 'circle' || mode === 'triangle');
    if (precBar) precBar.classList.toggle('show', isGeometricShape);

    if (precRectFields) precRectFields.style.display = (mode === 'box') ? 'flex' : 'none';
    if (precCircleFields) precCircleFields.style.display = (mode === 'circle') ? 'flex' : 'none';
    if (precTriangleFields) precTriangleFields.style.display = (mode === 'triangle') ? 'flex' : 'none';

    if (mode === 'box') {
      if (areaPillVal) areaPillVal.innerText = `${Math.round(this.drawManager.boxWidth * this.drawManager.boxLength)} m²`;
      banner.classList.add('show');
      guideText.innerHTML = `<strong>Rectángulo ${this.drawManager.boxWidth}×${this.drawManager.boxLength}m (${Math.round(this.drawManager.boxWidth * this.drawManager.boxLength)} m²)</strong> &bull; Toca para ubicar`;
    } else if (mode === 'circle') {
      const area = Math.round(Math.PI * this.drawManager.circleRadius * this.drawManager.circleRadius);
      if (areaPillVal) areaPillVal.innerText = `${area} m²`;
      banner.classList.add('show');
      guideText.innerHTML = `<strong>Círculo Ø ${Math.round(this.drawManager.circleRadius * 2)}m (Radio: ${this.drawManager.circleRadius}m, ${area} m²)</strong> &bull; Toca para ubicar`;
    } else if (mode === 'triangle') {
      const area = Math.round((this.drawManager.triangleBase * this.drawManager.triangleHeight) / 2);
      if (areaPillVal) areaPillVal.innerText = `${area} m²`;
      banner.classList.add('show');
      guideText.innerHTML = `<strong>Triángulo ${this.drawManager.triangleBase}×${this.drawManager.triangleHeight}m (${area} m²)</strong> &bull; Giro: ${this.drawManager.triangleRotation}° &bull; Toca para ubicar`;
    } else if (mode === 'polygon') {
      banner.classList.add('show');
      guideText.innerHTML = `Toca para marcar vértices. <strong>Doble clic</strong> para cerrar.`;
    } else if (mode === 'route') {
      banner.classList.add('show');
      guideText.innerHTML = `Toca para trazar camino. <strong>Doble clic</strong> para finalizar.`;
    } else if (mode === 'point') {
      banner.classList.add('show');
      guideText.innerHTML = `Toca en el mapa para situar el auto o atracción.`;
    } else {
      banner.classList.remove('show');
    }
  }

  _updateDrawProgressUI(data) {
    const guideText = document.getElementById('guide-text');
    if (!guideText) return;

    if (data.mode === 'box') {
      guideText.innerHTML = `<strong>${data.width}×${data.length}m</strong> &bull; Giro: ${data.rotation}° &bull; Toca para ubicar`;
    } else if (data.mode === 'circle') {
      guideText.innerHTML = `<strong>Círculo Ø ${Math.round(data.radius * 2)}m</strong> &bull; Superficie: <strong>${Math.round(Math.PI * data.radius * data.radius).toLocaleString()} m²</strong> &bull; Toca para ubicar`;
    } else if (data.mode === 'triangle') {
      guideText.innerHTML = `<strong>Triángulo ${data.base}×${data.height}m</strong> &bull; Giro: ${data.rotation}° &bull; Superficie: <strong>${Math.round((data.base * data.height) / 2).toLocaleString()} m²</strong> &bull; Toca para ubicar`;
    } else if (data.mode === 'polygon') {
      guideText.innerHTML = `Lado: <strong>${Math.round(data.currentSegmentM)}m</strong> &bull; Superficie: <strong>${data.liveAreaM2.toLocaleString()}m²</strong> &bull; <strong>Doble clic</strong> para cerrar`;
    } else if (data.mode === 'route') {
      guideText.innerHTML = `Tramo: <strong>${Math.round(data.currentSegmentM)}m</strong> &bull; Total: <strong>${Math.round(data.totalLengthM)}m</strong> &bull; <strong>Doble clic</strong> para finalizar`;
    }
  }

  // --- Floating Trash & Deletion Confirmation Flow ---
  showTrashZone(show) {
    const trash = document.getElementById('floating-trash-zone');
    if (!trash) return;
    if (!this.isOrganizerMode) {
      trash.style.display = 'none';
      return;
    }
    trash.style.display = 'flex';
    trash.classList.toggle('trash-active', Boolean(show));
    if (!show) {
      trash.classList.remove('trash-hover');
    }
  }

  checkMarkerOverTrash(marker) {
    const trash = document.getElementById('floating-trash-zone');
    if (!trash || !this.mapEngine || !this.mapEngine.map) return false;
    const lngLat = marker.getLngLat();
    const screenPt = this.mapEngine.map.project(lngLat);
    const canvasRect = this.mapEngine.map.getCanvas().getBoundingClientRect();
    const clientX = canvasRect.left + screenPt.x;
    const clientY = canvasRect.top + screenPt.y;
    return this.checkPointOverTrash(clientX, clientY);
  }

  checkPointOverTrash(clientX, clientY) {
    const trash = document.getElementById('floating-trash-zone');
    if (!trash) return false;
    const rect = trash.getBoundingClientRect();
    const margin = 20;
    const isOver = (
      clientX >= rect.left - margin &&
      clientX <= rect.right + margin &&
      clientY >= rect.top - margin &&
      clientY <= rect.bottom + margin
    );
    trash.classList.toggle('trash-hover', isOver);
    return isOver;
  }

  openDeleteConfirmation(type, item, marker = null) {
    this.pendingDeleteItem = { type, item, marker };
    const modal = document.getElementById('delete-confirm-modal');
    const titleEl = document.getElementById('delete-confirm-title');
    const descEl = document.getElementById('delete-confirm-desc');
    const previewEl = document.getElementById('delete-item-preview');
    if (!modal) return;

    if (type === 'attraction') {
      if (titleEl) titleEl.innerText = `¿Eliminar "${item.title}" del plano?`;
      if (descEl) descEl.innerText = 'Se removerá el vehículo clásico y su ficha del mapa del evento.';
      if (previewEl) {
        const photo = (item.photos && item.photos.length > 0) ? item.photos[0] : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80';
        previewEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;text-align:left;">
            <img src="${photo}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;border:1px solid #d4af37;" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80'" />
            <div>
              <div style="color:#f3f4f6;font-size:0.95rem;font-weight:700;">${item.title}</div>
              <div style="font-size:0.75rem;color:#9ca3af;">${item.subtitle || ''} ${item.year ? `(${item.year})` : ''}</div>
            </div>
          </div>
        `;
      }
    } else if (type === 'zone') {
      if (titleEl) titleEl.innerText = `¿Eliminar la zona "${item.name}"?`;
      if (descEl) descEl.innerText = 'Se removerá la parcela, stand o área delimitada con sus dimensiones.';
      if (previewEl) {
        previewEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;text-align:left;">
            <div style="width:24px;height:24px;border-radius:4px;background-color:${item.color || '#d4af37'};border:1px solid rgba(255,255,255,0.4);flex-shrink:0;"></div>
            <div>
              <div style="color:#f3f4f6;font-size:0.95rem;font-weight:700;">${item.name}</div>
              <div style="font-size:0.75rem;color:#9ca3af;">Superficie: ${item.area ? item.area.toLocaleString() + ' m²' : 'N/D'}</div>
            </div>
          </div>
        `;
      }
    } else if (type === 'route') {
      if (titleEl) titleEl.innerText = `¿Eliminar el trazado "${item.name}"?`;
      if (descEl) descEl.innerText = 'Se eliminará la ruta dinámica o recorrido del mapa.';
      if (previewEl) {
        previewEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;text-align:left;">
            <div style="width:28px;height:8px;border-radius:4px;background-color:${item.color || '#ef4444'};flex-shrink:0;"></div>
            <div>
              <div style="color:#f3f4f6;font-size:0.95rem;font-weight:700;">${item.name}</div>
              <div style="font-size:0.75rem;color:#9ca3af;">Longitud: ${item.lengthMeters ? item.lengthMeters.toLocaleString() + ' m' : 'N/D'}</div>
            </div>
          </div>
        `;
      }
    }

    modal.classList.add('open');
  }

  cancelDelete() {
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) modal.classList.remove('open');
    if (this.pendingDeleteItem) {
      const { type, item, marker } = this.pendingDeleteItem;
      if (marker) {
        marker.setLngLat(item.coordinates);
        this.mapEngine.renderClusteredMarkers();
      } else if (type === 'zone' || type === 'route') {
        this.refreshMapData();
      }
      this.pendingDeleteItem = null;
    }
    this.showTrashZone(false);
  }

  confirmDelete() {
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) modal.classList.remove('open');
    if (!this.pendingDeleteItem) return;

    const { type, item } = this.pendingDeleteItem;
    const itemName = item.title || item.name || 'Elemento';

    if (type === 'attraction') {
      this.deleteAttraction(item.id);
    } else if (type === 'zone') {
      this.deleteZone(item.id);
    } else if (type === 'route') {
      this.deleteRoute(item.id);
    }

    this.pendingDeleteItem = null;
    this.showTrashZone(false);
    this.ui.showToast(`"${itemName}" ha sido eliminado del plano`);
  }

  deleteZone(zoneId) {
    this.data.zones = this.data.zones.filter(z => z.id !== zoneId);
    this.refreshMapData();
    this.ui.renderSidebar();
  }

  deleteRoute(routeId) {
    this.data.routes = this.data.routes.filter(r => r.id !== routeId);
    this.refreshMapData();
    this.ui.renderSidebar();
  }

  deleteAttraction(attrId) {
    this.data.attractions = this.data.attractions.filter(a => a.id !== attrId);
    this.refreshMapData();
    this.ui.renderSidebar();
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.carbriataApp = new CarbriataApp();
  window.carbriataApp.init();
});
