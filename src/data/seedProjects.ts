import type { Project } from '../types/plan';

export const seedProjects: Project[] = [
{
  id: 'carbriata-2027',
  name: 'Carbriata Concours 2027',
  description:
  'Segunda edición del festival de autos en movimiento. Expo sin vallado y tramo de 800 m de pista con dos chicanas: cada auto sale dos veces por día. Objetivo: 150+ autos en pista y más de 12.000 visitantes.',
  location: 'Autódromo de Dolores, Buenos Aires',
  websiteUrl: 'https://carbriata.com',
  template: 'event',
  center: { lat: -36.32635, lng: -57.6969, zoom: 16 },
  basemap: 'satellite',
  hiddenCategoryIds: [],
  createdAt: 1789900000000,
  updatedAt: 1790640000000,
  categories: [
  { id: 'expo', name: 'Exhibición', color: '#E8590C', icon: 'car', kindHint: 'area' },
  { id: 'pista', name: 'Pista', color: '#E03131', icon: 'flag', kindHint: 'line' },
  { id: 'estacionamiento', name: 'Estacionamiento', color: '#1C7ED6', icon: 'parking' },
  { id: 'gastronomia', name: 'Gastronomía', color: '#F59F00', icon: 'food' },
  { id: 'shows', name: 'Shows y actividades', color: '#AE3EC9', icon: 'music' },
  { id: 'servicios', name: 'Seguridad y servicios', color: '#0CA678', icon: 'ambulance', kindHint: 'point' },
  { id: 'accesos', name: 'Accesos y circulación', color: '#F06595', icon: 'door' },
  { id: 'verde', name: 'Espacios verdes', color: '#74B816', icon: 'trees' }],

  features: [
  {
    id: 'f-expo',
    kind: 'area',
    name: 'Sector Expo',
    categoryId: 'expo',
    notes: '~150 autos en exhibición, accesibles al público sin vallado. Salen a pista por turnos.',
    coords: [
    [-36.325, -57.699],
    [-36.325, -57.6962],
    [-36.3268, -57.6962],
    [-36.3268, -57.699]],

    createdAt: 1789900100000
  },
  {
    id: 'f-pista',
    kind: 'line',
    name: 'Tramo de pista',
    categoryId: 'pista',
    notes: 'Últimas curvas antes de la recta. Sin cronómetro. Burnouts y derrapes controlados permitidos.',
    coords: [
    [-36.3272, -57.7],
    [-36.328, -57.699],
    [-36.3284, -57.6975],
    [-36.3281, -57.696],
    [-36.329, -57.6948],
    [-36.33, -57.6945],
    [-36.3305, -57.696],
    [-36.3303, -57.6985]],

    createdAt: 1789900200000
  },
  {
    id: 'f-recorrido-streetview',
    kind: 'line',
    name: 'Paseo Principal (Recorrido 360°)',
    categoryId: 'accesos',
    notes: 'Recorrido interactivo con 5 puntos fotografiados a nivel de suelo para caminar virtualmente por el predio.',
    coords: [
      [-36.3242, -57.6990],
      [-36.3249, -57.6982],
      [-36.3256, -57.6975],
      [-36.3262, -57.6968],
      [-36.3268, -57.6962]
    ],
    routeWaypoints: [
      {
        index: 0,
        title: 'Acceso y Entrada Principal',
        caption: 'Pórtico de bienvenida, control de acreditaciones y acceso peatonal al evento.',
        image: '/streetview/point1_entrance.jpg'
      },
      {
        index: 1,
        title: 'Paseo Central Arbolado',
        caption: 'Avenida principal con jardines florales, cartelería digital y circulación fluida.',
        image: '/streetview/point2_promenade.jpg'
      },
      {
        index: 2,
        title: 'Pabellón de Stands y Sponsors',
        caption: 'Pabellones modernos, carpas de exhibición, stands de marcas y demostraciones.',
        image: '/streetview/point3_stands.jpg'
      },
      {
        index: 3,
        title: 'Patio Gastronómico & Food Trucks',
        caption: 'Pérgolas de madera con guirnaldas de luces, mesas al aire libre y variedad culinaria.',
        image: '/streetview/point4_foodcourt.jpg'
      },
      {
        index: 4,
        title: 'Plaza Central & Escenario Principal',
        caption: 'Gran explanada verde para el público con escenario central y shows en vivo.',
        image: '/streetview/point5_plaza.jpg'
      }
    ],
    createdAt: 1789900250000
  },
  {
    id: 'f-chicana-1',
    kind: 'point',
    name: 'Chicana 1',
    categoryId: 'pista',
    notes: 'Conos. Revisar con seguridad de pista.',
    coords: [[-36.3284, -57.6975]],
    createdAt: 1789900300000
  },
  {
    id: 'f-chicana-2',
    kind: 'point',
    name: 'Chicana 2',
    categoryId: 'pista',
    notes: '',
    coords: [[-36.33, -57.6945]],
    createdAt: 1789900400000
  },
  {
    id: 'f-preferencial',
    kind: 'area',
    name: 'Estacionamiento Preferencial de Autos Interesantes',
    categoryId: 'estacionamiento',
    notes: 'Para visitantes que llegan en autos destacados. Cupo aprox. 100.',
    coords: [
    [-36.3238, -57.7005],
    [-36.3238, -57.6985],
    [-36.3247, -57.6985],
    [-36.3247, -57.7005]],

    createdAt: 1789900500000
  },
  {
    id: 'f-estac-general',
    kind: 'area',
    name: 'Estacionamiento general',
    categoryId: 'estacionamiento',
    notes: '30 personas acomodando autos en la entrada.',
    coords: [
    [-36.3225, -57.701],
    [-36.3225, -57.696],
    [-36.3236, -57.696],
    [-36.3236, -57.701]],

    createdAt: 1789900600000
  },
  {
    id: 'f-parrillas',
    kind: 'area',
    name: 'Parrillas y food trucks',
    categoryId: 'gastronomia',
    notes: 'Choripanes, hamburguesas y sánguches de vacío. ~100 personas en gastronomía.',
    coords: [
    [-36.3252, -57.6958],
    [-36.3252, -57.6945],
    [-36.3262, -57.6942],
    [-36.3266, -57.6955]],

    createdAt: 1789900700000
  },
  {
    id: 'f-bosque',
    kind: 'area',
    name: 'Mini bosque (sombra)',
    categoryId: 'verde',
    notes: 'Zona de descanso con sombra natural.',
    coords: [
    [-36.3258, -57.6938],
    [-36.3254, -57.6925],
    [-36.3264, -57.692],
    [-36.3272, -57.693],
    [-36.3268, -57.694]],

    createdAt: 1789900800000
  },
  {
    id: 'f-jazz',
    kind: 'point',
    name: 'Escenario jazz',
    categoryId: 'shows',
    notes: 'Recital por la tarde. Sin música fuerte en el resto del predio: los protagonistas son los motores.',
    coords: [[-36.3263, -57.6931]],
    createdAt: 1789900900000
  },
  {
    id: 'f-subasta',
    kind: 'point',
    name: 'Subasta en vivo',
    categoryId: 'shows',
    notes: '',
    coords: [[-36.3259, -57.6968]],
    createdAt: 1789901000000
  },
  {
    id: 'f-entrada',
    kind: 'point',
    name: 'Entrada principal · Ruta 2',
    categoryId: 'accesos',
    notes: 'Acceso desde Autovía 2, km 210.',
    coords: [[-36.3222, -57.7018]],
    createdAt: 1789901100000
  },
  {
    id: 'f-circulacion',
    kind: 'line',
    name: 'Circulación peatonal',
    categoryId: 'accesos',
    notes: '',
    coords: [
    [-36.3222, -57.7018],
    [-36.3237, -57.7012],
    [-36.325, -57.6992]],

    createdAt: 1789901200000
  },
  {
    id: 'f-ambulancia',
    kind: 'point',
    name: 'Ambulancias',
    categoryId: 'servicios',
    notes: 'Dos unidades.',
    coords: [[-36.327, -57.6995]],
    createdAt: 1789901300000
  },
  {
    id: 'f-bomberos',
    kind: 'point',
    name: 'Bomberos',
    categoryId: 'servicios',
    notes: '',
    coords: [[-36.3292, -57.7005]],
    createdAt: 1789901400000
  },
  {
    id: 'f-banos',
    kind: 'point',
    name: 'Baños',
    categoryId: 'servicios',
    notes: '',
    coords: [[-36.325, -57.695]],
    createdAt: 1789901500000
  }]

},
{
  "id": "ijdhormmv8a4760",
  "name": "Barrio Carlina",
  "description": "",
  "location": "Alto Los Cardales, Partido de Campana",
  "template": "realEstate",
  "center": {
    "lat": -34.301438,
    "lng": -58.942922,
    "zoom": 16.5
  },
  "basemap": "satellite",
  "categories": [
    {
      "id": "lots",
      "name": "Lots",
      "color": "#E8590C",
      "icon": "house",
      "kindHint": "area"
    },
    {
      "id": "streets",
      "name": "Streets",
      "color": "#F59F00",
      "icon": "route",
      "kindHint": "line"
    },
    {
      "id": "green",
      "name": "Green spaces",
      "color": "#74B816",
      "icon": "trees"
    },
    {
      "id": "amenities",
      "name": "Amenities",
      "color": "#AE3EC9",
      "icon": "store"
    },
    {
      "id": "common",
      "name": "Common areas",
      "color": "#1C7ED6",
      "icon": "building"
    },
    {
      "id": "poi",
      "name": "Points of interest",
      "color": "#F06595",
      "icon": "pin",
      "kindHint": "point"
    },
    {
      "id": "zones",
      "name": "Zones",
      "color": "#E8590C",
      "icon": "tent",
      "kindHint": "area"
    },
    {
      "id": "stages",
      "name": "Stages & shows",
      "color": "#AE3EC9",
      "icon": "music"
    },
    {
      "id": "food",
      "name": "Food & drinks",
      "color": "#F59F00",
      "icon": "food"
    },
    {
      "id": "parking",
      "name": "Parking",
      "color": "#1C7ED6",
      "icon": "parking"
    },
    {
      "id": "access",
      "name": "Access & paths",
      "color": "#F06595",
      "icon": "door",
      "kindHint": "line"
    },
    {
      "id": "safety",
      "name": "Safety & services",
      "color": "#0CA678",
      "icon": "ambulance",
      "kindHint": "point"
    }
  ],
  "features": [
    {
      "id": "6fux4gomv8aabt7",
      "kind": "line",
      "coords": [
        [
          -34.30501815089936,
          -58.939901760668334
        ],
        [
          -34.30419261690571,
          -58.94047683925086
        ],
        [
          -34.30332152215112,
          -58.94248724392484
        ],
        [
          -34.30286359178835,
          -58.94281183532002
        ]
      ],
      "name": "Traza Principal de Obra",
      "categoryId": "streets",
      "notes": "Avenida principal del desarrollo en obra. Calzada de tosca consolidada, zanjeo perimetral para redes de servicios y tránsito continuo de camiones y maquinaria pesada.",
      "images": [
        "/streetview/carlina/point1.jpg"
      ],
      "createdAt": 1791992869963,
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Acceso Principal y Portal de Obra",
          "caption": "Entrada provisoria al loteo con cerco de obra, cartel reglamentario y control de ingreso de camiones.",
          "image": "/streetview/carlina/point1.jpg"
        },
        {
          "index": 1,
          "title": "Avenida Central - Movimiento de Suelos",
          "caption": "Apertura y nivelación de traza vial mediante motoniveladora y compactación de suelo tosca para futuras calzadas.",
          "image": "/streetview/carlina/point2.jpg"
        },
        {
          "index": 2,
          "title": "Sector Lotes y Zanjeo de Redes",
          "caption": "Trazado de cordones cuneta y zanjas de distribución subterránea de agua corriente, tendido eléctrico y pluviales.",
          "image": "/streetview/carlina/point3.jpg"
        },
        {
          "index": 3,
          "title": "Cul-de-sac y Primeras Obras",
          "caption": "Rotonda final de la calle en apertura con plateas de fundación y replanteo de parcelas residenciales.",
          "image": "/streetview/carlina/point4.jpg"
        }
      ]
    },
    {
      "id": "rcan1f8mv8afn09",
      "kind": "area",
      "coords": [
        [
          -34.305525757304714,
          -58.94090316978896
        ],
        [
          -34.305162286363434,
          -58.94121421353097
        ],
        [
          -34.304980550302844,
          -58.94071350897065
        ],
        [
          -34.305356555510535,
          -58.94041005166137
        ]
      ],
      "name": "Lote 23422",
      "categoryId": "lots",
      "notes": "Parcela residencial desmalezada y nivelada. Delimitación con estacas de agrimensura y amojonamiento topográfico lista para excavación de cimientos.",
      "images": [
        "/streetview/carlina/lote_23422_1.jpg"
      ],
      "createdAt": 1791993117753
    },
    {
      "id": "yt6qwlbmv8afquu",
      "kind": "area",
      "coords": [
        [
          -34.30511841801675,
          -58.94121611013915
        ],
        [
          -34.304754947075466,
          -58.94152715388116
        ],
        [
          -34.304573211014876,
          -58.941026449320844
        ],
        [
          -34.30494921622257,
          -58.94072299201156
        ]
      ],
      "name": "Lote 12321",
      "categoryId": "lots",
      "notes": "Etapa de movimiento de suelo y zanjeo de cimientos. Replanteo de ejes de obra, excavación para vigas de fundación y acopio de áridos.",
      "images": [
        "/streetview/carlina/lote_12321_1.jpg"
      ],
      "createdAt": 1791993122742
    },
    {
      "id": "rszz2wnmv8afv0r",
      "kind": "area",
      "coords": [
        [
          -34.305694959550294,
          -58.94214924136517
        ],
        [
          -34.30533148860901,
          -58.94246028510718
        ],
        [
          -34.305149752548424,
          -58.941959580546865
        ],
        [
          -34.305525757756115,
          -58.94165612323758
        ]
      ],
      "name": "Lote 23211",
      "categoryId": "lots",
      "notes": "Llenado de platea de hormigón armado H-21. Encofrados perimetrales de madera, malla electrosoldada y cañerías sanitarias bajo losa.",
      "images": [
        "/streetview/carlina/lote_23211_1.jpg"
      ],
      "createdAt": 1791993128139
    },
    {
      "id": "omnzmh0mv8agyxg",
      "kind": "area",
      "coords": [
        [
          -34.30527748011667,
          -58.94248361411409
        ],
        [
          -34.30491400917539,
          -58.9427946578561
        ],
        [
          -34.3047322731148,
          -58.94229395329578
        ],
        [
          -34.30510827832249,
          -58.941990495986495
        ]
      ],
      "name": "Lote 4567",
      "categoryId": "lots",
      "notes": "Obra gruesa en avance. Levantamiento de muros de ladrillo cerámico portante, columnas de hormigón armado y andamios tubulares de fachada.",
      "images": [
        "/streetview/carlina/lote_4567_1.jpg"
      ],
      "createdAt": 1791993179860,
      "color": "#D4AF37"
    },
    {
      "id": "rl5oukumv8ah2p8",
      "kind": "area",
      "coords": [
        [
          -34.30486980207181,
          -58.942837665704054
        ],
        [
          -34.30450633113053,
          -58.94314870944606
        ],
        [
          -34.30432459506994,
          -58.94264800488575
        ],
        [
          -34.304700600277634,
          -58.94234454757646
        ]
      ],
      "name": "Lote 1234",
      "categoryId": "lots",
      "notes": "Vivienda unifamiliar moderna con estructura avanzada. Losas de hormigón visto, cubierta estanca, tabiquería perimetral y contrapisos.",
      "images": [
        "/streetview/carlina/lote_1234_1.jpg"
      ],
      "createdAt": 1791993184748,
      "color": "#10B981"
    },
    {
      "id": "417xf5umv8ahkzc",
      "kind": "point",
      "coords": [
        [
          -34.303084815965335,
          -58.94308805465699
        ]
      ],
      "name": "Obrador Central y Showroom de Ventas",
      "categoryId": "parking",
      "notes": "Contenedores modulares de jefatura de obra, vestuarios de personal, cartel con render del máster plan y oficina de atención comercial.",
      "images": [
        "/streetview/carlina/marker_showroom.jpg"
      ],
      "createdAt": 1791993208440
    },
    {
      "id": "rfm2qormv8ahuzm",
      "kind": "area",
      "coords": [
        [
          -34.3032886589137,
          -58.943967819213874
        ],
        [
          -34.30371406869046,
          -58.943699598312385
        ],
        [
          -34.303235482540096,
          -58.942734003067024
        ],
        [
          -34.302836658664745,
          -58.94305586814881
        ]
      ],
      "name": "Playa de Estacionamiento de Obra y Visitas",
      "categoryId": "parking",
      "notes": "Sector consolidado con piedra partida para estacionamiento de vehículos del personal técnico, camionetas de contratistas y visitas.",
      "images": [
        "/streetview/carlina/estacionamiento_1.jpg"
      ],
      "createdAt": 1791993221410
    },
    {
      "id": "l2fykzjmv8rgzyc",
      "kind": "area",
      "coords": [
        [
          -34.30445413699435,
          -58.94315823691853
        ],
        [
          -34.30409066605307,
          -58.94346928066054
        ],
        [
          -34.30390892999248,
          -58.94296857610022
        ],
        [
          -34.30428493520017,
          -58.942665118790934
        ]
      ],
      "name": "Lote 23212",
      "categoryId": "lots",
      "notes": "Montaje de estructura de techo, cabriadas de madera/acero galvanizado y aislación hidrófuga en vivienda en construcción.",
      "images": [
        "/streetview/carlina/lote_roof_framing.jpg"
      ],
      "createdAt": 1792021734660
    },
    {
      "id": "ylgyz8umv8rh90u",
      "kind": "point",
      "coords": [
        [
          -34.30418466706002,
          -58.943057716684834
        ]
      ],
      "name": "Pilar Eléctrico y Acometida Provisoria",
      "categoryId": "lots",
      "notes": "Tablero general de obra con disyuntores y tomas trifásicas/monofásicas para alimentación de hormigoneras, amoladoras y herramientas.",
      "images": [
        "/streetview/carlina/marker_electric.jpg"
      ],
      "createdAt": 1792021746414
    },
    {
      "id": "3vtssy9mv8rhee1",
      "kind": "point",
      "coords": [
        [
          -34.30460454341157,
          -58.942739086510095
        ]
      ],
      "name": "Punto Geodésico y Esquina de Replanteo",
      "categoryId": "poi",
      "notes": "Hito de agrimensura y verificación de niveles con estación total láser para cotas de nivelación de parcelas.",
      "images": [
        "/streetview/carlina/lote_slab_corner.jpg"
      ],
      "createdAt": 1792021753369,
      "color": "#10B981"
    },
    {
      "id": "anvc25hmv8rhjvl",
      "kind": "point",
      "coords": [
        [
          -34.30504321795435,
          -58.94226114124799
        ]
      ],
      "name": "Tendido de Redes Subterráneas",
      "categoryId": "poi",
      "notes": "Zanja madre para cruce de cañerías de agua corriente, bitubos de fibra óptica y tritubo eléctrico de media tensión.",
      "images": [
        "/streetview/carlina/marker_utility.jpg"
      ],
      "createdAt": 1792021760481,
      "color": "#D4AF37"
    },
    {
      "id": "3x4tffnmv8rhpun",
      "kind": "point",
      "coords": [
        [
          -34.30543802308362,
          -58.94204113469875
        ]
      ],
      "name": "Acopio de Materiales y Áridos",
      "categoryId": "zones",
      "notes": "Sector de descarga y estiba de pallets de ladrillos cerámicos, bolsas de cemento bajo lona y silos de arena gruesa.",
      "images": [
        "/streetview/carlina/marker_bricks.jpg"
      ],
      "createdAt": 1792021768223
    },
    {
      "id": "afz7a7pmv8ri5nu",
      "kind": "area",
      "coords": [
        [
          -34.3033506979737,
          -58.94114613533021
        ],
        [
          -34.30225171355496,
          -58.941972255706794
        ],
        [
          -34.302739168096046,
          -58.94290566444398
        ]
      ],
      "name": "Futuro Parque Central (Nivelación)",
      "categoryId": "green",
      "notes": "Área verde de uso común en etapa de desmonte, perfilado de pendientes pluviales y preparación de suelo para siembra de césped.",
      "images": [
        "/streetview/carlina/area_green_prep.jpg"
      ],
      "createdAt": 1792021788714
    },
    {
      "id": "quog0femv8ri8y0",
      "kind": "point",
      "coords": [
        [
          -34.302836658664745,
          -58.941972255706794
        ]
      ],
      "name": "Perforación y Pozo de Agua de Obra",
      "categoryId": "green",
      "notes": "Bomba sumergible a segunda napa con tanque cisterna móvil para abastecimiento de agua a camiones regadores y hormigón.",
      "images": [
        "/streetview/carlina/marker_water_well.jpg"
      ],
      "createdAt": 1792021792968
    },
    {
      "id": "vniabx6mv8rir3c",
      "kind": "line",
      "coords": [
        [
          -34.29718201861496,
          -58.94428968429566
        ],
        [
          -34.29774927241289,
          -58.94418239593506
        ],
        [
          -34.29815698371405,
          -58.9447832107544
        ],
        [
          -34.29845833427342,
          -58.94484758377076
        ],
        [
          -34.298972400379526,
          -58.94527673721314
        ],
        [
          -34.29961054703085,
          -58.945212364196784
        ],
        [
          -34.299947344697735,
          -58.94501924514771
        ],
        [
          -34.300567757917264,
          -58.945941925048835
        ],
        [
          -34.30315571791653,
          -58.94413948059083
        ]
      ],
      "name": "Boulevard Secundario en Apertura",
      "categoryId": "streets",
      "notes": "Traza secundaria de circulación interna. Apertura de caja de calle, tendido de desagües y conexión entre manzanas del barrio.",
      "images": [
        "/streetview/carlina/path2_pt1.jpg"
      ],
      "createdAt": 1792021816488,
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Boulevard Secundario - Acceso Norte",
          "caption": "Apertura de calzada secundaria con tosca seleccionada y cunetas laterales.",
          "image": "/streetview/carlina/path2_pt1.jpg"
        },
        {
          "index": 1,
          "title": "Corte y Nivelación de Traza",
          "caption": "Operación de bulldozer perfilando taludes y desniveles del terreno natural.",
          "image": "/streetview/carlina/path2_pt2.jpg"
        },
        {
          "index": 2,
          "title": "Frente de Obras y Manzanas",
          "caption": "Vista hacia las primeras viviendas unifamiliares con entramados de madera y hormigón.",
          "image": "/streetview/carlina/path2_pt3.jpg"
        },
        {
          "index": 3,
          "title": "Empalme con Red Troncal",
          "caption": "Cruce de calzada con cañerías subterráneas y amojonamiento de esquinas.",
          "image": "/streetview/carlina/path2_pt4.jpg"
        }
      ]
    },
    {
      "id": "x0ddklgmv8rj2qj",
      "kind": "area",
      "coords": [
        [
          -34.302047651903464,
          -58.94191216534231
        ],
        [
          -34.30125800791119,
          -58.94244321563355
        ],
        [
          -34.30084438190469,
          -58.94148732510932
        ],
        [
          -34.30165909785093,
          -58.94101696627993
        ]
      ],
      "name": "Comedor y Vestuario de Cuadrillas",
      "categoryId": "food",
      "notes": "Módulo de descanso y comedor para operarios de obra, sanitarios químicos y sector techado para pausas de cuadrilla.",
      "images": [
        "/streetview/carlina/area_canteen.jpg"
      ],
      "createdAt": 1792021831579
    },
    {
      "id": "hv1waflmv8rj7lr",
      "kind": "point",
      "coords": [
        [
          -34.301608961713214,
          -58.94183630101499
        ]
      ],
      "name": "Puesto de Seguridad e Hidratación",
      "categoryId": "food",
      "notes": "Puesto de hidratación con dispenser de agua fresca, botiquín de primeros auxilios y entrega de elementos de protección personal (EPP).",
      "images": [
        "/streetview/carlina/marker_firstaid.jpg"
      ],
      "createdAt": 1792021837887
    }
  ],
  "hiddenCategoryIds": [],
  "createdAt": 1791992584008,
  "updatedAt": 1792033561349
},
{
  "id": "i6666hqmv8mdpge",
  "name": "Planta Logística",
  "description": "Predio industrial logístico con accesos para transporte pesado, pesaje de camiones, naves de almacenaje, dársenas de carga y recorridos virtuales a nivel del suelo en cada trazado.",
  "location": "Ford Argentina, Luis María Drago",
  "websiteUrl": "",
  "template": "event",
  "center": {
    "lat": -34.438662,
    "lng": -58.702736,
    "zoom": 16
  },
  "basemap": "satellite",
  "categories": [
    {
      "id": "zones",
      "name": "Zones",
      "color": "#E8590C",
      "icon": "tent",
      "kindHint": "area"
    },
    {
      "id": "stages",
      "name": "Stages & shows",
      "color": "#AE3EC9",
      "icon": "music"
    },
    {
      "id": "food",
      "name": "Food & drinks",
      "color": "#F59F00",
      "icon": "food"
    },
    {
      "id": "parking",
      "name": "Parking",
      "color": "#1C7ED6",
      "icon": "parking"
    },
    {
      "id": "access",
      "name": "Access & paths",
      "color": "#F06595",
      "icon": "door",
      "kindHint": "line"
    },
    {
      "id": "safety",
      "name": "Safety & services",
      "color": "#0CA678",
      "icon": "ambulance",
      "kindHint": "point"
    }
  ],
  "features": [
    {
      "id": "xwy1noimv8mhomw",
      "kind": "area",
      "coords": [
        [
          -34.438456,
          -58.706021
        ],
        [
          -34.438418,
          -58.705981
        ],
        [
          -34.438363,
          -58.705992
        ],
        [
          -34.438208,
          -58.705895
        ],
        [
          -34.438175,
          -58.705865
        ],
        [
          -34.438151,
          -58.705922
        ],
        [
          -34.43785,
          -58.705739
        ],
        [
          -34.437803,
          -58.705773
        ],
        [
          -34.437775,
          -58.705712
        ],
        [
          -34.438125,
          -58.704901
        ],
        [
          -34.438188,
          -58.704893
        ],
        [
          -34.438222,
          -58.704821
        ],
        [
          -34.438275,
          -58.704779
        ],
        [
          -34.43892,
          -58.705166
        ],
        [
          -34.438888,
          -58.705257
        ],
        [
          -34.43882,
          -58.705208
        ]
      ],
      "name": "Parking",
      "categoryId": "parking",
      "notes": "Playa de estacionamiento pavimentada para personal operativo, administrativos, visitantes y flota liviana de logística.",
      "images": [
        "/streetview/logistica/area_parking.jpg"
      ],
      "createdAt": 1792011060000
    },
    {
      "id": "ioa26ummv8mhxok",
      "kind": "point",
      "coords": [
        [
          -34.438375,
          -58.705303
        ]
      ],
      "name": "Parking 1",
      "categoryId": "parking",
      "notes": "Acceso peatonal y vehicular al estacionamiento central.",
      "images": [
        "/streetview/logistica/area_parking.jpg"
      ],
      "createdAt": 1792011070000
    },
    {
      "id": "zcgu49wmv8mibw2",
      "kind": "area",
      "coords": [
        [
          -34.439765,
          -58.703282
        ],
        [
          -34.439031,
          -58.705085
        ],
        [
          -34.438372,
          -58.704693
        ],
        [
          -34.43846,
          -58.704484
        ],
        [
          -34.438261,
          -58.704393
        ],
        [
          -34.438969,
          -58.70273
        ]
      ],
      "name": "Area 2",
      "categoryId": "parking",
      "notes": "Playa de maniobras y pulmón de espera para camiones pesados y semirremolques con dársenas de espera numeradas.",
      "images": [
        "/streetview/logistica/area_pulmon_camiones.jpg"
      ],
      "createdAt": 1792011080000
    },
    {
      "id": "jzmosrxmv8mieeb",
      "kind": "point",
      "coords": [
        [
          -34.438686,
          -58.704409
        ]
      ],
      "name": "Parking 2",
      "categoryId": "parking",
      "notes": "Puesto de asignación de dársenas para transporte pesado.",
      "images": [
        "/streetview/logistica/area_pulmon_camiones.jpg"
      ],
      "createdAt": 1792011090000
    },
    {
      "id": "wz1pxpfmv8mjd3n",
      "kind": "line",
      "coords": [
        [
          -34.438876,
          -58.702247
        ],
        [
          -34.439027,
          -58.702397
        ],
        [
          -34.437505,
          -58.705906
        ],
        [
          -34.436567,
          -58.705283
        ],
        [
          -34.435466,
          -58.704472
        ],
        [
          -34.434853,
          -58.70608
        ]
      ],
      "name": "Path 1",
      "categoryId": "access",
      "notes": "",
      "images": [
        "/streetview/logistica/path1_pt0.jpg",
        "/streetview/logistica/path1_pt1.jpg",
        "/streetview/logistica/path1_pt2.jpg",
        "/streetview/logistica/path1_pt3.jpg",
        "/streetview/logistica/path1_pt4.jpg",
        "/streetview/logistica/path1_pt5.jpg"
      ],
      "createdAt": 1792011100000,
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Acceso Principal y Garita de Seguridad",
          "caption": "Ingreso principal al predio logístico con barreras automáticas, control de accesos y garita de vigilancia.",
          "image": "/streetview/logistica/path1_pt0.jpg"
        },
        {
          "index": 1,
          "title": "Control de Báscula y Pesaje de Camiones",
          "caption": "Báscula de pesaje de camiones pesados, verificación de remitos y escaneo de patentes.",
          "image": "/streetview/logistica/path1_pt1.jpg"
        },
        {
          "index": 2,
          "title": "Avenida Central de Circulación Logística",
          "caption": "Arteria troncal de doble mano para camiones de gran porte flanqueada por centros de distribución.",
          "image": "/streetview/logistica/path1_pt2.jpg"
        },
        {
          "index": 3,
          "title": "Derivador Sector Cargas y Almacén 2",
          "caption": "Intersección señalizada para distribución de tránsito pesado hacia dársenas y depósitos.",
          "image": "/streetview/logistica/path1_pt3.jpg"
        },
        {
          "index": 4,
          "title": "Corredor de Naves y Bahías de Descarga",
          "caption": "Línea de portones seccionales y rampas para utilitarios y camiones de distribución interna.",
          "image": "/streetview/logistica/path1_pt4.jpg"
        },
        {
          "index": 5,
          "title": "Terminal Norte de Contenedores y Carga",
          "caption": "Playa de maniobras norte con acopio de contenedores intermodales, grúa pórtico y autoelevadores pesados.",
          "image": "/streetview/logistica/path1_pt5.jpg"
        }
      ]
    },
    {
      "id": "286e1mfmv8mju8t",
      "kind": "area",
      "coords": [
        [
          -34.438669,
          -58.702348
        ],
        [
          -34.438131,
          -58.703577
        ],
        [
          -34.437193,
          -58.702985
        ],
        [
          -34.437743,
          -58.701756
        ]
      ],
      "name": "Depósito 1",
      "categoryId": "zones",
      "notes": "Nave industrial de recepción y expedición de repuestos y componentes con portones seccionales y rampas niveladoras.",
      "images": [
        "/streetview/logistica/area_deposito1.jpg"
      ],
      "createdAt": 1792011110000
    },
    {
      "id": "3pu9quemv8mkn24",
      "kind": "area",
      "coords": [
        [
          -34.439796,
          -58.699875
        ],
        [
          -34.43932,
          -58.701104
        ],
        [
          -34.439007,
          -58.700861
        ],
        [
          -34.43892,
          -58.701028
        ],
        [
          -34.438569,
          -58.70077
        ],
        [
          -34.438832,
          -58.700102
        ],
        [
          -34.438394,
          -58.69992
        ],
        [
          -34.438669,
          -58.698964
        ]
      ],
      "name": "Depósito 2",
      "categoryId": "zones",
      "notes": "Centro de distribución y almacenaje de alta densidad con racks industriales, autoelevadores eléctricos y control de stock.",
      "images": [
        "/streetview/logistica/area_deposito2.jpg"
      ],
      "createdAt": 1792011120000,
      "color": "#D4AF37"
    },
    {
      "id": "hcwpykzmv8ml09e",
      "kind": "point",
      "coords": [
        [
          -34.43897,
          -58.700026
        ]
      ],
      "name": "Depósito 2",
      "categoryId": "safety",
      "notes": "Acceso principal a oficinas técnicas y control de stock de Depósito 2.",
      "images": [
        "/streetview/logistica/area_deposito2.jpg"
      ],
      "createdAt": 1792011130000
    },
    {
      "id": "fnz3wxmmv8mm4c2",
      "kind": "area",
      "coords": [
        [
          -34.441885,
          -58.698615
        ],
        [
          -34.441135,
          -58.700239
        ],
        [
          -34.440621,
          -58.699859
        ],
        [
          -34.441347,
          -58.698266
        ]
      ],
      "name": "Area 5",
      "categoryId": "access",
      "notes": "Playa de acopio exterior, racks industriales de intemperie y preparación de despacho final.",
      "images": [
        "/streetview/logistica/area_sector5_carga.jpg"
      ],
      "createdAt": 1792011140000
    },
    {
      "id": "5su0ldmmv8mmahp",
      "kind": "point",
      "coords": [
        [
          -34.441648,
          -58.69863
        ]
      ],
      "name": "Área de Carga",
      "categoryId": "safety",
      "notes": "Punto neurálgico de carga, estiba de pallets y despacho de camiones playos.",
      "images": [
        "/streetview/logistica/area_sector5_carga.jpg"
      ],
      "createdAt": 1792011150000,
      "color": "#EF4444"
    },
    {
      "id": "nzf2nrvmv8mnerw",
      "kind": "line",
      "coords": [
        [
          -34.438628,
          -58.6964
        ],
        [
          -34.439823,
          -58.697011
        ],
        [
          -34.439363,
          -58.698009
        ],
        [
          -34.438938,
          -58.697655
        ],
        [
          -34.438655,
          -58.698342
        ]
      ],
      "name": "Path 2",
      "categoryId": "access",
      "notes": "",
      "images": [
        "/streetview/logistica/path2_pt0.jpg",
        "/streetview/logistica/path2_pt1.jpg",
        "/streetview/logistica/path2_pt2.jpg",
        "/streetview/logistica/path2_pt3.jpg",
        "/streetview/logistica/path2_pt4.jpg"
      ],
      "createdAt": 1792011160000,
      "color": "#EF4444",
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Acceso Cargas Este (Transporte Pesado)",
          "caption": "Puesto de control perimetral este con barreras de seguridad exclusivo para camiones articulados.",
          "image": "/streetview/logistica/path2_pt0.jpg"
        },
        {
          "index": 1,
          "title": "Boulevard de Maniobras Este",
          "caption": "Avenida de maniobras en pavimento de hormigón de alto tránsito y áreas de estacionamiento de trailers.",
          "image": "/streetview/logistica/path2_pt1.jpg"
        },
        {
          "index": 2,
          "title": "Dársenas de Carga y Descarga (Bays 10 a 12)",
          "caption": "Muelles de carga con fuelles neumáticos, niveladores hidráulicos y semirremolques acoplados.",
          "image": "/streetview/logistica/path2_pt2.jpg"
        },
        {
          "index": 3,
          "title": "Operación de Docks y Autoelevadores",
          "caption": "Sector activo de carga con autoelevadores eléctricos, pallets filmados y personal de logística.",
          "image": "/streetview/logistica/path2_pt3.jpg"
        },
        {
          "index": 4,
          "title": "Playa de Acopio Exterior y Expedición",
          "caption": "Racks metálicos pesados para intemperie, camiones playos y preparación de despacho general.",
          "image": "/streetview/logistica/path2_pt4.jpg"
        }
      ]
    }
  ],
  "hiddenCategoryIds": [],
  "createdAt": 1792011000000,
  "updatedAt": 1792015000000
}
,
{
  "id": "w3xini1mv8zaemz",
  "name": "Carbriata",
  "description": "",
  "location": "Autódromo Miguel Angel Atauri, Circuito Aeróbico",
  "template": "event",
  "center": {
    "lat": -36.326183,
    "lng": -57.698238,
    "zoom": 17
  },
  "basemap": "satellite",
  "categories": [
    {
      "id": "zones",
      "name": "Zones",
      "color": "#E8590C",
      "icon": "tent",
      "kindHint": "area"
    },
    {
      "id": "stages",
      "name": "Stages & shows",
      "color": "#AE3EC9",
      "icon": "music"
    },
    {
      "id": "food",
      "name": "Food & drinks",
      "color": "#F59F00",
      "icon": "food"
    },
    {
      "id": "parking",
      "name": "Parking",
      "color": "#1C7ED6",
      "icon": "parking"
    },
    {
      "id": "access",
      "name": "Access & paths",
      "color": "#F06595",
      "icon": "door",
      "kindHint": "line"
    },
    {
      "id": "safety",
      "name": "Safety & services",
      "color": "#0CA678",
      "icon": "ambulance",
      "kindHint": "point"
    }
  ],
  "features": [
    {
      "id": "6h03x2dmv8zcwj1",
      "kind": "area",
      "coords": [
        [
          -36.323378044480044,
          -57.700529004546084
        ],
        [
          -36.32303575562014,
          -57.700529004546084
        ],
        [
          -36.322654574803856,
          -57.70033478736878
        ],
        [
          -36.32251626811581,
          -57.70008802413941
        ],
        [
          -36.32240007232037,
          -57.699724842676495
        ],
        [
          -36.32280348732332,
          -57.69916344665432
        ],
        [
          -36.323121327976075,
          -57.698784125017724
        ]
      ],
      "name": "Área del evento",
      "categoryId": "zones",
      "notes": "Predio principal del Carbriata Concours d'Elegance. Gran prado parquizado con sectores de exhibición libre sin vallado, boxes históricos y circulación de público.",
      "images": [
        "/streetview/carbriata/concours_lawn.jpg"
      ],
      "createdAt": 1792034970396
    },
    {
      "id": "5nuqnj3mv8zd3u0",
      "kind": "point",
      "coords": [
        [
          -36.32294847570098,
          -57.70014166831971
        ]
      ],
      "name": "Escenario Principal y Rampa de Premiación",
      "categoryId": "zones",
      "notes": "Podio oficial con rampa de desfile de elegancia para la coronación Best of Show. Pantalla LED gigante, locución en vivo y entrega de trofeos.",
      "images": [
        "/streetview/carbriata/podium_stage.jpg"
      ],
      "createdAt": 1792034989992
    },
    {
      "id": "3ajmptbmv8zdy6u",
      "kind": "area",
      "coords": [
        [
          -36.32344983349687,
          -57.700495719909675
        ],
        [
          -36.32332881639316,
          -57.69965887069703
        ],
        [
          -36.3238042396481,
          -57.699497938156135
        ],
        [
          -36.323907967972836,
          -57.70043134689332
        ]
      ],
      "name": "Paddock Clásicos & Sport Históricos",
      "categoryId": "zones",
      "notes": "Exhibición de coupés y roadsters clásicos de los años 50 a 70: Ferrari, Porsche 356, Jaguar E-Type, Alfa Romeo y Maserati sobre césped.",
      "images": [
        "/streetview/carbriata/classics_paddock.jpg"
      ],
      "createdAt": 1792035029334,
      "color": "#D4AF37"
    },
    {
      "id": "sxualrcmv8ze3l7",
      "kind": "point",
      "coords": [
        [
          -36.323562206353465,
          -57.70004510879517
        ]
      ],
      "name": "Patio Gastronómico & Lounge",
      "categoryId": "food",
      "notes": "Sector gastronómico gourmet con food trucks de autor, café de especialidad, bebidas artesanales y carpa lounge para expositores y visitantes.",
      "images": [
        "/streetview/carbriata/foodcourt.jpg"
      ],
      "createdAt": 1792035036331
    },
    {
      "id": "m2npaegmv8zenhj",
      "kind": "area",
      "coords": [
        [
          -36.32398927084774,
          -57.70033175729505
        ],
        [
          -36.32385480145818,
          -57.699482076829064
        ],
        [
          -36.32446602408657,
          -57.69934552103989
        ],
        [
          -36.32460049242149,
          -57.70021037437134
        ],
        [
          -36.324296947960946,
          -57.70034551620484
        ]
      ],
      "name": "Paddock Supercars & Hypercars",
      "categoryId": "zones",
      "notes": "Sector exclusivo para superdeportivos modernos y prototipos de alta performance: Pagani, Koenigsegg, McLaren, Lamborghini y Ferrari.",
      "images": [
        "/streetview/carbriata/supercars_paddock.jpg"
      ],
      "createdAt": 1792035062119,
      "color": "#10B981"
    },
    {
      "id": "glkorlamv8zex1v",
      "kind": "point",
      "coords": [
        [
          -36.32417263782322,
          -57.699846225600204
        ]
      ],
      "name": "Puesto de Primeros Auxilios y Seguridad",
      "categoryId": "safety",
      "notes": "Base de asistencia médica y control de emergencias del predio con ambulancia de alta complejidad, paramédicos y bomberos de servicio.",
      "images": [
        "/streetview/carbriata/safety_medical.jpg"
      ],
      "createdAt": 1792035074515
    },
    {
      "id": "zwhwtgnmv8zfnda",
      "kind": "area",
      "coords": [
        [
          -36.32334137074555,
          -57.69952759542546
        ],
        [
          -36.32449047289199,
          -57.699193792385245
        ],
        [
          -36.32427043336706,
          -57.697464085722366
        ],
        [
          -36.32321912483921,
          -57.69875377928678
        ]
      ],
      "name": "Aldea de Marcas & Sponsor Village",
      "categoryId": "zones",
      "notes": "Pabellones oficiales de automotrices, carpas de sponsors, demostraciones de producto, indumentaria de motorsport y simuladores de carrera.",
      "images": [
        "/streetview/carbriata/stands_village.jpg"
      ],
      "createdAt": 1792035108622,
      "color": "#0284C7"
    },
    {
      "id": "e0exod0mv8zftpj",
      "kind": "point",
      "coords": [
        [
          -36.32392814842672,
          -57.698693087824935
        ]
      ],
      "name": "Acreditaciones & Parking Expositores",
      "categoryId": "parking",
      "notes": "Módulo de acreditación y entrega de pulseras para pilotos y expositores. Ingreso reservado y estacionamiento custodiado.",
      "images": [
        "/streetview/carbriata/checkin_accreditation.jpg"
      ],
      "createdAt": 1792035116839
    },
    {
      "id": "ulgml7nmv8zgizt",
      "kind": "line",
      "coords": [
        [
          -36.32996681200926,
          -57.69656888665999
        ],
        [
          -36.329282290667884,
          -57.69615921929246
        ],
        [
          -36.328756671984685,
          -57.69625025648524
        ],
        [
          -36.32815770683714,
          -57.695946799175985
        ],
        [
          -36.32721646658844,
          -57.696128873561534
        ],
        [
          -36.32459948660938,
          -57.69654750823975
        ],
        [
          -36.32434016783978,
          -57.69731998443604
        ]
      ],
      "name": "Ingreso al evento",
      "categoryId": "access",
      "notes": "Avenida principal de acceso al Carbriata. Conecta el pórtico exterior con el bulevar arbolado y el paddock central de exhibición.",
      "images": [
        "/streetview/carbriata/entrance_gate.jpg"
      ],
      "createdAt": 1792035149609,
      "color": "#D4AF37",
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Portal de Acceso y Arco de Bienvenida",
          "caption": "Arco oficial de entrada sobre el boulevard exterior con banderines y control vehicular.",
          "image": "/streetview/carbriata/ingreso_wp1.jpg"
        },
        {
          "index": 1,
          "title": "Paseo Central Arbolado",
          "caption": "Calzada principal pavimentada con arboleda y cartelería de orientación hacia los paddocks.",
          "image": "/streetview/carbriata/promenade.jpg"
        },
        {
          "index": 2,
          "title": "Avenida de Banderas de Fabricantes",
          "caption": "Bulevar decorado con banderas de escuderías y carpas de patrocinadores oficiales.",
          "image": "/streetview/carbriata/ingreso_wp2.jpg"
        },
        {
          "index": 3,
          "title": "Pórtico Central de Entrada al Paddock",
          "caption": "Punto de recepción peatonal y acceso directo a la exhibición de autos sobre césped.",
          "image": "/streetview/carbriata/entrance_gate.jpg"
        }
      ]
    },
    {
      "id": "fr7w8d0mv8zh0m6",
      "kind": "area",
      "coords": [
        [
          -36.32472273616095,
          -57.70010416431309
        ],
        [
          -36.32434377994441,
          -57.69747925858783
        ],
        [
          -36.32510169053467,
          -57.69761581437701
        ],
        [
          -36.32533395198191,
          -57.699876571331124
        ]
      ],
      "name": "Estacionamiento General y Público VIP",
      "categoryId": "access",
      "notes": "Playa de estacionamiento consolidada y organizada sobre césped para visitantes y asistentes VIP con transfers continuos en carritos.",
      "images": [
        "/streetview/carbriata/parking_visitors.jpg"
      ],
      "createdAt": 1792035172446
    },
    {
      "id": "vjfryf0mv8zh4ik",
      "kind": "point",
      "coords": [
        [
          -36.324942774408775,
          -57.699254483847106
        ]
      ],
      "name": "Pórtico Central de Acceso Peatonal",
      "categoryId": "access",
      "notes": "Acceso peatonal principal con molinetes de lectura QR, entrega de revistas del evento y mapas de mano para el público.",
      "images": [
        "/streetview/carbriata/entrance_gate.jpg"
      ],
      "createdAt": 1792035177500
    },
    {
      "id": "26eeshzmv8zr8vr",
      "kind": "line",
      "coords": [
        [
          -36.327321909353756,
          -57.70012488660401
        ],
        [
          -36.328134405987896,
          -57.69954552945679
        ],
        [
          -36.32803068348506,
          -57.699202206702886
        ],
        [
          -36.32640567958149,
          -57.69911637601441
        ]
      ],
      "name": "Zona dinámica",
      "categoryId": "access",
      "notes": "Trazado dinámico de pista para pruebas de aceleración, salidas de autos en marcha, desfiles y demostraciones de sonido de motores en vivo.",
      "images": [
        "/streetview/carbriata/dynamic_track_1.jpg"
      ],
      "createdAt": 1792035649719,
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Salida de Boxes a Pista",
          "caption": "Salida del pit lane hacia el circuito dinámico para tandas de demostración.",
          "image": "/streetview/carbriata/dynamic_track_1.jpg"
        },
        {
          "index": 1,
          "title": "Curva de Aceleración Ferrari 250 GT",
          "caption": "Curva de salida con aceleración a fondo de coupés clásicas y sonido V12.",
          "image": "/streetview/carbriata/dynamic_track_2.jpg"
        },
        {
          "index": 2,
          "title": "Recta de Demostración de Velocidad",
          "caption": "Tramo recto donde superdeportivos modernos demuestran potencia ante el público.",
          "image": "/streetview/carbriata/dynamic_track_3.jpg"
        },
        {
          "index": 3,
          "title": "Chicana y Retorno al Paddock",
          "caption": "Chicana de desaceleración y calle de rodaje para el regreso seguro de los autos a boxes.",
          "image": "/streetview/carbriata/dynamic_track_4.jpg"
        }
      ]
    }
  ],
  "hiddenCategoryIds": [],
  "createdAt": 1792034864027,
  "updatedAt": 1792036056172
}
];
