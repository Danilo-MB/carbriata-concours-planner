const fs = require('fs');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1X2dvb2dfdzFpaGRjdW0iLCJlbWFpbCI6ImRtYXJpbm9iYXRhQGdtYWlsLmNvbSIsIm5hbWUiOiJEYW5pbG8iLCJyb2xlIjoiYWRtaW4iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3OTIxMDA3MDEsImV4cCI6MTc5MzMxMDMwMX0.pkbuQTmEIDPbInt2aPX6Rj7WlqkFZbYmSWWNKudXF60';

const projectId = 'dlcvnqemvb8auwk';

// Base project definition in Italian for the client in Sant'Agata di Militello (Sicily)
const italianProject = {
  "id": "dlcvnqemvb8auwk",
  "userId": "u_goog_w1ihdcum",
  "authorEmail": "dmarinobata@gmail.com",
  "authorName": "Danilo",
  "name": "Impianto di Calcestruzzo per Infrastrutture Viarie",
  "description": "Impianto di betonaggio e produzione calcestruzzo preconfezionato per opere viarie e infrastrutturali a Sant'Agata di Militello (ME), lungo il greto alluvionale della fiumara Rosmarino verso Alcara Li Fusi. Dotato di torre di dosaggio, silos verticali di cemento, stoccaggio e lavaggio inerti fluviali e tour fotografico interattivo a 360°.",
  "location": "98070, Sant'Agata di Militello (ME)",
  "template": "logistics",
  "center": {
    "lat": 38.053011,
    "lng": 14.613175,
    "zoom": 17
  },
  "basemap": "satellite",
  "categories": [
    { "id": "docks", "name": "Dosaggio & Carico Betoniere", "color": "#E8590C", "icon": "door", "kindHint": "area" },
    { "id": "storage", "name": "Magazzino & Officina", "color": "#1C7ED6", "icon": "warehouse", "kindHint": "area" },
    { "id": "yard", "name": "Piazzale Inerti & Movimentazione", "color": "#F59F00", "icon": "parking", "kindHint": "area" },
    { "id": "aisles", "name": "Percorsi e Viabilità Interna", "color": "#0CA678", "icon": "route", "kindHint": "line" },
    { "id": "office", "name": "Uffici Direzione & Controllo Qualità", "color": "#AE3EC9", "icon": "building" },
    { "id": "safety", "name": "Sicurezza & Difesa Idraulica", "color": "#E03131", "icon": "shield", "kindHint": "point" },
    { "id": "zones", "name": "Batteria Silos Cemento", "color": "#E8590C", "icon": "tent", "kindHint": "area" },
    { "id": "stages", "name": "Eventi & Presentazioni", "color": "#AE3EC9", "icon": "music" },
    { "id": "food", "name": "Ristoro & Area Break", "color": "#F59F00", "icon": "food" },
    { "id": "parking", "name": "Parcheggio & Manovra Betoniere", "color": "#1C7ED6", "icon": "parking" },
    { "id": "access", "name": "Accesso & Viabilità Fluviale", "color": "#F06595", "icon": "door", "kindHint": "line" }
  ],
  "features": [
    // 1. Area 1 - Batching & Loading Tower
    {
      "id": "8x8cud9mvb8bs3x",
      "kind": "area",
      "coords": [
        [ 38.050620090098306, 14.614172821065075 ],
        [ 38.050779896075966, 14.61403057545135 ],
        [ 38.050950156266445, 14.614303687029702 ],
        [ 38.05079035066047, 14.614459208900723 ]
      ],
      "name": "Torre di Betonaggio e Punto di Carico Betoniere",
      "categoryId": "docks",
      "notes": "Struttura principale sopraelevata dotata di tramogge pesatrici e manica telescopica di scarico diretto per il carico rapido del calcestruzzo preconfezionato nelle autobetoniere.",
      "images": [ "/streetview/hormigon/area1_dosificacion_hormigon.jpg" ],
      "createdAt": 1792170977037
    },
    // 2. Marker 1 - Loading Chute
    {
      "id": "lg3s5camvb8c179",
      "kind": "point",
      "coords": [ [ 38.05075301285181, 14.614239202351465 ] ],
      "name": "Bocca di Scarico Calcestruzzo su Betoniera",
      "categoryId": "docks",
      "notes": "Punto esatto di allineamento del tamburo rotante dell'autobetoniera sotto la cuffia antipolvere per l'immissione della miscela fresca.",
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
      "name": "Palazzina Uffici, Pesa a Ponte e Laboratorio Prove",
      "categoryId": "office",
      "notes": "Centro direzionale e gestionale dell'impianto con postazione operatore pesa a ponte, emissione bolle di consegna e laboratorio tecnologico per lo schiacciamento dei provini di calcestruzzo.",
      "images": [ "/streetview/hormigon/area2_oficinas_laboratorio.jpg" ],
      "createdAt": 1792171018062
    },
    // 4. Marker 2 - Weighbridge
    {
      "id": "26ymfjemvb8cv5l",
      "kind": "point",
      "coords": [ [ 38.051195091284406, 14.614779735683637 ] ],
      "name": "Pesa a Ponte Elettronica da 60 Tonnellate",
      "categoryId": "office",
      "notes": "Piattaforma metallica a celle di carico per la determinazione della tara e del peso lordo/netto dei mezzi di trasporto calcestruzzo e bilici inerti.",
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
      "name": "Piazzale di Sosta e Manovra Autobetoniere",
      "categoryId": "parking",
      "notes": "Ampia area piazzale pavimentata riservata allo stazionamento, manutenzione giornaliera e manovra della flotta aziendale di autobetoniere.",
      "images": [ "/streetview/hormigon/area3_playa_mixers.jpg" ],
      "createdAt": 1792171045587
    },
    // 6. Marker 3 - Washout Bay
    {
      "id": "q59usyomvb8dcrq",
      "kind": "point",
      "coords": [ [ 38.05048206457584, 14.613887071609499 ] ],
      "name": "Baia di Lavaggio Tamburi e Recupero Acque",
      "categoryId": "parking",
      "notes": "Postazione attrezzata con lance ad alta pressione per il risciacquo delle canaline e del tamburo, con vasca di decantazione fanghi e riciclo acque reflue.",
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
      "name": "Tracciato di Accesso Fluviale dalla SS113",
      "categoryId": "aisles",
      "notes": "Pista di transito pesante consolidata che collega la strada statale costiera SS113 Settentrionale Sicula con l'impianto industriale, risalendo il greto della fiumara Rosmarino.",
      "images": [ "/streetview/hormigon/path1_wp0_desvio_ss113.jpg" ],
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Bivio Costiero / Innesto Strada Statale SS113",
          "image": "/streetview/hormigon/path1_wp0_desvio_ss113.jpg",
          "caption": "Deviazione dalla carreggiata asfaltata litoranea verso la pista carrabile in ghiaia lungo il greto fluviale."
        },
        {
          "index": 1,
          "title": "Pista Carrabile sul Greto Alluvionale",
          "image": "/streetview/hormigon/path1_wp1_lecho_rio.jpg",
          "caption": "Tracciato largo e livellato a fondo naturale su ciottoli e ghiaia di fiumara, idoneo al transito di mezzi d'opera pesanti."
        },
        {
          "index": 2,
          "title": "Fondo Valle verso le Colline di Alcara Li Fusi",
          "image": "/streetview/hormigon/path1_wp2_colinas_sicilia.jpg",
          "caption": "Passaggio paesaggistico fiancheggiato da macchia mediterranea, uliveti e pendii rocciosi dei Nebrodi verso l'entroterra."
        },
        {
          "index": 3,
          "title": "Visuale di Avvicinamento all'Impianto",
          "image": "/streetview/hormigon/path1_wp3_vista_planta.jpg",
          "caption": "Primo scorcio visivo della torre di betonaggio, della rampa di carico e dei silos svettanti nel paesaggio."
        },
        {
          "index": 4,
          "title": "Portale d'Ingresso e Controllo Stabilimento",
          "image": "/streetview/hormigon/path1_wp4_portal_acceso.jpg",
          "caption": "Ingresso perimetrale dello stabilimento con segnaletica di cantiere, limiti di velocità e recinzione industriale."
        },
        {
          "index": 5,
          "title": "Biforcazione Viabilità Interna Mezzi Pesanti",
          "image": "/streetview/hormigon/path1_wp5_bifurcacion.jpg",
          "caption": "Snodo centrale di smistamento del traffico pesante verso la pesa a ponte, le baie di carico o il piazzale inerti."
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
      "name": "Batteria Silos Verticali di Stoccaggio Cemento",
      "categoryId": "zones",
      "notes": "Gruppo di silos cilindrici metallici verticali ad alta capacità (cemento Portland Tipo R 42.5 e 52.5 R) completi di filtri depolveratori a maniche ed elettrocompressori.",
      "images": [ "/streetview/hormigon/area4_silos_cemento.jpg" ],
      "color": "#F97316",
      "createdAt": 1792171110912
    },
    // 9. Marker 4 - Screw Conveyors
    {
      "id": "6kgqlj0mvb8ewsn",
      "kind": "point",
      "coords": [ [ 38.05106515634644, 14.614497141064374 ] ],
      "name": "Coclee di Estrazione e Dosaggio Pneumatico",
      "categoryId": "zones",
      "notes": "Condotti a coclea inclinati con valvole a farfalla pneumatiche per il trasporto continuo e la pesatura micrometrica del legante cementizio.",
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
      "name": "Nastro Trasportatore Inclinato e Tramogge Inerti",
      "categoryId": "docks",
      "notes": "Linea di trasporto a nastro in gomma rinforzata per il sollevamento continuo di sabbie e ghiaie selezionate verso le tramogge di dosaggio aeree.",
      "images": [ "/streetview/hormigon/area5_cinta_transportadora.jpg" ],
      "createdAt": 1792171154474
    },
    // 11. Marker 5 - Environmental & River Protection
    {
      "id": "yu12x06mvb8fsmn",
      "kind": "point",
      "coords": [ [ 38.051830574353886, 14.613932900129916 ] ],
      "name": "Stazione di Monitoraggio Ambientale e Gabbionate",
      "categoryId": "safety",
      "notes": "Opera di difesa spondale fluviale con scogliere in gabbioni metallici a pietra e stazione idrometrica/meteo ad energia solare per il presidio dell'alveo.",
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
      "name": "Corridoio Interno di Movimentazione Inerti",
      "categoryId": "aisles",
      "notes": "Pista di scorrimento interna riservata al ciclo continuo di pale gommate e dumper tra le baie di cumulo e la tramoggia sotterranea.",
      "images": [ "/streetview/hormigon/path2_wp0_cabecera_acopio.jpg" ],
      "routeWaypoints": [
        {
          "index": 0,
          "title": "Testata di Prelievo Inerti nei Cumuli",
          "image": "/streetview/hormigon/path2_wp0_cabecera_acopio.jpg",
          "caption": "Zona di manovra della pala caricatrice gommata a ridosso dei cumuli di sabbia e pietrisco vagliato."
        },
        {
          "index": 1,
          "title": "Corsia di Scorrimento Pale e Autocarri",
          "image": "/streetview/hormigon/path2_wp1_carril_palas.jpg",
          "caption": "Corsia protetta ad alta portanza sottostante il traliccio dei nastri elevatori."
        },
        {
          "index": 2,
          "title": "Rampa di Ribaltamento su Tramoggia Sotterranea",
          "image": "/streetview/hormigon/path2_wp2_rampa_vuelco.jpg",
          "caption": "Rampa di scarico con griglia grigliata vibrante a protezione della bocca di carico del nastro trasportatore."
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
      "name": "Bacino di Stoccaggio e Selezione Inerti Alluvionali",
      "categoryId": "yard",
      "notes": "Ampio parco di deposito e cernita lungo l'alveo fluviale per ghiaie tonde, pietrisco frantumato e sabbie alluvionali lavate della fiumara Rosmarino, con barriere in calcestruzzo e nebulizzatori antipolvere.",
      "images": [ "/streetview/hormigon/area6_acopio_aridos.jpg" ],
      "createdAt": 1792171245890
    },
    // 14. Marker 6 - Front Loader
    {
      "id": "nge6xhxmvb8hmi3",
      "kind": "point",
      "coords": [ [ 38.05011243673228, 14.613747596740724 ] ],
      "name": "Fronte di Carico con Pala Meccanica Gommata",
      "categoryId": "yard",
      "notes": "Operazione continuativa della pala caricatrice frontale Caterpillar per il prelievo degli inerti selezionati e l'alimentazione delle tramogge a terra.",
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
    data.projects[projectId] = italianProject;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved ${projectId} to local ${dataPath}`);
  }

  // 2. Put to Cloud API
  try {
    const res = await fetch(`https://www.mapflex.app/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(italianProject)
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`Cloud API PUT failed with ${res.status}: ${err}`);
    } else {
      const saved = await res.json();
      console.log(`Successfully updated ${projectId} to Italian on Cloud API! Features: ${saved.features?.length}`);
    }

    const featRes = await fetch(`https://www.mapflex.app/api/projects/${projectId}/features`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ features: italianProject.features })
    });
    if (featRes.ok) {
      console.log(`Successfully synced features in Italian!`);
    }
  } catch (err) {
    console.warn(`Could not reach Cloud API:`, err.message);
  }
}

main().catch(console.error);
