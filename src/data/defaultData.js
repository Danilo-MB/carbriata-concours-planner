/**
 * CARBRIATA CONCOURS - Master Data & Presets
 * Official Locations, Initial Dolores 2026 Layout, Cars, and Media
 */

export const INITIAL_LOCATIONS = [
  {
    id: 'dolores-2026',
    name: 'Autódromo Municipal Miguel Ángel Atauri',
    city: 'Dolores, Buenos Aires (Autovía 2 km 210)',
    edition: 'Edición Inaugural 2026 (7 de Marzo)',
    coordinates: [-57.6972, -36.3265],
    zoom: 16.6,
    pitch: 55,
    bearing: -25,
    description: 'Circuito histórico de Dolores. Escenario de la 1ª edición de Carbriata Concours con más de 200 autos clásicos y deportivos en movimiento.'
  },
  {
    id: 'san-isidro',
    name: 'Hipódromo de San Isidro / Jardines del Paddock',
    city: 'San Isidro, Buenos Aires',
    edition: 'Locación Tentativa Edición Elegance',
    coordinates: [-58.5190, -34.4815],
    zoom: 16.4,
    pitch: 45,
    bearing: 15,
    description: 'Extensos jardines de césped natural y arboleda histórica para exhibiciones estáticas y desfile de época.'
  },
  {
    id: 'estancia-villa-maria',
    name: 'Estancia Villa María',
    city: 'Máximo Paz, Buenos Aires',
    edition: 'Locación Tentativa Concurso Tradición',
    coordinates: [-58.5525, -34.9542],
    zoom: 16.5,
    pitch: 50,
    bearing: 40,
    description: 'Palacio estilo Tudor rodeado por parque botánico diseñado por Carlos Thays. Ideal para concours d’elegance cerrado.'
  },
  {
    id: 'balcarce-fangio',
    name: 'Autódromo Juan Manuel Fangio',
    city: 'Balcarce, Buenos Aires',
    edition: 'Locación Circuito Histórico',
    coordinates: [-58.2917, -37.8931],
    zoom: 16.2,
    pitch: 60,
    bearing: -45,
    description: 'Trazado mítico enclavado en la sierra La Barrosa, cuna del quíntuple campeón mundial Juan Manuel Fangio.'
  }
];

export const CATEGORIES = {
  cars: { label: 'Autos & Pilotos', icon: 'fa-car-side', color: '#d92d20' },
  paddock: { label: 'Paddock & Boxes', icon: 'fa-warehouse', color: '#d4af37' },
  vip: { label: 'VIP & Hospitality', icon: 'fa-champagne-glasses', color: '#7c3aed' },
  food: { label: 'Gastronomía & Trucks', icon: 'fa-utensils', color: '#ea580c' },
  stage: { label: 'Escenario & Podio', icon: 'fa-trophy', color: '#0284c7' },
  track: { label: 'Pistas & Dinámica', icon: 'fa-road', color: '#10b981' },
  service: { label: 'Servicios & Acceso', icon: 'fa-square-parking', color: '#64748b' }
};

export const DOLORES_INITIAL_DATA = {
  zones: [
    {
      id: 'zone-paddock',
      name: 'Paddock Central & Boxes de Exhibición',
      category: 'paddock',
      color: '#d4af37',
      opacity: 0.65,
      height: 4.5, // 3D Extrusion meters
      area: 8450,
      description: 'Zona de boxes donde los propietarios preparan los vehículos, calientan motores y reciben al público con vista privilegiada al pitlane.',
      coordinates: [
        [-57.6985, -36.3268],
        [-57.6970, -36.3262],
        [-57.6967, -36.3270],
        [-57.6982, -36.3276],
        [-57.6985, -36.3268]
      ]
    },
    {
      id: 'zone-vip-club',
      name: 'Carpa VIP Club & Lounge Lucas Abriata',
      category: 'vip',
      color: '#8b5cf6',
      opacity: 0.75,
      height: 5.5,
      area: 2100,
      description: 'Espacio exclusivo para coleccionistas, sponsors y prensa internacional. Cobertura en vivo, degustación de vinos y terraza con vista a la recta.',
      coordinates: [
        [-57.6965, -36.3261],
        [-57.6957, -36.3258],
        [-57.6954, -36.3264],
        [-57.6962, -36.3267],
        [-57.6965, -36.3261]
      ]
    },
    {
      id: 'zone-concours-lawn',
      name: 'Lawn de Concurso de Elegancia & Supercars',
      category: 'cars',
      color: '#059669',
      opacity: 0.6,
      height: 2.0,
      area: 12500,
      description: 'Sector de césped acondicionado donde se exponen las joyas estáticas: Ferraris clásicas, Alfa Romeos preguerra y Porsches refrigerados por aire.',
      coordinates: [
        [-57.6995, -36.3255],
        [-57.6972, -36.3248],
        [-57.6968, -36.3256],
        [-57.6991, -36.3263],
        [-57.6995, -36.3255]
      ]
    },
    {
      id: 'zone-food-boulevard',
      name: 'Boulevard Gastronómico & Beer Garden Gran Turismo',
      category: 'food',
      color: '#f97316',
      opacity: 0.7,
      height: 3.5,
      area: 4200,
      description: 'Selección de food trucks gourmet, café de especialidad y música lounge que recrean la ambientación del lobby de Gran Turismo.',
      coordinates: [
        [-57.6962, -36.3273],
        [-57.6948, -36.3268],
        [-57.6945, -36.3274],
        [-57.6959, -36.3279],
        [-57.6962, -36.3273]
      ]
    },
    {
      id: 'zone-helipad',
      name: 'Helipuerto & Pista de Aterrizaje Privada',
      category: 'service',
      color: '#0284c7',
      opacity: 0.6,
      height: 1.0,
      area: 3600,
      description: 'Zona de recepción para los asistentes que llegaron en helicópteros y aeronaves privadas directamente al aeródromo contiguo de Dolores.',
      coordinates: [
        [-57.6945, -36.3250],
        [-57.6932, -36.3245],
        [-57.6928, -36.3253],
        [-57.6941, -36.3258],
        [-57.6945, -36.3250]
      ]
    }
  ],

  routes: [
    {
      id: 'route-dynamic-runway',
      name: 'Recta Principal: Trazada de Aceleración y Sonido',
      category: 'track',
      color: '#ef4444',
      width: 7,
      dash: [2, 1],
      lengthMeters: 750,
      description: 'El corazón de Carbriata Concours: la recta del Autódromo donde los autos aceleran a fondo en tandas individuales para el deleite sonoro de las 12.000 personas.',
      coordinates: [
        [-57.7012, -36.3279],
        [-57.6975, -36.3266],
        [-57.6942, -36.3254],
        [-57.6925, -36.3248]
      ]
    },
    {
      id: 'route-parade-loop',
      name: 'Circuito de Desfile Lento & Vuelta de Honor',
      category: 'track',
      color: '#d4af37',
      width: 5,
      dash: [1, 0],
      lengthMeters: 1820,
      description: 'Ruta perimetral para el desfile calmo de vehículos premiados y clásicos de época.',
      coordinates: [
        [-57.6942, -36.3254],
        [-57.6928, -36.3272],
        [-57.6945, -36.3292],
        [-57.6985, -36.3290],
        [-57.7010, -36.3283],
        [-57.7012, -36.3279]
      ]
    }
  ],

  attractions: [
    {
      id: 'car-audi-quattro-s1',
      title: 'Audi Sport Quattro S1 E2',
      subtitle: 'Réplica Oficial Grupo B - Leyenda del Rally',
      category: 'cars',
      year: 1985,
      hp: '550 CV',
      engine: '2.1L 5 Cilindros Turbo 20V',
      owner: 'Colección Privada / Estrella de Dolores 2026',
      badge: 'Estrella del Evento',
      soundRev: 'audi-quattro',
      coordinates: [-57.6975, -36.3264],
      description: 'La máquina que hizo vibrar el autódromo de Dolores. Con su icónico alerón trasero, ensanches de kevlar y el inconfundible chillido de la wastegate del 5 cilindros turbo.',
      photos: [
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'car-ferrari-f40',
      title: 'Ferrari F40',
      subtitle: 'El último superdeportivo aprobado por Enzo Ferrari',
      category: 'cars',
      year: 1989,
      hp: '478 CV',
      engine: '2.9L Twin-Turbo V8',
      owner: 'Colección Privada Argentina',
      badge: 'Supercar Icon',
      soundRev: 'ferrari-v8',
      coordinates: [-57.6971, -36.3262],
      description: 'Exhibido en el Paddock principal. Chasis tubular de fibra de carbono y kevlar en perfecto Rosso Corsa.',
      photos: [
        'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'car-porsche-rs',
      title: 'Porsche 911 Carrera RS 2.7',
      subtitle: 'Homologación Touring 1973 - Ducktail Original',
      category: 'cars',
      year: 1973,
      hp: '210 CV',
      engine: '2.7L Boxer 6 Cilindros Air-Cooled',
      owner: 'Club Porsche Argentina',
      badge: 'Clásico Puro',
      soundRev: 'boxer-6',
      coordinates: [-57.6980, -36.3256],
      description: 'En color Grand Prix White con grafismos laterales en Viper Green y el legendario alerón cola de pato. Una de las siluetas más admiradas del lawn.',
      photos: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'car-alfa-gta',
      title: 'Alfa Romeo Giulia Sprint GTA',
      subtitle: 'Autodelta Corsa 1600 - Carrocería Peraluman',
      category: 'cars',
      year: 1965,
      hp: '170 CV',
      engine: '1.6L Twin Spark DOHC',
      owner: 'Registro Alfa Romeo Histórico',
      badge: 'Legado Italiano',
      soundRev: 'alfa-twin-spark',
      coordinates: [-57.6986, -36.3258],
      description: 'Joyas aligeradas por Autodelta con remaches a la vista y trompa baja. Hizo varias pasadas dinámicas en el trazado de Dolores.',
      photos: [
        'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'car-shelby-cobra',
      title: 'Shelby Cobra 427 S/C',
      subtitle: 'Big Block 7.0 Litros con Escapes Laterales',
      category: 'cars',
      year: 1966,
      hp: '485 CV',
      engine: 'Ford 427 FE V8 7.0L',
      owner: 'Colección Clásica Sport',
      badge: 'V8 Thunder',
      soundRev: 'v8-muscle',
      coordinates: [-57.6978, -36.3267],
      description: 'Pintado en Guardsman Blue con franjas Wimbledon White. Su bramido en la recta de Dolores se escuchó en toda la ciudad.',
      photos: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'poi-stage',
      title: 'Escenario Central & Podio Carbriata',
      subtitle: 'Presentaciones, entrevistas con Lucas Abriata y entrega de premios',
      category: 'stage',
      year: 2026,
      hp: 'Live Sound',
      engine: 'Gran Turismo DJ Set',
      owner: 'Organización Carbriata Concours',
      badge: 'Ceremonia',
      coordinates: [-57.6961, -36.3264],
      description: 'El punto de encuentro donde se entrevistó a los pilotos y se entregaron las distinciones "Best of Show" y "Premio de la Gente".',
      photos: [
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'poi-paddock-boxes',
      title: 'Boxes de Preparación & Pitlane',
      subtitle: 'Inspección técnica, recambio de neumáticos y encendido de motores',
      category: 'paddock',
      year: 2026,
      hp: 'Pit Stop',
      engine: 'Acceso Paddock Pass',
      owner: 'Comisariado Deportivo',
      badge: 'Paddock Pass',
      coordinates: [-57.6976, -36.3270],
      description: 'El área técnica donde el público interactúa de cerca con los mecánicos y escucha la sinfonía de carburadores y turbos regulando.',
      photos: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'poi-food-truck-main',
      title: 'Paseo de Food Trucks & Barra Artesanal',
      subtitle: 'Carnes ahumadas, hamburguesas de autor y cafetería italiana',
      category: 'food',
      year: 2026,
      hp: 'Gourmet',
      engine: '12 Estaciones Culinarias',
      owner: 'Gastronomía Carbriata',
      badge: 'Food & Drinks',
      coordinates: [-57.6953, -36.3273],
      description: 'Espacio de sombra y mesas rústicas frente al trazado para almorzar mientras los autos giran.',
      photos: [
        'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  ]
};
