/**
 * CARBRIATA CONCOURS - UI Manager
 * Handles sidebars, modals, photo uploaders, spotlight lightbox, and data synchronization
 */

import { engineAudio } from '../utils/audio.js';
import { CATEGORIES } from '../data/defaultData.js';
import { PROJECT_TYPES } from '../data/projectManager.js?v=16';

export const OFFICIAL_ZONE_COLORS = [
  { hex: '#D4AF37', label: 'Oro Carbriata (General & Paddock)' },
  { hex: '#8B5CF6', label: 'Púrpura VIP (Lounge & Hospitality)' },
  { hex: '#10B981', label: 'Verde British (Lawn de Clásicos)' },
  { hex: '#EF4444', label: 'Rojo Corsa (Supercars & Recta)' },
  { hex: '#0284C7', label: 'Azul Podio (Escenario & Premiación)' },
  { hex: '#F59E0B', label: 'Ámbar (Food Trucks & Gastronomía)' },
  { hex: '#64748B', label: 'Gris Titanio (Servicios & Logística)' },
  { hex: '#14B8A6', label: 'Turquesa (Estacionamiento)' },
  { hex: '#F8FAFC', label: 'Blanco Nieve (Carpas & Pabellón)' },
  { hex: '#1E293B', label: 'Negro Carbón (Sponsors & Marcas)' },
  { hex: '#EC4899', label: 'Rosa Magenta (Puntos de Encuentro)' },
  { hex: '#F97316', label: 'Naranja Pista (Pit Lane & Boxes)' }
];

export const OFFICIAL_ROUTE_COLORS = [
  { hex: '#EF4444', label: 'Rojo Corsa (Pista Principal / Recta)' },
  { hex: '#D4AF37', label: 'Oro Concours (Desfile de Honor)' },
  { hex: '#3B82F6', label: 'Azul Boxes (Acceso Paddock)' },
  { hex: '#10B981', label: 'Verde Pista (Circuito de Pruebas)' },
  { hex: '#F59E0B', label: 'Ámbar (Paso Vehicular & Tránsito)' },
  { hex: '#8B5CF6', label: 'Púrpura VIP (Acceso Exclusivo)' },
  { hex: '#EC4899', label: 'Rosa (Paseo de Clásicos)' },
  { hex: '#64748B', label: 'Gris Neutro (Circulación General)' }
];

export const CATEGORY_DEFAULT_COLORS = {
  cars: '#10B981',
  paddock: '#D4AF37',
  vip: '#8B5CF6',
  food: '#F59E0B',
  stage: '#0284C7',
  track: '#EF4444',
  service: '#64748B'
};

export class UIManager {
  constructor(app) {
    this.app = app;
    this.currentTab = 'cars'; // 'cars' | 'zones' | 'routes' | 'locations'
    this.currentCategoryFilter = 'all';
    this.searchQuery = '';
    this.currentHubFilter = 'all';
    this.hubSearchQuery = '';
    this.tempUploadedPhotos = [];
    this.editingFeature = null; // { type: 'attraction'|'zone'|'route', data: ... }

    this._bindElements();
    this._initProjectHub();
    this._setupTabListeners();
    this._setupSearchListeners();
    this._setupColorPaletteControls('zone');
    this._setupColorPaletteControls('route');
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
    this.newProjectModal = document.getElementById('new-project-modal');
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

      // Detect and offer cleanup for duplicate vehicles
      const duplicateCount = this._countDuplicateAttractions();
      if (duplicateCount > 0) {
        const dupBanner = document.createElement('div');
        dupBanner.style.cssText = 'margin: 6px 14px; padding: 8px 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; flex-shrink: 0;';
        dupBanner.innerHTML = `
          <span style="color: #fca5a5; font-weight: 500;"><i class="fa-solid fa-clone"></i> ${duplicateCount} autos duplicados</span>
          <button type="button" class="btn-clean-duplicates" style="background: rgba(239,68,68,0.25); border: 1px solid #ef4444; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 700;">
            Limpiar
          </button>
        `;
        this.sidebarContent.appendChild(dupBanner);

        dupBanner.querySelector('.btn-clean-duplicates').addEventListener('click', () => {
          this.app.cleanDuplicateAttractions();
        });
      }
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

      // Drag-to-trash support
      if (this.app.isOrganizerMode) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({
            type: 'attraction',
            id: item.id,
            title: item.title
          }));
          e.dataTransfer.effectAllowed = 'move';
          card.classList.add('dragging');
          if (this.app.showTrashZone) this.app.showTrashZone(true);
        });
        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
          if (this.app.showTrashZone) this.app.showTrashZone(false);
        });
      }

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
            if (this.app.openDeleteConfirmation) {
              this.app.openDeleteConfirmation('attraction', item);
            } else if (confirm(`¿Eliminar la atracción "${item.title}" del plano?`)) {
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

      // Drag-to-trash support
      if (this.app.isOrganizerMode) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({
            type: 'zone',
            id: zone.id,
            title: zone.name
          }));
          e.dataTransfer.effectAllowed = 'move';
          card.classList.add('dragging');
          if (this.app.showTrashZone) this.app.showTrashZone(true);
        });
        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
          if (this.app.showTrashZone) this.app.showTrashZone(false);
        });
      }

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
          if (this.app.openDeleteConfirmation) {
            this.app.openDeleteConfirmation('zone', zone);
          } else if (confirm(`¿Eliminar la zona "${zone.name}"?`)) {
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

      // Drag-to-trash support
      if (this.app.isOrganizerMode) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({
            type: 'route',
            id: route.id,
            title: route.name
          }));
          e.dataTransfer.effectAllowed = 'move';
          card.classList.add('dragging');
          if (this.app.showTrashZone) this.app.showTrashZone(true);
        });
        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
          if (this.app.showTrashZone) this.app.showTrashZone(false);
        });
      }

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
          if (this.app.openDeleteConfirmation) {
            this.app.openDeleteConfirmation('route', route);
          } else if (confirm(`¿Eliminar la ruta "${route.name}"?`)) {
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
      titleInput.value = '';
      subInput.value = '';
      catSelect.value = 'cars';
      yearInput.value = '';
      hpInput.value = '';
      engineInput.value = '';
      ownerInput.value = '';
      badgeInput.value = '';
      descInput.value = '';
      soundSelect.value = '';
      this.tempUploadedPhotos = [];
      this.editingFeature.coords = validCoords;
    }

    const modalBody = this.attractionModal.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;

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

    // Fresh user presets
    this._renderUserPresets('zone');

    let initialColor = '#D4AF37';
    if (zone) {
      document.getElementById('zone-modal-title').innerText = 'Editar Área / Parcela Delimitada';
      titleInput.value = zone.name || '';
      catSelect.value = zone.category || 'paddock';
      initialColor = zone.color || '#D4AF37';
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
      if (meta && (meta.shape === 'circle' || meta.isPreciseCircle)) {
        document.getElementById('zone-modal-title').innerText = 'Nueva Plaza / Stand Circular Exacto';
        const circlePresets = {
          'circle-6': 'Gazebo Circular (6 m Ø)',
          'circle-10': 'Pabellón Redondo (10 m Ø)',
          'circle-16': 'Paddock Circular (16 m Ø)',
          'circle-24': 'Rotonda Central (24 m Ø)',
          'circle-40': 'Gran Plaza Concours (40 m Ø)'
        };
        titleInput.value = circlePresets[meta.preset] || `Área Circular (Ø ${meta.diameter || meta.radius * 2} m)`;
        catSelect.value = 'sponsor';
      } else if (meta && (meta.shape === 'triangle' || meta.isPreciseTriangle)) {
        document.getElementById('zone-modal-title').innerText = 'Nuevo Stand / Parcela Triangular';
        const triPresets = {
          'tri-6': 'Stand Esquina (6 × 6 m)',
          'tri-10': 'Parcela Triangular (10 × 10 m)',
          'tri-15': 'Stand Vértice (15 × 12 m)',
          'tri-24': 'Cuña de Pista (24 × 16 m)'
        };
        titleInput.value = triPresets[meta.preset] || `Stand Triangular ${meta.base} × ${meta.height} m`;
        catSelect.value = 'paddock';
      } else if (meta && meta.isPreciseBox) {
        document.getElementById('zone-modal-title').innerText = 'Nuevo Stand / Carpa con Medidas Exactas';
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
        document.getElementById('zone-modal-title').innerText = 'Delimitar Nueva Área o Stand (Polígono)';
        titleInput.value = 'Nuevo Stand / Parcela';
      }

      initialColor = (meta && meta.preset === 'vip-lounge') ? '#8B5CF6' : (CATEGORY_DEFAULT_COLORS[catSelect.value] || '#D4AF37');
      heightInput.value = 4;
      heightVal.innerText = '4 m';
      opacityInput.value = 0.7;
      areaDisplay.innerText = `${areaM2.toLocaleString()} m²`;

      if (editW) editW.value = meta ? (meta.width || meta.base || 10) : 10;
      if (editL) editL.value = meta ? (meta.length || meta.height || 5) : 5;
      if (editRot) editRot.value = meta ? (meta.rotation || 0) : 0;
    }

    this._setColor('zone', initialColor);

    catSelect.onchange = () => {
      const chosenCat = catSelect.value;
      if (CATEGORY_DEFAULT_COLORS[chosenCat]) {
        this._setColor('zone', CATEGORY_DEFAULT_COLORS[chosenCat]);
      }
    };

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

    this._renderUserPresets('route');

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

    let initialColor = '#EF4444';
    if (route) {
      document.getElementById('route-modal-title').innerText = 'Editar Trazado / Ruta';
      titleInput.value = route.name || '';
      initialColor = route.color || '#EF4444';
      widthInput.value = route.width || 6;
      descInput.value = route.description || '';
      lengthDisplay.innerText = `${(route.lengthMeters || 0).toLocaleString()} m`;
    } else {
      document.getElementById('route-modal-title').innerText = 'Trazar Nueva Ruta o Pista';
      titleInput.value = 'Recta de Aceleración / Ruta';
      initialColor = '#EF4444';
      widthInput.value = 6;
      lengthDisplay.innerText = `${lengthM.toLocaleString()} m`;
    }

    this._setColor('route', initialColor);

    this.routeModal.classList.add('open');
  }

  // --- Color Palette & Presets Management ---
  _getUserColorPresets() {
    try {
      const saved = localStorage.getItem('carbriata_user_color_presets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  _saveUserColorPreset(hex) {
    if (!hex) return;
    let cleanHex = hex.trim().toUpperCase();
    if (!cleanHex.startsWith('#')) cleanHex = '#' + cleanHex;
    if (!/^#[0-9A-F]{6}$/i.test(cleanHex)) return;

    let presets = this._getUserColorPresets();
    presets = presets.filter(c => c.toUpperCase() !== cleanHex);
    presets.unshift(cleanHex);
    if (presets.length > 14) presets = presets.slice(0, 14);

    try {
      localStorage.setItem('carbriata_user_color_presets', JSON.stringify(presets));
      this.showToast(`Color ${cleanHex} guardado en tus predeterminados ⭐`);
      this._renderUserPresets('zone');
      this._renderUserPresets('route');
      this._updateActiveSwatch('zone', cleanHex);
      this._updateActiveSwatch('route', cleanHex);
    } catch (e) {
      console.warn('Failed to save preset to localStorage', e);
    }
  }

  _clearUserColorPresets() {
    try {
      localStorage.removeItem('carbriata_user_color_presets');
      this.showToast('Colores guardados eliminados');
      this._renderUserPresets('zone');
      this._renderUserPresets('route');
    } catch (e) {
      console.warn(e);
    }
  }

  _renderOfficialSwatches(prefix) {
    const container = document.getElementById(`${prefix}-official-swatches`);
    if (!container) return;
    const presets = prefix === 'zone' ? OFFICIAL_ZONE_COLORS : OFFICIAL_ROUTE_COLORS;
    container.innerHTML = '';

    presets.forEach(p => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch-item';
      swatch.style.backgroundColor = p.hex;
      swatch.setAttribute('data-color', p.hex.toUpperCase());
      swatch.title = `${p.label} (${p.hex})`;
      swatch.addEventListener('click', () => {
        this._setColor(prefix, p.hex);
      });
      container.appendChild(swatch);
    });
  }

  _renderUserPresets(prefix) {
    const container = document.getElementById(`${prefix}-user-swatches`);
    const block = document.getElementById(`${prefix}-user-presets-block`);
    if (!container || !block) return;

    const userPresets = this._getUserColorPresets();
    if (userPresets.length === 0) {
      block.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    block.style.display = 'block';
    container.innerHTML = '';

    userPresets.forEach(hex => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch-item';
      swatch.style.backgroundColor = hex;
      swatch.setAttribute('data-color', hex.toUpperCase());
      swatch.title = `Color Guardado: ${hex}`;
      swatch.addEventListener('click', () => {
        this._setColor(prefix, hex);
      });
      container.appendChild(swatch);
    });
  }

  _updateActiveSwatch(prefix, hex) {
    const norm = (hex || '').trim().toUpperCase();
    const allSwatches = document.querySelectorAll(
      `#${prefix}-official-swatches .color-swatch-item, #${prefix}-user-swatches .color-swatch-item`
    );
    allSwatches.forEach(swatch => {
      if (swatch.getAttribute('data-color') === norm) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  }

  _setColor(prefix, hex) {
    if (!hex) return;
    let cleanHex = hex.trim().toUpperCase();
    if (!cleanHex.startsWith('#')) cleanHex = '#' + cleanHex;

    if (/^#[0-9A-F]{3}$/i.test(cleanHex)) {
      cleanHex = '#' + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2] + cleanHex[3] + cleanHex[3];
    }

    if (!/^#[0-9A-F]{6}$/i.test(cleanHex)) return;

    const inputNative = document.getElementById(`${prefix}-color-input`);
    const bubble = document.getElementById(`${prefix}-color-bubble`);
    const hexInput = document.getElementById(`${prefix}-color-hex-input`);
    const hexBadge = document.getElementById(`${prefix}-color-hex`);

    if (inputNative) inputNative.value = cleanHex.toLowerCase();
    if (bubble) bubble.style.backgroundColor = cleanHex;
    if (hexInput && document.activeElement !== hexInput) {
      hexInput.value = cleanHex.replace('#', '');
    }
    if (hexBadge) hexBadge.innerText = cleanHex;

    this._updateActiveSwatch(prefix, cleanHex);
  }

  _setupColorPaletteControls(prefix) {
    this._renderOfficialSwatches(prefix);
    this._renderUserPresets(prefix);

    const inputNative = document.getElementById(`${prefix}-color-input`);
    const hexInput = document.getElementById(`${prefix}-color-hex-input`);
    const btnSave = document.getElementById(`btn-save-${prefix}-preset`);
    const btnClear = document.getElementById(`btn-clear-${prefix}-presets`);

    if (inputNative) {
      inputNative.addEventListener('input', (e) => {
        this._setColor(prefix, e.target.value);
      });
    }

    if (hexInput) {
      hexInput.addEventListener('input', (e) => {
        let raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
        hexInput.value = raw;
        if (raw.length === 6 || raw.length === 3) {
          this._setColor(prefix, '#' + raw);
        }
      });

      hexInput.addEventListener('blur', () => {
        if (inputNative) {
          hexInput.value = inputNative.value.replace('#', '').toUpperCase();
        }
      });
    }

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const curColor = inputNative ? inputNative.value : (prefix === 'zone' ? '#D4AF37' : '#EF4444');
        this._saveUserColorPreset(curColor);
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('¿Eliminar todos tus colores predeterminados guardados?')) {
          this._clearUserColorPresets();
        }
      });
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    this.editingFeature = null;
  }

  showToast(message, duration = 3000) {
    let container = document.getElementById('concours-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'concours-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'concours-toast';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check" style="color: var(--gold-400);"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 260);
    }, duration);
  }

  _countDuplicateAttractions() {
    if (!this.app || !this.app.data || !this.app.data.attractions) return 0;
    const seen = new Set();
    let duplicates = 0;
    this.app.data.attractions.forEach(item => {
      const coordStr = item.coordinates ? item.coordinates.map(n => Number(n).toFixed(5)).join(',') : '';
      const key = `${(item.title || '').trim().toLowerCase()}_${coordStr}`;
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }
    });
    return duplicates;
  }

  // --- Project Hub Controller & Launcher ---
  _initProjectHub() {
    // 1. New Project Trigger
    const btnNew = document.getElementById('btn-hub-new-project');
    if (btnNew) {
      btnNew.addEventListener('click', () => this.openNewProjectModal());
    }

    // Modal Close Triggers
    const btnCloseNew = document.getElementById('btn-close-new-project-modal');
    const btnCancelNew = document.getElementById('btn-cancel-new-project');
    if (btnCloseNew) btnCloseNew.addEventListener('click', () => this.closeNewProjectModal());
    if (btnCancelNew) btnCancelNew.addEventListener('click', () => this.closeNewProjectModal());

    // 2. Back to Hub Nav Button (in Studio Header)
    const btnBackHub = document.getElementById('btn-back-to-hub');
    if (btnBackHub) {
      btnBackHub.addEventListener('click', () => this.app.returnToHub());
    }

    // 3. Search Bar in Hub
    const hubSearch = document.getElementById('hub-search-input');
    if (hubSearch) {
      hubSearch.addEventListener('input', (e) => {
        this.hubSearchQuery = e.target.value.toLowerCase().trim();
        this.renderProjectHub();
      });
    }

    // 4. Industry Filter Chips in Hub
    document.querySelectorAll('.hub-chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.hub-chip-btn').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentHubFilter = chip.getAttribute('data-filter') || 'all';
        this.renderProjectHub();
      });
    });

    // 5. Project Type Selector in New Project Modal
    document.querySelectorAll('#new-project-type-grid .type-option-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#new-project-type-grid .type-option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const selectedType = card.getAttribute('data-type') || 'custom';
        const hiddenType = document.getElementById('new-project-type');
        if (hiddenType) hiddenType.value = selectedType;

        const typeConfig = PROJECT_TYPES[selectedType] || PROJECT_TYPES.custom;
        const nameInput = document.getElementById('new-project-name');
        const descInput = document.getElementById('new-project-desc');
        if (nameInput) {
          nameInput.placeholder = `ej: ${typeConfig.placeholderTitle}`;
        }
        if (descInput) {
          descInput.placeholder = typeConfig.defaultDesc;
        }
      });
    });

    // 6. Quick Locations in New Project Modal
    document.querySelectorAll('.btn-quick-loc').forEach(btn => {
      btn.addEventListener('click', () => {
        const coordsStr = btn.getAttribute('data-coords');
        const locName = btn.getAttribute('data-name');
        if (coordsStr) {
          const [lng, lat] = coordsStr.split(',').map(Number);
          const lngInp = document.getElementById('new-project-lng');
          const latInp = document.getElementById('new-project-lat');
          const searchInp = document.getElementById('new-project-loc-search');
          if (lngInp) lngInp.value = lng;
          if (latInp) latInp.value = lat;
          if (searchInp) searchInp.value = locName;
        }
      });
    });

    // 7. Nominatim Search in New Project Modal
    const btnSearchGeo = document.getElementById('btn-search-geoloc');
    const locSearchInp = document.getElementById('new-project-loc-search');
    const searchDropdown = document.getElementById('new-project-search-results');

    const handleSearchGeoloc = async () => {
      const q = locSearchInp ? locSearchInp.value.trim() : '';
      if (!q) return;
      if (btnSearchGeo) btnSearchGeo.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`);
        const results = await res.json();
        if (btnSearchGeo) btnSearchGeo.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar';
        if (!searchDropdown) return;
        searchDropdown.innerHTML = '';
        if (results && results.length > 0) {
          searchDropdown.style.display = 'block';
          results.forEach(item => {
            const row = document.createElement('div');
            row.className = 'search-result-item';
            row.innerText = item.display_name;
            row.addEventListener('click', () => {
              const lngInp = document.getElementById('new-project-lng');
              const latInp = document.getElementById('new-project-lat');
              if (lngInp) lngInp.value = parseFloat(item.lon).toFixed(5);
              if (latInp) latInp.value = parseFloat(item.lat).toFixed(5);
              if (locSearchInp) locSearchInp.value = item.display_name.split(',').slice(0, 2).join(',');
              searchDropdown.style.display = 'none';
            });
            searchDropdown.appendChild(row);
          });
        } else {
          searchDropdown.style.display = 'block';
          searchDropdown.innerHTML = '<div class="search-result-item" style="color: var(--text-muted); cursor: default;">No se encontraron resultados geográficos.</div>';
          setTimeout(() => { searchDropdown.style.display = 'none'; }, 2800);
        }
      } catch (err) {
        if (btnSearchGeo) btnSearchGeo.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar';
        console.warn('Geocoding search failed:', err);
      }
    };

    if (btnSearchGeo) btnSearchGeo.addEventListener('click', handleSearchGeoloc);
    if (locSearchInp) {
      locSearchInp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearchGeoloc();
        }
      });
    }

    // 8. Form Submit: Create New Project
    const formNew = document.getElementById('new-project-form');
    if (formNew) {
      formNew.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = document.getElementById('new-project-type')?.value || 'custom';
        const name = document.getElementById('new-project-name')?.value.trim() || 'Nuevo Proyecto';
        const subtitle = document.getElementById('new-project-subtitle')?.value.trim() || '';
        const desc = document.getElementById('new-project-desc')?.value.trim() || '';
        const locSearch = document.getElementById('new-project-loc-search')?.value.trim() || '';
        const lng = parseFloat(document.getElementById('new-project-lng')?.value) || -58.9150;
        const lat = parseFloat(document.getElementById('new-project-lat')?.value) || -34.4550;
        const zoom = parseFloat(document.getElementById('new-project-zoom')?.value) || 16.5;

        this.closeNewProjectModal();
        await this.app.createProject({
          name,
          type,
          description: desc || subtitle,
          locationName: locSearch || 'Predio Privado',
          city: locSearch || 'Coordenadas Satelitales',
          coordinates: [lng, lat],
          zoom,
          pitch: 50,
          bearing: -15
        });
      });
    }
  }

  openNewProjectModal() {
    if (!this.newProjectModal) return;
    const form = document.getElementById('new-project-form');
    if (form) form.reset();

    // Default to real_estate
    document.querySelectorAll('#new-project-type-grid .type-option-card').forEach(c => c.classList.remove('selected'));
    const defaultCard = document.querySelector('#new-project-type-grid .type-option-card[data-type="real_estate"]');
    if (defaultCard) defaultCard.classList.add('selected');
    const hiddenType = document.getElementById('new-project-type');
    if (hiddenType) hiddenType.value = 'real_estate';

    const lngInp = document.getElementById('new-project-lng');
    const latInp = document.getElementById('new-project-lat');
    const zoomInp = document.getElementById('new-project-zoom');
    if (lngInp) lngInp.value = '-58.9150';
    if (latInp) latInp.value = '-34.4550';
    if (zoomInp) zoomInp.value = '16.5';

    const searchDropdown = document.getElementById('new-project-search-results');
    if (searchDropdown) searchDropdown.style.display = 'none';

    this.newProjectModal.classList.add('open');
  }

  closeNewProjectModal() {
    if (this.newProjectModal) {
      this.newProjectModal.classList.remove('open');
    }
  }

  renderProjectHub() {
    const grid = document.getElementById('hub-projects-grid');
    if (!grid || !this.app.projectManager) return;

    const projects = this.app.projectManager.getAllProjects();

    // Compute Hub Global Stats
    const totalProjects = projects.length;
    let totalZones = 0;
    let totalAreaM2 = 0;

    projects.forEach(p => {
      if (p.data && p.data.zones) {
        totalZones += p.data.zones.length;
        totalAreaM2 += p.data.zones.reduce((sum, z) => sum + (z.area || 0), 0);
      }
    });

    const totalHa = (totalAreaM2 / 10000).toFixed(1);
    const statTotalProjects = document.getElementById('hub-total-projects');
    const statTotalZones = document.getElementById('hub-total-zones');
    const statTotalArea = document.getElementById('hub-total-area');

    if (statTotalProjects) statTotalProjects.innerText = totalProjects;
    if (statTotalZones) statTotalZones.innerText = totalZones;
    if (statTotalArea) statTotalArea.innerText = `${totalHa} ha`;

    // Filter projects
    let filtered = projects;
    if (this.currentHubFilter && this.currentHubFilter !== 'all') {
      filtered = filtered.filter(p => p.type === this.currentHubFilter);
    }
    if (this.hubSearchQuery) {
      const q = this.hubSearchQuery;
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        (p.locationName && p.locationName.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q))
      );
    }

    grid.innerHTML = '';

    // 1. Add "Create New Project" Card
    const newCard = document.createElement('div');
    newCard.className = 'project-card-new';
    newCard.innerHTML = `
      <div class="project-new-icon"><i class="fa-solid fa-plus"></i></div>
      <div class="project-new-title">Crear Nuevo Terreno / Proyecto</div>
      <div class="project-new-desc">
        Delimita un loteo residencial, puerto, dársena o predio privado sin cobertura cartográfica de Google Maps.
      </div>
    `;
    newCard.addEventListener('click', () => this.openNewProjectModal());
    grid.appendChild(newCard);

    // 2. Render Project Cards
    filtered.forEach(p => {
      const typeConfig = PROJECT_TYPES[p.type] || PROJECT_TYPES.custom;
      const card = document.createElement('div');
      card.className = 'project-card';

      const zonesCount = p.data?.zones?.length || 0;
      const itemsCount = p.data?.attractions?.length || 0;
      const projAreaM2 = p.data?.zones ? p.data.zones.reduce((s, z) => s + (z.area || 0), 0) : 0;
      const projAreaText = projAreaM2 >= 10000 
        ? `${(projAreaM2 / 10000).toFixed(1)} ha` 
        : `${Math.round(projAreaM2).toLocaleString()} m²`;

      const updatedDate = new Date(p.updatedAt || p.createdAt || Date.now());
      const formattedDate = updatedDate.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      card.innerHTML = `
        <div class="project-card-top">
          <span class="project-type-badge" style="background: ${typeConfig.color}25; color: ${typeConfig.color}; border: 1px solid ${typeConfig.color}50;">
            <i class="fa-solid ${typeConfig.icon}"></i> ${typeConfig.shortLabel}
          </span>
          <div class="project-card-actions">
            <button class="btn-card-icon btn-card-dup" title="Duplicar Proyecto"><i class="fa-regular fa-copy"></i></button>
            ${projects.length > 1 ? `<button class="btn-card-icon btn-card-del" title="Eliminar Proyecto" style="color: #f87171;"><i class="fa-regular fa-trash-can"></i></button>` : ''}
          </div>
        </div>

        <div class="project-card-body">
          <h3 class="project-name">${p.name}</h3>
          <div class="project-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${p.city || p.locationName || 'Coordenadas Satelitales'}</span>
          </div>
          <p class="project-desc">${p.tagline || typeConfig.defaultDesc}</p>

          <div class="project-metrics-chips">
            <span class="metric-chip"><strong>${zonesCount}</strong> ${typeConfig.zonesTerm}</span>
            <span class="metric-chip"><strong>${projAreaText}</strong> Delimitados</span>
            <span class="metric-chip"><strong>${itemsCount}</strong> ${typeConfig.itemsTerm}</span>
          </div>
        </div>

        <div class="project-card-footer">
          <span class="project-time"><i class="fa-regular fa-clock"></i> ${formattedDate}</span>
          <button class="btn-open-project" type="button">
            <span>Abrir en Studio</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      `;

      const openBtn = card.querySelector('.btn-open-project');
      const cardBody = card.querySelector('.project-card-body');
      const handleOpen = () => this.app.openProject(p.id);

      if (openBtn) openBtn.addEventListener('click', handleOpen);
      if (cardBody) {
        cardBody.style.cursor = 'pointer';
        cardBody.addEventListener('click', handleOpen);
      }

      const btnDup = card.querySelector('.btn-card-dup');
      if (btnDup) {
        btnDup.addEventListener('click', (e) => {
          e.stopPropagation();
          this.app.duplicateProject(p.id);
        });
      }

      const btnDel = card.querySelector('.btn-card-del');
      if (btnDel) {
        btnDel.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`¿Estás seguro de que deseas eliminar el proyecto "${p.name}"? Esta acción no se puede deshacer.`)) {
            this.app.deleteProject(p.id);
          }
        });
      }

      grid.appendChild(card);
    });
  }

  updateStudioHeaderForProject(project) {
    if (!project) return;
    const typeConfig = PROJECT_TYPES[project.type] || PROJECT_TYPES.custom;

    // 1. Header Active Project Pill
    const activeBadge = document.getElementById('active-project-type-badge');
    const activeTitle = document.getElementById('active-project-name');
    if (activeBadge) {
      activeBadge.innerText = typeConfig.shortLabel;
      activeBadge.style.background = typeConfig.color;
      activeBadge.style.color = '#071810';
    }
    if (activeTitle) {
      activeTitle.innerText = project.name;
      activeTitle.title = project.name;
    }

    // 2. Adapt Sidebar Tabs Text & Icons to Industry Domain
    const tabCars = document.querySelector('.tab-btn[data-tab="cars"]');
    const tabZones = document.querySelector('.tab-btn[data-tab="zones"]');
    const tabRoutes = document.querySelector('.tab-btn[data-tab="routes"]');

    if (tabCars) {
      tabCars.innerHTML = `<i class="fa-solid ${typeConfig.icon}"></i> ${typeConfig.itemTerm || 'Puntos'}`;
    }
    if (tabZones) {
      tabZones.innerHTML = `<i class="fa-solid fa-draw-polygon"></i> ${typeConfig.zoneTerm || 'Zonas'}`;
    }
    if (tabRoutes) {
      tabRoutes.innerHTML = `<i class="fa-solid fa-road"></i> ${typeConfig.routeTerm || 'Rutas'}`;
    }

    // 3. Adapt Sidebar Footer Stats Labels
    const statCarsWrap = document.getElementById('stat-cars')?.closest('.stat-item')?.querySelector('span');
    const statZonesWrap = document.getElementById('stat-zones')?.closest('.stat-item')?.querySelector('span');
    if (statCarsWrap) statCarsWrap.innerText = `${typeConfig.itemsTerm} Registrados`;
    if (statZonesWrap) statZonesWrap.innerText = `${typeConfig.zonesTerm} Delimitadas`;

    // 4. Adapt Venue Select / Multi-venue Container
    const venueContainer = document.querySelector('.venue-selector-container');
    if (venueContainer) {
      if (project.id === 'project-carbriata-dolores') {
        venueContainer.style.display = 'flex';
      } else {
        venueContainer.style.display = 'none';
      }
    }
  }
}
