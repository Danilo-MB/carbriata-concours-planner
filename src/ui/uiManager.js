/**
 * CARBRIATA CONCOURS - UI Manager
 * Handles sidebars, modals, photo uploaders, spotlight lightbox, and data synchronization
 */

import { engineAudio } from '../utils/audio.js';
import { CATEGORIES } from '../data/defaultData.js';

export class UIManager {
  constructor(app) {
    this.app = app;
    this.currentTab = 'cars'; // 'cars' | 'zones' | 'routes' | 'locations'
    this.currentCategoryFilter = 'all';
    this.searchQuery = '';
    this.tempUploadedPhotos = [];
    this.editingFeature = null; // { type: 'attraction'|'zone'|'route', data: ... }

    this._bindElements();
    this._setupTabListeners();
    this._setupSearchListeners();
  }

  _bindElements() {
    this.sidebarContent = document.getElementById('sidebar-content');
    this.statCars = document.getElementById('stat-cars');
    this.statZones = document.getElementById('stat-zones');
    this.statArea = document.getElementById('stat-area');
    
    // Modals
    this.attractionModal = document.getElementById('attraction-modal');
    this.zoneModal = document.getElementById('zone-modal');
    this.routeModal = document.getElementById('route-modal');
    this.spotlightModal = document.getElementById('spotlight-modal');
    this.importExportModal = document.getElementById('import-export-modal');
  }

  _setupTabListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const targetTab = btn.getAttribute('data-tab');
        btn.classList.add('active');
        this.currentTab = targetTab;
        this.renderSidebar();
      });
    });

    document.querySelectorAll('.chip-filter').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip-filter').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategoryFilter = chip.getAttribute('data-cat');
        this.renderSidebar();
      });
    });
  }

  _setupSearchListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderSidebar();
      });
    }
  }

  renderSidebar() {
    if (!this.sidebarContent) return;
    this.sidebarContent.innerHTML = '';

    if (this.currentTab === 'cars') {
      this._renderAttractionsList();
    } else if (this.currentTab === 'zones') {
      this._renderZonesList();
    } else if (this.currentTab === 'routes') {
      this._renderRoutesList();
    } else if (this.currentTab === 'locations') {
      this._renderLocationsList();
    }

    this.updateStats();
  }

  updateStats() {
    const carsCount = this.app.data.attractions.length;
    const zonesCount = this.app.data.zones.length;
    const totalAreaM2 = this.app.data.zones.reduce((sum, z) => sum + (z.area || 0), 0);
    const totalHectares = (totalAreaM2 / 10000).toFixed(1);

    if (this.statCars) this.statCars.innerText = carsCount;
    if (this.statZones) this.statZones.innerText = zonesCount;
    if (this.statArea) this.statArea.innerText = `${totalHectares} ha`;
  }

  _renderAttractionsList() {
    let items = this.app.data.attractions;

    // Quick Add Car Button at top of sidebar list for organizers
    if (this.app.isOrganizerMode) {
      const addBanner = document.createElement('div');
      addBanner.className = 'sidebar-add-car-banner';
      addBanner.innerHTML = `
        <button type="button" class="btn-sidebar-add-car" id="btn-sidebar-add-car">
          <i class="fa-solid fa-plus-circle"></i> Añadir Auto al Plano
        </button>
      `;
      this.sidebarContent.appendChild(addBanner);

      addBanner.querySelector('#btn-sidebar-add-car').addEventListener('click', () => {
        this.app.drawManager.setMode('point');
        this.showToast('Haz clic en el mapa donde quieras ubicar el auto');
      });
    }

    // Filter by Category
    if (this.currentCategoryFilter !== 'all') {
      items = items.filter(i => i.category === this.currentCategoryFilter);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      items = items.filter(i => 
        (i.title && i.title.toLowerCase().includes(this.searchQuery)) ||
        (i.subtitle && i.subtitle.toLowerCase().includes(this.searchQuery)) ||
        (i.owner && i.owner.toLowerCase().includes(this.searchQuery)) ||
        (i.engine && i.engine.toLowerCase().includes(this.searchQuery))
      );
    }

    if (items.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.cssText = 'text-align: center; padding: 40px 10px; color: var(--text-muted);';
      emptyMsg.innerHTML = `
        <i class="fa-solid fa-car-tunnel" style="font-size: 2rem; margin-bottom: 10px; color: var(--gold-500); opacity: 0.5;"></i>
        <p>No se encontraron autos o atracciones con ese criterio.</p>
      `;
      this.sidebarContent.appendChild(emptyMsg);
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';

      const photoUrl = (item.photos && item.photos.length > 0)
        ? item.photos[0]
        : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';

      const photoCount = item.photos ? item.photos.length : 0;
      const catConfig = CATEGORIES[item.category] || CATEGORIES.cars;

      card.innerHTML = `
        <div class="item-card-header">
          <img src="${photoUrl}" class="item-card-img" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80'" />
          <span class="item-card-badge" style="background: ${catConfig.color}">${item.badge || catConfig.label}</span>
          <span class="item-photo-count"><i class="fa-solid fa-images"></i> ${photoCount}</span>
        </div>
        <div class="item-card-body">
          <div class="item-title">
            <span>${item.title}</span>
            <span class="item-year">${item.year || ''}</span>
          </div>
          <div class="item-subtitle">${item.subtitle || ''}</div>
          <div class="item-specs-row">
            <span class="item-spec"><i class="fa-solid fa-gauge-high"></i> ${item.hp || 'N/D'}</span>
            <span class="item-spec"><i class="fa-solid fa-gears"></i> ${item.engine ? item.engine.substring(0, 18) : 'N/D'}</span>
          </div>
          <div class="item-actions-bar">
            <button class="btn-card-action btn-fly-card" title="Centrar en mapa"><i class="fa-solid fa-location-crosshairs"></i> Ubicación</button>
            ${item.soundRev ? `<button class="btn-card-action btn-sound-rev" title="Escuchar aceleración"><i class="fa-solid fa-volume-high"></i> Acelerar</button>` : ''}
            <button class="btn-card-action btn-view-photos"><i class="fa-solid fa-expand"></i> Fotos</button>
            ${this.app.isOrganizerMode ? `
              <button class="btn-card-action btn-edit-card" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="btn-card-action btn-delete-card" style="color: #ef4444;" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            ` : ''}
          </div>
        </div>
      `;

      // Event listeners
      card.querySelector('.btn-fly-card').addEventListener('click', (e) => {
        e.stopPropagation();
        this.app.mapEngine.flyTo(item.coordinates, 18, 65, -30);
      });

      const soundBtn = card.querySelector('.btn-sound-rev');
      if (soundBtn) {
        soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          engineAudio.playRev(item.soundRev);
        });
      }

      card.querySelector('.btn-view-photos').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openSpotlight(item);
      });

      if (this.app.isOrganizerMode) {
        const editBtn = card.querySelector('.btn-edit-card');
        if (editBtn) {
          editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openAttractionEditor(item);
          });
        }

        const deleteBtn = card.querySelector('.btn-delete-card');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar la atracción "${item.title}" del plano?`)) {
              this.app.deleteAttraction(item.id);
            }
          });
        }
      }

      // Clicking whole card opens spotlight
      card.addEventListener('click', () => {
        this.app.mapEngine.flyTo(item.coordinates, 17.5, 60, -20);
        this.openSpotlight(item);
      });

      this.sidebarContent.appendChild(card);
    });
  }

  _renderZonesList() {
    const zones = this.app.data.zones;
    if (zones.length === 0) {
      this.sidebarContent.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">No hay zonas delimitadas todavía. Usa la herramienta "Delimitar Área" en el mapa para crear stands o parcelas.</p>`;
      return;
    }

    zones.forEach(zone => {
      const card = document.createElement('div');
      card.className = 'zone-card';
      const catConfig = CATEGORIES[zone.category] || CATEGORIES.paddock;

      card.innerHTML = `
        <div class="zone-card-top">
          <div class="zone-indicator-name">
            <span class="zone-color-dot" style="background-color: ${zone.color};"></span>
            <span class="zone-name">${zone.name}</span>
          </div>
          <span style="font-size: 0.72rem; color: var(--gold-400); font-weight: 700;">${zone.height || 4}m 3D</span>
        </div>
        <p style="font-size: 0.78rem; color: var(--text-muted);">${zone.description || 'Zona del evento sin descripción adicional.'}</p>
        <div class="zone-metrics">
          <span>Superficie: <strong>${(zone.area || 0).toLocaleString()} m²</strong></span>
          <span>Categoría: <strong>${catConfig.label}</strong></span>
        </div>
        <div class="item-actions-bar">
          <button class="btn-card-action btn-zone-fly"><i class="fa-solid fa-eye"></i> Ver en 3D</button>
          ${this.app.isOrganizerMode ? `
            <button class="btn-card-action btn-zone-edit"><i class="fa-solid fa-pen"></i> Editar</button>
            <button class="btn-card-action btn-zone-delete" style="color: #ef4444;"><i class="fa-solid fa-trash"></i></button>
          ` : ''}
        </div>
      `;

      card.querySelector('.btn-zone-fly').addEventListener('click', (e) => {
        e.stopPropagation();
        if (zone.coordinates && zone.coordinates.length > 0) {
          this.app.mapEngine.set3DMode(65, -35);
          this.app.mapEngine.flyTo(zone.coordinates[0], 17.2, 65, -35);
        }
      });

      if (this.app.isOrganizerMode) {
        card.querySelector('.btn-zone-edit').addEventListener('click', (e) => {
          e.stopPropagation();
          this.openZoneEditor(zone);
        });

        card.querySelector('.btn-zone-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`¿Eliminar la zona "${zone.name}"?`)) {
            this.app.deleteZone(zone.id);
          }
        });
      }

      this.sidebarContent.appendChild(card);
    });
  }

  _renderRoutesList() {
    const routes = this.app.data.routes;
    if (routes.length === 0) {
      this.sidebarContent.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">No hay rutas trazadas. Usa la herramienta "Trazar Ruta" para definir el recorrido dinámico, desfile o accesos.</p>`;
      return;
    }

    routes.forEach(route => {
      const card = document.createElement('div');
      card.className = 'zone-card';

      card.innerHTML = `
        <div class="zone-card-top">
          <div class="zone-indicator-name">
            <span class="zone-color-dot" style="background-color: ${route.color};"></span>
            <span class="zone-name">${route.name}</span>
          </div>
          <span style="font-size: 0.72rem; color: var(--gold-400); font-weight: 700;">${(route.lengthMeters || 0).toLocaleString()} m</span>
        </div>
        <p style="font-size: 0.78rem; color: var(--text-muted);">${route.description || ''}</p>
        <div class="item-actions-bar">
          <button class="btn-card-action btn-route-fly"><i class="fa-solid fa-road"></i> Seguir Trazado</button>
          ${this.app.isOrganizerMode ? `
            <button class="btn-card-action btn-route-edit"><i class="fa-solid fa-pen"></i> Editar</button>
            <button class="btn-card-action btn-route-delete" style="color: #ef4444;"><i class="fa-solid fa-trash"></i></button>
          ` : ''}
        </div>
      `;

      card.querySelector('.btn-route-fly').addEventListener('click', (e) => {
        e.stopPropagation();
        if (route.coordinates && route.coordinates.length > 0) {
          const mid = route.coordinates[Math.floor(route.coordinates.length / 2)];
          this.app.mapEngine.flyTo(mid, 16.5, 60, -25);
        }
      });

      if (this.app.isOrganizerMode) {
        card.querySelector('.btn-route-edit').addEventListener('click', (e) => {
          e.stopPropagation();
          this.openRouteEditor(route);
        });

        card.querySelector('.btn-route-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`¿Eliminar la ruta "${route.name}"?`)) {
            this.app.deleteRoute(route.id);
          }
        });
      }

      this.sidebarContent.appendChild(card);
    });
  }

  _renderLocationsList() {
    const locations = this.app.locations;

    const header = document.createElement('div');
    header.style.padding = '8px 0';
    header.innerHTML = `
      <p style="font-size: 0.8rem; color: var(--gold-300); margin-bottom: 10px;">
        <i class="fa-solid fa-map-location-dot"></i> <strong>Seleccionar o Crear Locación:</strong><br>
        La app puede utilizarse un año en una locación y otro año en otra, manteniendo o rediseñando el trazado.
      </p>
    `;
    this.sidebarContent.appendChild(header);

    locations.forEach(loc => {
      const isCurrent = this.app.currentLocationId === loc.id;
      const card = document.createElement('div');
      card.className = `zone-card ${isCurrent ? 'selected' : ''}`;

      card.innerHTML = `
        <div class="zone-card-top">
          <span class="zone-name" style="font-size: 0.95rem; color: ${isCurrent ? 'var(--gold-400)' : '#fff'}">
            ${isCurrent ? '<i class="fa-solid fa-check-circle" style="color: var(--gold-500); margin-right: 6px;"></i>' : ''}
            ${loc.name}
          </span>
        </div>
        <p style="font-size: 0.74rem; color: var(--gold-500); font-weight: 600;">${loc.edition}</p>
        <p style="font-size: 0.78rem; color: var(--text-muted);">${loc.description}</p>
        <div class="item-actions-bar">
          <button class="btn-card-action btn-switch-loc" style="width: 100%; text-align: center; justify-content: center; background: ${isCurrent ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.06)'};">
            ${isCurrent ? 'Locación Activa' : 'Viajar a esta Locación'}
          </button>
        </div>
      `;

      card.querySelector('.btn-switch-loc').addEventListener('click', () => {
        this.app.switchLocation(loc.id);
      });

      this.sidebarContent.appendChild(card);
    });

    // Custom Venue Button
    const customCard = document.createElement('div');
    customCard.className = 'zone-card';
    customCard.style.borderStyle = 'dashed';
    customCard.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <i class="fa-solid fa-plus-circle" style="font-size: 1.5rem; color: var(--gold-400); margin-bottom: 8px;"></i>
        <h4 style="font-size: 0.9rem; color: #fff;">Definir Nuevo Predio o Circuito</h4>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Navega el mapa hasta cualquier estancia, club de polo o autódromo y guárdalo como nueva sede.</p>
        <button class="btn-gold" id="btn-save-custom-loc" style="margin-top: 10px; font-size: 0.76rem;">Guardar Vista Actual como Nueva Locación</button>
      </div>
    `;

    customCard.querySelector('#btn-save-custom-loc').addEventListener('click', () => {
      const name = prompt('Nombre del nuevo predio o circuito (ej: Estancia Los Álamos / Autódromo Oscar Gálvez):');
      if (name) {
        const center = this.app.mapEngine.map.getCenter();
        const newLoc = {
          id: 'custom-' + Date.now(),
          name: name,
          city: 'Locación Personalizada',
          edition: 'Nueva Edición',
          coordinates: [center.lng, center.lat],
          zoom: this.app.mapEngine.map.getZoom(),
          pitch: this.app.mapEngine.map.getPitch(),
          bearing: this.app.mapEngine.map.getBearing(),
          description: 'Predio personalizado delimitado por el organizador.'
        };
        this.app.locations.push(newLoc);
        this.app.switchLocation(newLoc.id);
      }
    });

    this.sidebarContent.appendChild(customCard);
  }

  // --- Lightbox / Spotlight Modal ---
  openSpotlight(item) {
    if (!this.spotlightModal) return;

    const heroImg = document.getElementById('spotlight-hero-img');
    const badge = document.getElementById('spotlight-badge');
    const title = document.getElementById('spotlight-title');
    const subtitle = document.getElementById('spotlight-subtitle');
    const desc = document.getElementById('spotlight-desc');
    const thumbsContainer = document.getElementById('spotlight-thumbs');
    const specsGrid = document.getElementById('spotlight-specs-grid');
    const revSoundBtn = document.getElementById('spotlight-rev-btn');

    title.innerText = item.title;
    subtitle.innerText = item.subtitle || '';
    desc.innerText = item.description || 'Sin detalles adicionales.';
    badge.innerText = item.badge || item.category.toUpperCase();

    // Specs
    specsGrid.innerHTML = `
      <div class="spec-box"><span class="spec-box-label">Año</span><span class="spec-box-val">${item.year || 'N/D'}</span></div>
      <div class="spec-box"><span class="spec-box-label">Potencia</span><span class="spec-box-val">${item.hp || 'N/D'}</span></div>
      <div class="spec-box"><span class="spec-box-label">Motor</span><span class="spec-box-val">${item.engine || 'N/D'}</span></div>
      <div class="spec-box"><span class="spec-box-label">Expositor</span><span class="spec-box-val" style="font-size: 0.8rem;">${item.owner ? item.owner.substring(0, 16) : 'N/D'}</span></div>
    `;

    // Sound button
    if (item.soundRev) {
      revSoundBtn.style.display = 'inline-flex';
      revSoundBtn.onclick = () => engineAudio.playRev(item.soundRev);
    } else {
      revSoundBtn.style.display = 'none';
    }

    // Photo Carousel
    const photos = (item.photos && item.photos.length > 0)
      ? item.photos
      : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'];

    heroImg.src = photos[0];
    thumbsContainer.innerHTML = '';

    photos.forEach((photo, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `spotlight-thumb ${idx === 0 ? 'active' : ''}`;
      thumb.innerHTML = `<img src="${photo}" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80'" />`;
      thumb.addEventListener('click', () => {
        heroImg.src = photo;
        document.querySelectorAll('.spotlight-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
      thumbsContainer.appendChild(thumb);
    });

    this.spotlightModal.classList.add('open');
  }

  // --- Attraction Editor Modal ---
  openAttractionEditor(item = null, defaultCoords = null) {
    this.closeAllModals();

    const center = this.app.mapEngine ? this.app.mapEngine.map.getCenter() : { lng: -57.6972, lat: -36.3265 };
    const validCoords = defaultCoords || [center.lng, center.lat];

    this.editingFeature = { type: 'attraction', data: item, coords: validCoords };
    const form = document.getElementById('attraction-form');
    form.reset();

    const titleInput = document.getElementById('attr-title');
    const subInput = document.getElementById('attr-subtitle');
    const catSelect = document.getElementById('attr-category');
    const yearInput = document.getElementById('attr-year');
    const hpInput = document.getElementById('attr-hp');
    const engineInput = document.getElementById('attr-engine');
    const ownerInput = document.getElementById('attr-owner');
    const badgeInput = document.getElementById('attr-badge');
    const descInput = document.getElementById('attr-desc');
    const soundSelect = document.getElementById('attr-sound');

    this.tempUploadedPhotos = [];

    const deleteBtn = document.getElementById('btn-delete-attr-modal');
    if (deleteBtn) {
      if (item) {
        deleteBtn.style.display = 'inline-flex';
        deleteBtn.onclick = () => {
          if (confirm(`¿Eliminar "${item.title}" del plano?`)) {
            this.app.deleteAttraction(item.id);
            this.closeAllModals();
          }
        };
      } else {
        deleteBtn.style.display = 'none';
      }
    }

    if (item) {
      document.getElementById('attr-modal-title').innerText = 'Editar Atracción / Auto Clásico';
      titleInput.value = item.title || '';
      subInput.value = item.subtitle || '';
      catSelect.value = item.category || 'cars';
      yearInput.value = item.year || '';
      hpInput.value = item.hp || '';
      engineInput.value = item.engine || '';
      ownerInput.value = item.owner || '';
      badgeInput.value = item.badge || '';
      descInput.value = item.description || '';
      soundSelect.value = item.soundRev || '';
      this.tempUploadedPhotos = item.photos ? [...item.photos] : [];
    } else {
      document.getElementById('attr-modal-title').innerText = 'Nueva Atracción o Auto en Mapa';
      this.editingFeature.coords = validCoords;
    }

    this._renderPhotoUploadPreview();
    this.attractionModal.classList.add('open');
  }

  _renderPhotoUploadPreview() {
    const previewContainer = document.getElementById('attr-photo-preview-grid');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';

    this.tempUploadedPhotos.forEach((url, idx) => {
      const card = document.createElement('div');
      card.className = 'photo-thumb-card';
      card.innerHTML = `
        <img src="${url}" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80'" />
        <button type="button" class="btn-remove-thumb" data-idx="${idx}"><i class="fa-solid fa-times"></i></button>
      `;
      card.querySelector('.btn-remove-thumb').addEventListener('click', (e) => {
        e.stopPropagation();
        this.tempUploadedPhotos.splice(idx, 1);
        this._renderPhotoUploadPreview();
      });
      previewContainer.appendChild(card);
    });
  }

  // --- Zone Editor Modal ---
  openZoneEditor(zone = null, defaultRing = null, areaM2 = 0, meta = null) {
    this.editingFeature = { type: 'zone', data: zone, ring: defaultRing, area: areaM2, meta: meta };
    const form = document.getElementById('zone-form');
    form.reset();

    const titleInput = document.getElementById('zone-name-input');
    const catSelect = document.getElementById('zone-cat-select');
    const colorInput = document.getElementById('zone-color-input');
    const heightInput = document.getElementById('zone-height-input');
    const heightVal = document.getElementById('zone-height-val');
    const opacityInput = document.getElementById('zone-opacity-input');
    const descInput = document.getElementById('zone-desc-input');
    const areaDisplay = document.getElementById('zone-area-display');
    const perimeterDisplay = document.getElementById('zone-perimeter-display');

    const editW = document.getElementById('zone-edit-w');
    const editL = document.getElementById('zone-edit-l');
    const editRot = document.getElementById('zone-edit-rot');
    const btnApplyDim = document.getElementById('btn-apply-zone-dimensions');

    const deleteBtn = document.getElementById('btn-delete-zone-modal');
    if (deleteBtn) {
      if (zone) {
        deleteBtn.style.display = 'inline-flex';
        deleteBtn.onclick = () => {
          if (confirm(`¿Eliminar la zona "${zone.name}" del plano?`)) {
            this.app.deleteZone(zone.id);
            this.closeAllModals();
          }
        };
      } else {
        deleteBtn.style.display = 'none';
      }
    }

    const currentCoords = zone ? zone.coordinates : defaultRing;
    const currentPerimeter = this.app.drawManager ? this.app.drawManager.getPolygonPerimeter(currentCoords) : 0;
    if (perimeterDisplay) {
      perimeterDisplay.innerText = `Perímetro: ${currentPerimeter} m`;
    }

    if (zone) {
      document.getElementById('zone-modal-title').innerText = 'Editar Área / Parcela Delimitada';
      titleInput.value = zone.name || '';
      catSelect.value = zone.category || 'paddock';
      colorInput.value = zone.color || '#d4af37';
      heightInput.value = zone.height || 4;
      heightVal.innerText = `${zone.height || 4} m`;
      opacityInput.value = zone.opacity || 0.7;
      descInput.value = zone.description || '';
      areaDisplay.innerText = `${(zone.area || 0).toLocaleString()} m²`;

      if (zone.dimensions) {
        if (editW) editW.value = zone.dimensions.width;
        if (editL) editL.value = zone.dimensions.length;
        if (editRot) editRot.value = zone.dimensions.rotation || 0;
      } else {
        if (editW) editW.value = 10;
        if (editL) editL.value = 5;
        if (editRot) editRot.value = 0;
      }
    } else {
      document.getElementById('zone-modal-title').innerText = meta && meta.isPreciseBox
        ? 'Nuevo Stand / Carpa con Medidas Exactas'
        : 'Delimitar Nueva Área o Stand (Polígono)';

      if (meta && meta.isPreciseBox) {
        const presetNames = {
          'car-single': 'Stand Auto Clásico (6x3m)',
          'box-double': 'Carpa Box Doble (10x5m)',
          'sponsor': 'Stand Sponsor / Gazebo (12x6m)',
          'vip-lounge': 'Hospitality / VIP Lounge (20x10m)',
          'grand-pavilion': 'Gran Pabellón de Exhibición (40x15m)',
          'gazebo-3x3': 'Gazebo Cuadrado (3x3m)'
        };
        titleInput.value = presetNames[meta.preset] || `Stand ${meta.width}x${meta.length}m`;
        catSelect.value = meta.preset === 'vip-lounge' ? 'vip' : (meta.preset === 'box-double' ? 'paddock' : 'cars');
      } else {
        titleInput.value = 'Nuevo Stand / Parcela';
      }

      colorInput.value = '#d4af37';
      heightInput.value = 4;
      heightVal.innerText = '4 m';
      opacityInput.value = 0.7;
      areaDisplay.innerText = `${areaM2.toLocaleString()} m²`;

      if (editW) editW.value = meta ? meta.width : 10;
      if (editL) editL.value = meta ? meta.length : 5;
      if (editRot) editRot.value = meta ? (meta.rotation || 0) : 0;
    }

    // Apply exact dimensions handler inside modal
    if (btnApplyDim) {
      btnApplyDim.onclick = () => {
        const w = parseFloat(editW.value) || 10;
        const l = parseFloat(editL.value) || 5;
        const rot = parseFloat(editRot.value) || 0;

        const coords = this.editingFeature.data ? this.editingFeature.data.coordinates : this.editingFeature.ring;
        const centroid = this.app.drawManager.getPolygonCentroid(coords);
        const newRing = this.app.drawManager.createPreciseRectangle(centroid, w, l, rot);
        const newArea = Math.round(w * l);

        this.editingFeature.ring = newRing;
        this.editingFeature.area = newArea;
        this.editingFeature.dimensions = { width: w, length: l, rotation: rot };

        if (this.editingFeature.data) {
          this.editingFeature.data.coordinates = newRing;
          this.editingFeature.data.area = newArea;
          this.editingFeature.data.dimensions = { width: w, length: l, rotation: rot };
          this.app.mapEngine.updateZones(this.app.data.zones);
        }

        areaDisplay.innerText = `${newArea.toLocaleString()} m²`;
        if (perimeterDisplay) {
          perimeterDisplay.innerText = `Perímetro: ${Math.round(2 * (w + l))} m`;
        }
        this.showToast(`Medidas aplicadas: ${w}m × ${l}m (${newArea} m²)`);
      };
    }

    heightInput.oninput = () => {
      heightVal.innerText = `${heightInput.value} m`;
    };

    this.zoneModal.classList.add('open');
  }

  // --- Route Editor Modal ---
  openRouteEditor(route = null, defaultLine = null, lengthM = 0) {
    this.editingFeature = { type: 'route', data: route, line: defaultLine, length: lengthM };
    const form = document.getElementById('route-form');
    form.reset();

    const titleInput = document.getElementById('route-name-input');
    const colorInput = document.getElementById('route-color-input');
    const widthInput = document.getElementById('route-width-input');
    const descInput = document.getElementById('route-desc-input');
    const lengthDisplay = document.getElementById('route-length-display');

    const deleteRouteBtn = document.getElementById('btn-delete-route-modal');
    if (deleteRouteBtn) {
      if (route) {
        deleteRouteBtn.style.display = 'inline-flex';
        deleteRouteBtn.onclick = () => {
          if (confirm(`¿Eliminar la ruta "${route.name}" del plano?`)) {
            this.app.deleteRoute(route.id);
            this.closeAllModals();
          }
        };
      } else {
        deleteRouteBtn.style.display = 'none';
      }
    }

    if (route) {
      document.getElementById('route-modal-title').innerText = 'Editar Trazado / Ruta';
      titleInput.value = route.name || '';
      colorInput.value = route.color || '#ef4444';
      widthInput.value = route.width || 6;
      descInput.value = route.description || '';
      lengthDisplay.innerText = `${(route.lengthMeters || 0).toLocaleString()} m`;
    } else {
      document.getElementById('route-modal-title').innerText = 'Trazar Nueva Ruta o Pista';
      titleInput.value = 'Recta de Aceleración / Ruta';
      colorInput.value = '#ef4444';
      widthInput.value = 6;
      lengthDisplay.innerText = `${lengthM.toLocaleString()} m`;
    }

    this.routeModal.classList.add('open');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    this.editingFeature = null;
  }
}
