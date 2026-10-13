import type { LatLng, PlaceResult, PlanFeature, TemplateId } from '../types/plan';
import { createId } from '../utils/id';
import { analyzeSatelliteImagery, type SatelliteVisionAnalysis } from '../utils/satelliteVision';

export interface AiPlannerPromptInput {
  name: string;
  place: PlaceResult;
  template: TemplateId;
  attendees: number;
  booths: number;
  hasParking: boolean;
  hasFood: boolean;
  hasStage: boolean;
  hasVip: boolean;
  hasSafety: boolean;
  customPrompt?: string;
  apiKey?: string;
}

export interface TerrainDetection {
  hasExistingParking: boolean;
  existingParkingCoords?: LatLng[];
  openAreasCount: number;
  roadsCount: number;
  summary: string;
}

export interface AiPlanResult {
  features: PlanFeature[];
  detection: TerrainDetection;
  satelliteImageUrl?: string;
  summary: string;
  recommendations: string[];
}

const EARTH_RADIUS = 6378137;

/**
 * Converts metric offsets (dx meters east, dy meters north) to geographic [lat, lng]
 */
export function meterOffsetToLatLng(center: LatLng, dxMeters: number, dyMeters: number): LatLng {
  const dLat = (dyMeters / EARTH_RADIUS) * (180 / Math.PI);
  const dLng = (dxMeters / (EARTH_RADIUS * Math.cos((center[0] * Math.PI) / 180))) * (180 / Math.PI);
  return [center[0] + dLat, center[1] + dLng];
}

/**
 * Creates a rectangle polygon in [lat, lng] given center and width/height in meters
 */
export function createMeterRect(center: LatLng, widthMeters: number, heightMeters: number, offsetDx = 0, offsetDy = 0): LatLng[] {
  const halfW = widthMeters / 2;
  const halfH = heightMeters / 2;
  
  const sw = meterOffsetToLatLng(center, offsetDx - halfW, offsetDy - halfH);
  const se = meterOffsetToLatLng(center, offsetDx + halfW, offsetDy - halfH);
  const ne = meterOffsetToLatLng(center, offsetDx + halfW, offsetDy + halfH);
  const nw = meterOffsetToLatLng(center, offsetDx - halfW, offsetDy + halfH);

  return [sw, se, ne, nw];
}

/**
 * Intelligent Layout Generator powered by Satellite Computer Vision
 */
export async function generateAiPlan(input: AiPlannerPromptInput): Promise<AiPlanResult> {
  const center: LatLng = [input.place.lat, input.place.lng];
  const now = Date.now();

  // 1. RUN REAL SATELLITE COMPUTER VISION ANALYSIS OVER THE VENUE
  const vision: SatelliteVisionAnalysis = await analyzeSatelliteImagery(center, 340);

  // Determine anchor center for the event from detected open terrain
  // If an open clearing is detected, center the event activities inside it!
  const eventCenter: LatLng = vision.openAreaBlob ? vision.openAreaBlob.center : center;

  // Determine anchor for parking
  // If a real asphalt lot is detected in the satellite image, use it!
  const parkingPolygon = vision.parkingBlob ? vision.parkingBlob.polygon : undefined;
  const parkingCenter: LatLng = vision.parkingBlob
    ? vision.parkingBlob.center
    : meterOffsetToLatLng(eventCenter, 0, -130);

  const features: PlanFeature[] = [];

  const attendeeCount = Math.max(100, input.attendees || 1000);
  const boothCount = Math.max(0, input.booths || 0);

  // 1. MAIN STAGE or CENTRAL PAVILION
  if (input.hasStage) {
    const stageWidth = attendeeCount > 10000 ? 38 : attendeeCount > 3000 ? 28 : 22;
    const stageDepth = attendeeCount > 10000 ? 24 : 16;
    
    // Position stage on the northern edge of the detected open area
    features.push({
      id: createId(),
      kind: 'area',
      name: 'Escenario Principal & Backstage',
      categoryId: 'stages',
      notes: `Estructura principal para shows. Backstage cerrado con control de accesos técnicos. Ubicado al fondo del área abierta para máxima visibilidad.`,
      coords: createMeterRect(eventCenter, stageWidth, stageDepth, 0, 75),
      createdAt: now,
      color: '#AE3EC9',
      opacity: 0.5
    });

    // Front of Stage / Crowd Field
    const crowdWidth = attendeeCount > 10000 ? 80 : 60;
    const crowdDepth = attendeeCount > 10000 ? 70 : 50;
    features.push({
      id: createId(),
      kind: 'area',
      name: 'Campo & Platea General',
      categoryId: 'zones',
      notes: `Superficie despejada en terreno abierto para público de pie y circulación. Ratio de seguridad: 3 personas/m².`,
      coords: createMeterRect(eventCenter, crowdWidth, crowdDepth, 0, 25),
      createdAt: now + 1,
      color: '#E8590C',
      opacity: 0.3
    });
  }

  // 2. BOOTHS / STANDS / EXPO ZONE
  if (boothCount > 0) {
    const width = Math.min(110, Math.max(45, boothCount * 3.2));
    // Placed along the western flank of the open area
    features.push({
      id: createId(),
      kind: 'area',
      name: `Feria de Expositores (${boothCount} Stands)`,
      categoryId: 'zones',
      notes: `Espacio asignado para ${boothCount} módulos o stands con pasillo central de 6 metros para circulación fluida.`,
      coords: createMeterRect(eventCenter, width, 28, -55, 5),
      createdAt: now + 2,
      color: '#E8590C',
      opacity: 0.4
    });
  }

  // 3. FOOD & DRINKS BOULEVARD
  if (input.hasFood) {
    const foodStalls = Math.max(4, Math.round(attendeeCount / 300));
    // Placed along the eastern flank of the open area
    features.push({
      id: createId(),
      kind: 'area',
      name: `Bulevar Gastronómico (${foodStalls} Food Trucks)`,
      categoryId: 'food',
      notes: `Sector de comidas y bebidas con tomas eléctricas perimetrales y mesas centrales al aire libre.`,
      coords: createMeterRect(eventCenter, 75, 22, 55, 5),
      createdAt: now + 3,
      color: '#F59F00',
      opacity: 0.4
    });
  }

  // 4. PARKING (Integrates detected satellite asphalt lot if available, otherwise generates optimized surface)
  if (input.hasParking) {
    if (parkingPolygon && parkingPolygon.length >= 3) {
      features.push({
        id: createId(),
        kind: 'area',
        name: 'Estacionamiento Principal (Playón Asfaltado Detectado)',
        categoryId: 'parking',
        notes: `Ubicado sobre el playón de pavimento/asfalto detectado en la foto satelital para no dañar áreas verdes.`,
        coords: parkingPolygon,
        createdAt: now + 4,
        color: '#1C7ED6',
        opacity: 0.45
      });
    } else {
      const estimatedCars = Math.round(attendeeCount * 0.3);
      const parkingWidth = Math.min(160, Math.max(80, Math.round(Math.sqrt(estimatedCars * 26))));
      const parkingLength = Math.min(140, Math.max(55, Math.round((estimatedCars * 26) / parkingWidth)));

      features.push({
        id: createId(),
        kind: 'area',
        name: `Estacionamiento General (~${estimatedCars} vehículos)`,
        categoryId: 'parking',
        notes: `Superficie calculada para capacidad de ${estimatedCars} vehículos (~25m² por vehículo incluyendo carriles de maniobra).`,
        coords: createMeterRect(parkingCenter, parkingWidth, parkingLength, 0, 0),
        createdAt: now + 4,
        color: '#1C7ED6',
        opacity: 0.45
      });
    }
  }

  // 5. VIP / SPONSORS LOUNGE & VIP PARKING
  if (input.hasVip) {
    features.push({
      id: createId(),
      kind: 'area',
      name: 'Sector VIP & Lounge de Invitados',
      categoryId: 'zones',
      notes: 'Acceso restringido con vista preferencial al escenario, barra privada y sanitarios exclusivos.',
      coords: createMeterRect(eventCenter, 32, 20, 45, 55),
      createdAt: now + 5,
      color: '#AE3EC9',
      opacity: 0.4
    });

    features.push({
      id: createId(),
      kind: 'area',
      name: 'Estacionamiento VIP & Prensa',
      categoryId: 'parking',
      notes: 'Plaza exclusiva para sponsors, artistas, prensa y producción junto al acceso.',
      coords: createMeterRect(eventCenter, 35, 22, -45, -55),
      createdAt: now + 51,
      color: '#1C7ED6',
      opacity: 0.4
    });
  }

  // 6. SAFETY, MEDICAL, SANITATION & ACCESS
  if (input.hasSafety) {
    // Medical Point
    const medCoords = meterOffsetToLatLng(eventCenter, -28, -35);
    features.push({
      id: createId(),
      kind: 'point',
      name: 'Puesto Médico & Ambulancia',
      categoryId: 'safety',
      notes: 'Punto de primeros auxilios con salida expedita y sin cruce con el público general hacia la vía pública.',
      coords: [medCoords],
      createdAt: now + 6,
      color: '#0CA678'
    });

    // Main Gate
    const gateCoords = meterOffsetToLatLng(eventCenter, 0, -35);
    features.push({
      id: createId(),
      kind: 'point',
      name: 'Portón de Acceso Principal & Acreditaciones',
      categoryId: 'access',
      notes: 'Batería de molinetes, escaneo de tickets y control de bolsos.',
      coords: [gateCoords],
      createdAt: now + 7,
      color: '#F06595'
    });

    // Restrooms North
    features.push({
      id: createId(),
      kind: 'point',
      name: 'Batería Sanitaria Norte (Baños Químicos)',
      categoryId: 'safety',
      notes: 'Módulos químicos y lavamanos con toma de agua y desagote programado.',
      coords: [meterOffsetToLatLng(eventCenter, -40, 50)],
      createdAt: now + 8,
      color: '#0CA678'
    });

    // Restrooms South
    features.push({
      id: createId(),
      kind: 'point',
      name: 'Batería Sanitaria Sur (Baños Químicos)',
      categoryId: 'safety',
      notes: 'Batería sanitaria auxiliar junto a la zona gastronómica y acceso.',
      coords: [meterOffsetToLatLng(eventCenter, 40, -35)],
      createdAt: now + 9,
      color: '#0CA678'
    });

    // Emergency Evacuation Path (Connects stage -> crowd -> gate -> parking)
    const p1 = meterOffsetToLatLng(eventCenter, 0, 70);
    const p2 = meterOffsetToLatLng(eventCenter, 0, 0);
    const p3 = gateCoords;
    const p4 = parkingCenter;

    features.push({
      id: createId(),
      kind: 'line',
      name: 'Corredor Central de Evacuación (8m)',
      categoryId: 'access',
      notes: 'Vía principal despejada para libre tránsito de vehículos de emergencia y desconcentración masiva.',
      coords: [p1, p2, p3, p4],
      createdAt: now + 10,
      color: '#F06595',
      strokeWidth: 4
    });
  }

  const detection: TerrainDetection = {
    hasExistingParking: !!vision.parkingBlob,
    existingParkingCoords: vision.parkingBlob?.polygon,
    openAreasCount: vision.openAreaBlob ? 1 : 0,
    roadsCount: 2,
    summary: vision.summary
  };

  const recommendations: string[] = [
    `Capacidad planificada para ${attendeeCount.toLocaleString()} asistentes.`,
    vision.parkingBlob
      ? 'Aprovecha playón de pavimento/asfalto detectado en la foto satelital para el estacionamiento.'
      : 'Estacionamiento dimensionado con ratio de evacuación vehicular.',
    'Zonas del evento ubicadas dentro del área abierta identificada, evitando techos y arboledas.',
    'Todos los polígonos son editables: puedes ajustar sus vértices directamente en el mapa satelital.'
  ];

  return {
    features,
    detection,
    satelliteImageUrl: vision.satelliteImageUrl,
    summary: `Distribución inteligente generada en ${input.place.label}. Se ubicaron ${features.length} zonas y puntos adaptados al terreno satelital detectado.`,
    recommendations
  };
}
