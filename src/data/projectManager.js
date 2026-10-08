/**
 * MAPAMETRIC - Project Manager & Multi-Project State Engine
 * Manages projects for Real Estate, Logistics & Docks, Construction, Events, and Custom Land.
 */

import { DOLORES_INITIAL_DATA, INITIAL_LOCATIONS } from './defaultData.js?v=16';

export const PROJECT_TYPES = {
  real_estate: {
    id: 'real_estate',
    label: 'Desarrollo Inmobiliario & Loteos',
    shortLabel: 'Inmobiliario',
    icon: 'fa-house-chimney-window',
    color: '#10b981',
    zoneTerm: 'Lote / Manzana',
    zonesTerm: 'Lotes & Manzanas',
    itemTerm: 'Unidad / Punto',
    itemsTerm: 'Unidades & Puntos',
    routeTerm: 'Vialidad / Calle',
    routesTerm: 'Calles & Accesos',
    placeholderTitle: 'Barrio Cerrado / Loteo Residencial',
    defaultDesc: 'Masterplan de urbanización, loteo en pozo y zonificación de parcelas residenciales.'
  },
  logistics: {
    id: 'logistics',
    label: 'Logística, Puertos & Docks',
    shortLabel: 'Logística & Docks',
    icon: 'fa-dolly',
    color: '#0284c7',
    zoneTerm: 'Dársena / Patio',
    zonesTerm: 'Dársenas & Patios',
    itemTerm: 'Activo / Maquinaria',
    itemsTerm: 'Activos & Maquinarias',
    routeTerm: 'Corredor Logístico',
    routesTerm: 'Corredores & Vías',
    placeholderTitle: 'Centro de Distribución / Terminal Portuaria',
    defaultDesc: 'Zonificación de patios de contenedores, dársenas de carga, almacenes 3D y corredores pesados.'
  },
  construction: {
    id: 'construction',
    label: 'Construcción, Obras & Predio Privado',
    shortLabel: 'Obras & Construcción',
    icon: 'fa-helmet-safety',
    color: '#f59e0b',
    zoneTerm: 'Sector de Obra / Obrador',
    zonesTerm: 'Sectores & Obrador',
    itemTerm: 'Punto de Interés / Equipo',
    itemsTerm: 'Equipos & Puntos',
    routeTerm: 'Camino de Obra',
    routesTerm: 'Caminos & Accesos',
    placeholderTitle: 'Predio Privado en Construcción',
    defaultDesc: 'Relevamiento de terreno sin cartografía pública, vallado perimetral, obrador y acopio.'
  },
  events: {
    id: 'events',
    label: 'Eventos, Expos & Festivales',
    shortLabel: 'Eventos & Expos',
    icon: 'fa-flag-checkered',
    color: '#d4af37',
    zoneTerm: 'Stand / Parcela',
    zonesTerm: 'Stands & Parcelas 3D',
    itemTerm: 'Vehículo / Atracción',
    itemsTerm: 'Vehículos & Atracciones',
    routeTerm: 'Trazado / Pista',
    routesTerm: 'Trazados & Circuitos',
    placeholderTitle: 'Exposición / Festival al Aire Libre',
    defaultDesc: 'Planificación de carpas 3D, stands comerciales, paddocks y recorridos dinámicos.'
  },
  custom: {
    id: 'custom',
    label: 'Terreno Libre / Personalizado',
    shortLabel: 'Terreno Libre',
    icon: 'fa-map-location-dot',
    color: '#8b5cf6',
    zoneTerm: 'Área / Polígono',
    zonesTerm: 'Áreas Delimitadas',
    itemTerm: 'Punto Marcado',
    itemsTerm: 'Puntos de Interés',
    routeTerm: 'Trazado',
    routesTerm: 'Rutas & Caminos',
    placeholderTitle: 'Nuevo Terreno Sin Cartografiar',
    defaultDesc: 'Delimitación paramétrica y medición métrica libre sobre imágenes satelitales.'
  }
};

/**
 * Built-in Starter Templates
 */
export const STARTER_PROJECTS = [
  {
    id: 'project-carbriata-dolores',
    type: 'events',
    name: 'Carbriata Concours Dolores 2026',
    tagline: 'Festival de Autos Clásicos & Velocidad',
    locationName: 'Autódromo Municipal Miguel Ángel Atauri, Dolores',
    city: 'Dolores, Buenos Aires (Autovía 2 km 210)',
    coordinates: [-57.6972, -36.3265],
    zoom: 16.6,
    pitch: 55,
    bearing: -25,
    createdAt: 1774000000000,
    updatedAt: 1775000000000,
    isPreset: true,
    data: DOLORES_INITIAL_DATA
  },
  {
    id: 'project-altos-del-valle',
    type: 'real_estate',
    name: 'Altos del Valle — Barrio Cerrado & Loteo',
    tagline: 'Desarrollo Inmobiliario & Masterplan de 38 Lotes',
    locationName: 'Predio Privado Norte, Pilar / Luján',
    city: 'Pilar, Buenos Aires (Ruta 8 km 58)',
    coordinates: [-58.9150, -34.4550],
    zoom: 16.5,
    pitch: 50,
    bearing: -15,
    createdAt: 1774100000000,
    updatedAt: 1775010000000,
    isPreset: true,
    data: {
      zones: [
        {
          id: 'zone-loteo-norte',
          name: 'Sector Residencial: Manzana Los Robles (12 Lotes)',
          category: 'paddock',
          color: '#10b981',
          opacity: 0.65,
          height: 3.5,
          area: 11200,
          description: 'Lotes de 800 a 1.000 m² con orientación norte. Área actualmente en nivelación y apertura de trazas.',
          coordinates: [
            [-58.9168, -34.4542],
            [-58.9145, -34.4536],
            [-58.9141, -34.4548],
            [-58.9164, -34.4554],
            [-58.9168, -34.4542]
          ]
        },
        {
          id: 'zone-clubhouse',
          name: 'Club House, Gimnasio & Piscina Comunitaria',
          category: 'vip',
          color: '#8b5cf6',
          opacity: 0.75,
          height: 6.0,
          area: 2800,
          description: 'Edificio central con salón de usos múltiples, terraza y canchas de tenis iluminadas.',
          coordinates: [
            [-58.9140, -34.4540],
            [-58.9130, -34.4537],
            [-58.9126, -34.4546],
            [-58.9136, -34.4549],
            [-58.9140, -34.4540]
          ]
        },
        {
          id: 'zone-portal-acceso',
          name: 'Portal de Acceso & Guardia de Seguridad 24hs',
          category: 'service',
          color: '#0284c7',
          opacity: 0.7,
          height: 4.5,
          area: 1450,
          description: 'Doble carril de entrada/salida para propietarios y control de visitas con barreras automatizadas.',
          coordinates: [
            [-58.9175, -34.4558],
            [-58.9168, -34.4556],
            [-58.9165, -34.4562],
            [-58.9172, -34.4564],
            [-58.9175, -34.4558]
          ]
        }
      ],
      routes: [
        {
          id: 'route-avenida-central',
          name: 'Bulevar Principal Asfaltado con Cantero Central',
          category: 'track',
          color: '#d4af37',
          width: 8,
          lengthMeters: 520,
          description: 'Avenida de doble mano arbolada que conecta el portal de entrada con el Club House.',
          coordinates: [
            [-58.9172, -34.4561],
            [-58.9155, -34.4552],
            [-58.9135, -34.4545]
          ]
        }
      ],
      attractions: [
        {
          id: 'poi-obrador-central',
          title: 'Obrador Central & Oficinas Técnicas',
          subtitle: 'Estudio de Arquitectura e Inspección de Obras',
          category: 'paddock',
          year: 2026,
          hp: 'Etapa 1',
          engine: 'Infraestructura Vial',
          owner: 'Desarrolladora Del Valle S.A.',
          badge: 'Obrador',
          coordinates: [-58.9160, -34.4550],
          description: 'Punto de coordinación de maquinaria pesada, acopio de cañerías subterráneas y tendido eléctrico.',
          photos: [
            'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80'
          ]
        },
        {
          id: 'poi-lote-modelo',
          title: 'Lote Modelo #14 (Showroom)',
          subtitle: 'Casa Modelo Tipología Moderna 280 m²',
          category: 'vip',
          year: 2026,
          hp: 'En Venta',
          engine: 'Lote 940 m²',
          owner: 'Comercializa Grupo Inmobiliario',
          badge: 'Disponible',
          coordinates: [-58.9150, -34.4540],
          description: 'Unidad de exhibición para visitas guiadas con compradores e inversores.',
          photos: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
          ]
        }
      ]
    }
  },
  {
    id: 'project-puerto-sur-logistics',
    type: 'logistics',
    name: 'Terminal Logística & Docks Puerto Sur',
    tagline: 'Hub Multimodal, Patios de Contenedores & Dársenas',
    locationName: 'Dársena 2 & Puerto Comercial',
    city: 'Dock Sud / Avellaneda, Buenos Aires',
    coordinates: [-58.3580, -34.6420],
    zoom: 16.4,
    pitch: 52,
    bearing: 30,
    createdAt: 1774200000000,
    updatedAt: 1775020000000,
    isPreset: true,
    data: {
      zones: [
        {
          id: 'zone-patio-contenedores',
          name: 'Patio de Contenedores Refrigerados (Reefer)',
          category: 'paddock',
          color: '#0284c7',
          opacity: 0.7,
          height: 7.5,
          area: 14800,
          description: 'Zona de estiba de contenedores de 40 pies con tomas eléctricas para cadena de frío.',
          coordinates: [
            [-58.3592, -34.6412],
            [-58.3575, -34.6405],
            [-58.3568, -34.6420],
            [-58.3585, -34.6427],
            [-58.3592, -34.6412]
          ]
        },
        {
          id: 'zone-galpon-crossdock',
          name: 'Galpón de Cross-Docking & Aduana 3D',
          category: 'service',
          color: '#f59e0b',
          opacity: 0.8,
          height: 10.0,
          area: 6400,
          description: 'Nave industrial cubierta de 120 x 50 metros con 18 muelles automáticos de carga y descarga.',
          coordinates: [
            [-58.3572, -34.6425],
            [-58.3562, -34.6421],
            [-58.3556, -34.6432],
            [-58.3566, -34.6436],
            [-58.3572, -34.6425]
          ]
        }
      ],
      routes: [
        {
          id: 'route-camiones-pesados',
          name: 'Corredor Pesado de Acceso a Muelle',
          category: 'track',
          color: '#ef4444',
          width: 9,
          lengthMeters: 680,
          description: 'Circuito pavimentado de alto tonelaje para camiones bitrén con balanza de pesaje fiscal.',
          coordinates: [
            [-58.3600, -34.6418],
            [-58.3578, -34.6415],
            [-58.3560, -34.6428]
          ]
        }
      ],
      attractions: [
        {
          id: 'poi-grua-portico',
          title: 'Grúa Pórtico Post-Panamax #01',
          subtitle: 'Capacidad de izaje 65 toneladas sobre buque',
          category: 'stage',
          year: 2026,
          hp: '65 Ton',
          engine: 'Eléctrica 380V',
          owner: 'Consorcio Portuario',
          badge: 'Maquinaria',
          coordinates: [-58.3569, -34.6415],
          description: 'Grúa móvil sobre rieles para operación continua de descarga de buques cargueros.',
          photos: [
            'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'
          ]
        }
      ]
    }
  }
];

export class ProjectManager {
  constructor() {
    this.storageKey = 'mapametric_projects_catalog_v1';
    this.activeKey = 'mapametric_active_project_id';
    this.legacyStorageKey = 'carbriata_concours_state_v1';
    this.projects = this._loadProjects();
  }

  _getItem(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (_) {}
    return null;
  }

  _setItem(key, val) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
      }
    } catch (_) {}
  }

  _loadProjects() {
    try {
      const stored = this._getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load projects from localStorage:', e);
    }

    // Initialize with starter catalog
    const initialList = JSON.parse(JSON.stringify(STARTER_PROJECTS));

    // Migrate previous user edits on Carbriata Concours if present
    try {
      const legacy = this._getItem(this.legacyStorageKey);
      if (legacy) {
        const legacyData = JSON.parse(legacy);
        if (legacyData.zones || legacyData.attractions) {
          const carbProject = initialList.find(p => p.id === 'project-carbriata-dolores');
          if (carbProject) {
            carbProject.data = legacyData;
            carbProject.updatedAt = Date.now();
          }
        }
      }
    } catch (e) {
      console.warn('Legacy data migration skipped:', e);
    }

    this._saveAll(initialList);
    return initialList;
  }

  _saveAll(projectsList) {
    try {
      this._setItem(this.storageKey, JSON.stringify(projectsList));
    } catch (e) {
      console.error('Error saving projects catalog to localStorage:', e);
    }
  }

  getAllProjects() {
    return [...this.projects];
  }

  getProject(id) {
    return this.projects.find(p => p.id === id) || null;
  }

  getActiveProjectId() {
    let activeId = this._getItem(this.activeKey);
    if (!activeId || !this.getProject(activeId)) {
      activeId = this.projects[0] ? this.projects[0].id : 'project-carbriata-dolores';
      this.setActiveProjectId(activeId);
    }
    return activeId;
  }

  setActiveProjectId(id) {
    this._setItem(this.activeKey, id);
  }

  getActiveProject() {
    const id = this.getActiveProjectId();
    return this.getProject(id) || this.projects[0];
  }

  saveActiveProjectData(data) {
    const activeId = this.getActiveProjectId();
    const proj = this.getProject(activeId);
    if (proj) {
      proj.data = data;
      proj.updatedAt = Date.now();
      this._saveAll(this.projects);

      // Keep legacy key synced if active is the Dolores event for safety
      if (activeId === 'project-carbriata-dolores') {
        try {
          this._setItem(this.legacyStorageKey, JSON.stringify(data));
        } catch (_) {}
      }
    }
  }

  createProject({ name, type = 'custom', description = '', locationName = '', city = '', coordinates = [-58.3816, -34.6037], zoom = 16.5, pitch = 50, bearing = -20 }) {
    const typeConfig = PROJECT_TYPES[type] || PROJECT_TYPES.custom;
    const newId = 'project-' + Date.now();

    const newProject = {
      id: newId,
      type: type,
      name: name || typeConfig.placeholderTitle,
      tagline: description || typeConfig.defaultDesc,
      locationName: locationName || 'Ubicación del Terreno',
      city: city || 'Coordenadas del Predio',
      coordinates: coordinates,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPreset: false,
      data: {
        zones: [],
        routes: [],
        attractions: []
      }
    };

    this.projects.unshift(newProject);
    this._saveAll(this.projects);
    this.setActiveProjectId(newId);
    return newProject;
  }

  duplicateProject(id) {
    const original = this.getProject(id);
    if (!original) return null;

    const newId = 'project-' + Date.now();
    const clone = JSON.parse(JSON.stringify(original));
    clone.id = newId;
    clone.name = `${original.name} (Copia)`;
    clone.isPreset = false;
    clone.createdAt = Date.now();
    clone.updatedAt = Date.now();

    this.projects.unshift(clone);
    this._saveAll(this.projects);
    return clone;
  }

  deleteProject(id) {
    if (this.projects.length <= 1) {
      throw new Error('No puedes eliminar el único proyecto existente.');
    }

    this.projects = this.projects.filter(p => p.id !== id);
    this._saveAll(this.projects);

    if (this.getActiveProjectId() === id) {
      this.setActiveProjectId(this.projects[0].id);
    }
    return true;
  }

  updateProjectMeta(id, { name, tagline, type, city, locationName }) {
    const proj = this.getProject(id);
    if (!proj) return null;

    if (name) proj.name = name;
    if (tagline !== undefined) proj.tagline = tagline;
    if (type) proj.type = type;
    if (city !== undefined) proj.city = city;
    if (locationName !== undefined) proj.locationName = locationName;
    proj.updatedAt = Date.now();

    this._saveAll(this.projects);
    return proj;
  }
}
