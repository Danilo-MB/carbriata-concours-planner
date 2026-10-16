const fs = require('fs');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1X2dvb2dfdzFpaGRjdW0iLCJlbWFpbCI6ImRtYXJpbm9iYXRhQGdtYWlsLmNvbSIsIm5hbWUiOiJEYW5pbG8iLCJyb2xlIjoiYWRtaW4iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3OTIxMDA3MDEsImV4cCI6MTc5MzMxMDMwMX0.pkbuQTmEIDPbInt2aPX6Rj7WlqkFZbYmSWWNKudXF60';

const projectId = 'dlcvnqemvb8auwk';

// Base project definition as retrieved from MapFlex API
const baseProject = {
  "id": "dlcvnqemvb8auwk",
  "userId": "u_goog_w1ihdcum",
  "authorEmail": "dmarinobata@gmail.com",
  "authorName": "Danilo",
  "name": "Planta de Producción de Hormigón Vial",
  "description": "Planta de producción de hormigón elaborado para obras viales e infraestructura en Sant'Agata di Militello (Sicilia), junto al lecho del río Rosmarino, con silos verticales, acopio de áridos fluviales, tolvas de dosificación y recorrido fotográfico interactivo.",
  "location": "98070, Sant'Agata di Militello",
  "template": "logistics",
  "center": {
    "lat": 38.053011,
    "lng": 14.613175,
    "zoom": 17
  },
  "basemap": "satellite",
  "categories": [
    { "id": "docks", "name": "Muelles & Dosificación", "color": "#E8590C", "icon": "door", "kindHint": "area" },
    { "id": "storage", "name": "Almacén & Racks", "color": "#1C7ED6", "icon": "warehouse", "kindHint": "area" },
    { "id": "yard", "name": "Acopio & Playa", "color": "#F59F00", "icon": "parking", "kindHint": "area" },
    { "id": "aisles", "name": "Rutas y Pasillos", "color": "#0CA678", "icon": "route", "kindHint": "line" },
    { "id": "office", "name": "Control & Laboratorio", "color": "#AE3EC9", "icon": "building" },
    { "id": "safety", "name": "Seguridad & Ambiente", "color": "#E03131", "icon": "shield", "kindHint": "point" },
    { "id": "zones", "name": "Silos & Mezcla", "color": "#E8590C", "icon": "tent", "kindHint": "area" },
    { "id": "stages", "name": "Stages & shows", "color": "#AE3EC9", "icon": "music" },
    { "id": "food", "name": "Food & drinks", "color": "#F59F00", "icon": "food" },
    { "id": "parking", "name": "Parking Mixers", "color": "#1C7ED6", "icon": "parking" },
    { "id": "access", "name": "Access & paths", "color": "#F06595", "icon": "door", "kindHint": "line" }
  ],
  "features": [
    // 1. Area 1 - Batching & Loading Dock
    {
      "id": "8x8cud9mvb8bs3x",
      "kind": "area",
      "coords": [
        [ 38.050620090098306, 14.614172821065075 ],
        [ 38.050779896075966, 14.61403057545135 ],
        [ 38.050950156266445, 14.614303687029702 ],
        [ 38.05079035066047, 14.614459208900723 ]
      ],
      "name": "Nave de Dosificación y Carga de Mixers",
      "categoryId": "docks",
      "notes": "Estructura principal con tolvas elevadas y bocas de carga directa de hormigón elaborado a camiones mixer.",
      "images": [ "/streetview/hormigon/area1_dosificacion_hormigon.jpg" ],
      "createdAt": 1792170977037
    },
    // 2. Marker 1 - Loading Chute
    {
      "id": "lg3s5camvb8c179",
      "kind": "point",
      "coords": [ [ 38.05075301285181, 14.614239202351465 ] ],
      "name": "Tolva de Carga Directa a Mixer",
      "categoryId": "docks",
      "notes": "Punto de vertido directo de mezcla dosificada con manga retráctil y mangas de despolvoreo.",
      "images": [ "/streetview/hormigon/marker1_tolva_carga.jpg" ],
      "createdAt": 1792170988821
    },
    // 3. Area 2 - Offices & QC Lab
    {
      "id": "n4gckbumvb8cnri",
      "kind": "area",
      "coords": [
        [ 38.051114442039726, 14.614770252642725 ],
        [ 38.05116671470843, 14.614677318841752 ],
        [ 38.05128022094629, 14.614764562818154 ],
        [ 38.05121749383661, 14.614876462700956 ]
      ],
      "name": "Oficinas Centrales, Báscula y Laboratorio",
      "categoryId": "office",
      "notes": "Edificio de administración técnica, control de pesaje vehicular y laboratorio de ensayos de resistencia de probetas de hormigón.",
      "images": [ "/streetview/hormigon/area2_oficinas_laboratorio.jpg" ],
      "createdAt": 1792171018062
    },
    // 4. Marker 2 - Weighbridge
    {
      "id": "26ymfjemvb8cv5l",
      "kind": "point",
      "coords": [ [ 38.051195091284406, 14.614779735683637 ] ],
      "name": "Báscula Puente de Pesaje",
      "categoryId": "office",
      "notes": "Báscula electrónica de 60 toneladas para control de tara y carga neta despachada por cada camión.",
      "images": [ "/streetview/hormigon/marker2_bascula_pesaje.jpg" ],
      "createdAt": 1792171027641
    },
    // 5. Area 3 - Mixer Parking Fleet
    {
      "id": "u2034ormvb8d903",
      "kind": "area",
      "coords": [
        [ 38.05035322308227, 14.613868296146395 ],
        [ 38.050465167343724, 14.613667130470278 ],
        [ 38.05082000839955, 14.613908529281618 ],
        [ 38.05058767218836, 14.61411774158478 ]
      ],
      "name": "Playa de Estacionamiento y Maniobra de Mixers",
      "categoryId": "parking",
      "notes": "Sector pavimentado para estacionamiento, inspección diaria y maniobra de la flota de camiones mixer.",
      "images": [ "/streetview/hormigon/area3_playa_mixers.jpg" ],
      "createdAt": 1792171045587
    },
    // 6. Marker 3 - Washout Bay
    {
      "id": "q59usyomvb8dcrq",
      "kind": "point",
      "coords": [ [ 38.05048206457584, 14.613887071609499 ] ],
      "name": "Bahía de Lavado de Cubas y Reciclado",
      "categoryId": "parking",
      "notes": "Bahía de lavado a presión de trompos con fosa decantadora y sistema de reciclaje de áridos y agua recuperada.",
      "images": [ "/streetview/hormigon/marker3_lavado_cubas.jpg" ],
      "createdAt": 1792171050470
    },
    // 7. Path 1 - Riverbed Haul Road Access
    {
      "id": "6wf9ve9mvb8e7mm",
      "kind": "line",
      "coords": [
        [ 38.056032594240136, 14.611473083496096 ],
        [ 38.05562709034359, 14.612524509429933 ],
        [ 38.054511943043394, 14.612953662872316 ],
        [ 38.05317712317725, 14.61361885070801 ],
        [ 38.052112629128324, 14.613575935363771 ],
        [ 38.05153813384469, 14.614048004150392 ]
      ],
      "name": "Ruta de Acceso Fluvial desde Ruta SS113",
      "categoryId": "aisles",
      "notes": "Traza vial consolidada que conecta la ruta costera SS113 de Sant'Agata di Militello con la planta, bordeando el lecho del río Rosmarino.",
      "images": [ "/streetview/hormigon/path1_wp0_desvio_ss113.jpg" ],
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Desvío Costero / Conexión SS113",
          "image": "/streetview/hormigon/path1_wp0_desvio_ss113.jpg",
          "caption": "Empalme y desvío desde la ruta costera hacia el camino del lecho del río Rosmarino."
        },
        {
          "index": 1,
          "title": "Traza del Lecho Fluvial",
          "image": "/streetview/hormigon/path1_wp1_lecho_rio.jpg",
          "caption": "Camino ancho de ripio nivelado sobre los cantos rodados del cauce seco."
        },
        {
          "index": 2,
          "title": "Paso Bajo Colinas Sicilianas",
          "image": "/streetview/hormigon/path1_wp2_colinas_sicilia.jpg",
          "caption": "Corredor natural flanqueado por olivos y colinas rumbo hacia el interior de Alcara Li Fusi."
        },
        {
          "index": 3,
          "title": "Aproximación a la Planta de Hormigón",
          "image": "/streetview/hormigon/path1_wp3_vista_planta.jpg",
          "caption": "Primer contacto visual con las torres de silos, tolvas y cinta transportadora de la planta."
        },
        {
          "index": 4,
          "title": "Portal de Ingreso y Control Industrial",
          "image": "/streetview/hormigon/path1_wp4_portal_acceso.jpg",
          "caption": "Ingreso al predio industrial de la planta con señalización de seguridad y velocidad máxima."
        },
        {
          "index": 5,
          "title": "Bifurcación de Tránsito Pesado",
          "image": "/streetview/hormigon/path1_wp5_bifurcacion.jpg",
          "caption": "Distribuidor interno hacia la báscula de pesaje, acopios y dársena de carga de mixers."
        }
      ],
      "createdAt": 1792171090462
    },
    // 8. Area 4 - Cement Silos
    {
      "id": "ud50pkmmvb8eneo",
      "kind": "area",
      "coords": [
        [ 38.050993468006084, 14.614497141064374 ],
        [ 38.05114580564547, 14.614250582000567 ],
        [ 38.051286194953924, 14.614419380128842 ],
        [ 38.05117567573362, 14.614614730771704 ]
      ],
      "name": "Batería de Silos Verticales de Cemento",
      "categoryId": "zones",
      "notes": "Conjunto de silos metálicos verticales con filtros despolvoreadores para almacenamiento de cemento Portland y puzolana.",
      "images": [ "/streetview/hormigon/area4_silos_cemento.jpg" ],
      "color": "#F97316",
      "createdAt": 1792171110912
    },
    // 9. Marker 4 - Screw Conveyors
    {
      "id": "6kgqlj0mvb8ewsn",
      "kind": "point",
      "coords": [ [ 38.05106515634644, 14.614497141064374 ] ],
      "name": "Cabezal de Dosificación Neumática",
      "categoryId": "zones",
      "notes": "Tornillos sinfín con compuertas mariposa y actuadores neumáticos para dosificación exacta de cemento a tolva balanza.",
      "images": [ "/streetview/hormigon/marker4_dosificador_neumatico.jpg" ],
      "createdAt": 1792171123079
    },
    // 10. Area 5 - Conveyor & Hoppers
    {
      "id": "idu7t06mvb8fl0q",
      "kind": "area",
      "coords": [
        [ 38.051790996838484, 14.613923417089005 ],
        [ 38.051792490330044, 14.613949021299476 ],
        [ 38.05192541095462, 14.613923417089005 ],
        [ 38.05192391746578, 14.613894967966267 ]
      ],
      "name": "Cinta Transportadora Inclinada y Tolvas de Grava",
      "categoryId": "docks",
      "notes": "Cintas industriales para elevación y alimentación continua de áridos clasificados hacia las tolvas superiores de mezcla.",
      "images": [ "/streetview/hormigon/area5_cinta_transportadora.jpg" ],
      "createdAt": 1792171154474
    },
    // 11. Marker 5 - Environmental & River Protection
    {
      "id": "yu12x06mvb8fsmn",
      "kind": "point",
      "coords": [ [ 38.051830574353886, 14.613932900129916 ] ],
      "name": "Puesto de Control Ambiental y Defensas de Ribera",
      "categoryId": "safety",
      "notes": "Monitoreo de cauce del río Rosmarino, gaviones de protección de ribera y estación meteorológica ambiental.",
      "images": [ "/streetview/hormigon/marker5_control_ambiental.jpg" ],
      "createdAt": 1792171164335
    },
    // 12. Path 2 - Internal Aggregate Route
    {
      "id": "bxyr3nzmvb8gkch",
      "kind": "line",
      "coords": [
        [ 38.050996455021675, 14.613871260363986 ],
        [ 38.05066788257679, 14.613674013112933 ],
        [ 38.050620090098306, 14.61376505030572 ],
        [ 38.050620090098306, 14.61376505030572 ]
      ],
      "name": "Corredor Interno de Transferencia de Áridos",
      "categoryId": "aisles",
      "notes": "Circuito interno para tránsito exclusivo de palas cargadoras y volquetes entre acopios y tolvas receptoras.",
      "images": [ "/streetview/hormigon/path2_wp0_cabecera_acopio.jpg" ],
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Cabecera de Carga en Acopio",
          "image": "/streetview/hormigon/path2_wp0_cabecera_acopio.jpg",
          "caption": "Zona de carga con pala frontal junto a los montículos de grava seleccionada."
        },
        {
          "index": 1,
          "title": "Carril de Tránsito de Palas y Volquetes",
          "image": "/streetview/hormigon/path2_wp1_carril_palas.jpg",
          "caption": "Pista de rodamiento reforzada para maquinaria pesada bajo la estructura de transporte."
        },
        {
          "index": 2,
          "title": "Rampa de Vuelco a Tolva Receptora",
          "image": "/streetview/hormigon/path2_wp2_rampa_vuelco.jpg",
          "caption": "Rampa de descarga a tolva vibrante subterránea con rejilla cribadora de áridos."
        }
      ],
      "createdAt": 1792171200257
    },
    // 13. Area 6 - Aggregate Stockpile Yard
    {
      "id": "t8nqwmwmvb8hjk2",
      "kind": "area",
      "coords": [
        [ 38.05027296105361, 14.61385488510132 ],
        [ 38.05035955955447, 14.613667130470278 ],
        [ 38.05007652992801, 14.613533020019533 ],
        [ 38.049987818924336, 14.613766372203829 ]
      ],
      "name": "Parque de Acopio y Clasificación de Áridos Fluviales",
      "categoryId": "yard",
      "notes": "Extenso sector junto a la ribera para depósito, cribado y lavado de cantos rodados, grava y arena extraídos del lecho del río.",
      "images": [ "/streetview/hormigon/area6_acopio_aridos.jpg" ],
      "createdAt": 1792171245890
    },
    // 14. Marker 6 - Front Loader
    {
      "id": "nge6xhxmvb8hmi3",
      "kind": "point",
      "coords": [ [ 38.05011243673228, 14.613747596740724 ] ],
      "name": "Frente de Carga con Pala Frontal",
      "categoryId": "yard",
      "notes": "Operación continua de pala cargadora de ruedas de gran porte alimentando tolvas y clasificando pilas de árido vial.",
      "images": [ "/streetview/hormigon/marker6_pala_cargadora.jpg" ],
      "createdAt": 1792171249707
    }
  ],
  "hiddenCategoryIds": [],
  "createdAt": 1792170934004,
  "updatedAt": Date.now(),
  "isLocalOnly": false
};

async function main() {
  // 1. Save to carbriata_data.json
  const dataPath = './carbriata_data.json';
  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    if (!data.projects) data.projects = {};
    data.projects[projectId] = baseProject;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved ${projectId} to local ${dataPath}`);
  }

  // 2. Put to Cloud API if online
  try {
    const res = await fetch(`https://www.mapflex.app/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(baseProject)
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`Cloud API PUT failed with ${res.status}: ${err}`);
    } else {
      const saved = await res.json();
      console.log(`Successfully updated ${projectId} on Cloud API! Features: ${saved.features?.length}`);
    }
  } catch (err) {
    console.warn(`Could not reach Cloud API (might need BypassSandbox: true):`, err.message);
  }
}

main().catch(console.error);
