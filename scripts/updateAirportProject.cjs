const fs = require('fs');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1X2dvb2dfdzFpaGRjdW0iLCJlbWFpbCI6ImRtYXJpbm9iYXRhQGdtYWlsLmNvbSIsIm5hbWUiOiJEYW5pbG8iLCJyb2xlIjoiYWRtaW4iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3OTIxMDA3MDEsImV4cCI6MTc5MzMxMDMwMX0.pkbuQTmEIDPbInt2aPX6Rj7WlqkFZbYmSWWNKudXF60';

async function main() {
  const getRes = await fetch('https://www.mapflex.app/api/projects/xfb7p5vmva1kcj5');
  const project = await getRes.json();

  console.log('Project fetched:', project.id, project.name);

  const updatedFeatures = project.features.map((feat) => {
    switch (feat.id) {
      // 1. Area 1 - Parking
      case 'anguyrumva1lfcg':
        return {
          ...feat,
          name: 'Estacionamiento Terminal y Vehículos VIP',
          notes: 'Sector de estacionamiento para pasajeros ejecutivos, tripulaciones y transfers privados.',
          images: ['/streetview/aeropuerto/area1_parking.jpg']
        };

      // 2. Marker 1 - Parking Gate
      case '2t6prhwmva1lzzq':
        return {
          ...feat,
          name: 'Acceso Vehicular y Barrera de Estacionamiento',
          notes: 'Barrera automatizada y control de ingreso con ticket para vehículos particulares y remises autorizados.',
          images: ['/streetview/aeropuerto/marker1_estacionamiento.jpg']
        };

      // 3. Area 2 - Security PSA
      case 'ejcehn1mva1mbzt':
        return {
          ...feat,
          name: 'Puesto de Control y Seguridad PSA',
          notes: 'Edificio de control de la Policía de Seguridad Aeroportuaria (PSA), escáner de equipaje y control de acceso a plataforma.',
          images: ['/streetview/aeropuerto/area2_seguridad.jpg']
        };

      // 4. Marker 2 - PSA Guard Post
      case '7l1eflxmva1mgj3':
        return {
          ...feat,
          name: 'Puesto de Guardia PSA - Acceso a Rampa',
          notes: 'Control de credenciales aeroportuarias, control de personal y vehículos de apoyo terrestre.',
          images: ['/streetview/aeropuerto/marker2_psa_control.jpg']
        };

      // 5. Area 3 - FBO Executive Terminal
      case 'flpnis5mva1n0bu':
        return {
          ...feat,
          name: 'Terminal de Aviación Ejecutiva (FBO)',
          notes: 'Terminal de pasajeros con salas de espera ejecutivas, mostradores de check-in, aduana y migraciones.',
          images: ['/streetview/aeropuerto/area3_terminal.jpg']
        };

      // 6. Marker 3 - VIP Lounge
      case '06c8q9zmva1n42g':
        return {
          ...feat,
          name: 'Sala VIP y Salón de Espera FBO',
          notes: 'Salón exclusivo para pasajeros con vista panorámica a la rampa de aeronaves, barra de café y conectividad.',
          images: ['/streetview/aeropuerto/marker3_vip_lounge.jpg']
        };

      // 7. Area 4 - Hangar 1
      case 'r61ieclmva1ne1x':
        return {
          ...feat,
          name: 'Hangar 1 - Aviación Ejecutiva',
          notes: 'Hangar climatizado para guarda y pernocte de aeronaves ejecutivas de gran porte (Gulfstream, Global Express).',
          images: ['/streetview/aeropuerto/area4_hangar1.jpg']
        };

      // 8. Marker 5 (4th marker) - Hangar 1 Bay
      case 'sh49znhmva1nhi8':
        return {
          ...feat,
          name: 'Bahía de Maniobras Hangar 1',
          notes: 'Zona de remolque y posicionamiento de aeronaves asistida por tractores de empuje (tugs).',
          images: ['/streetview/aeropuerto/marker4_hangar1_bay.jpg']
        };

      // 9. Area 5 - Hangar 2
      case 'on2mwb0mva1olx7':
        return {
          ...feat,
          name: 'Hangar 2 - Mantenimiento y Helicópteros',
          notes: 'Taller de mantenimiento aeronáutico habilitado para inspecciones, mecánica de motores y servicios de aviónica.',
          images: ['/streetview/aeropuerto/area5_hangar2.jpg']
        };

      // 10. Marker 5 (5th marker) - Maintenance Workshop
      case '9wr8wetmva1oqar':
        return {
          ...feat,
          name: 'Taller Técnico y Banco de Motores',
          notes: 'Área de bancos de trabajo, herramientas especializadas y servicio de turbinas y aviónica.',
          images: ['/streetview/aeropuerto/marker5_taller_mantenimiento.jpg']
        };

      // 11. Path 1 - Access Boulevard
      case '6hq0pp4mva1pp7o':
        return {
          ...feat,
          name: 'Acceso Terrestre a Terminal FBO',
          notes: 'Recorrido desde el pórtico de ingreso sobre Av. Hipólito Yrigoyen hasta la terminal de aviación ejecutiva.',
          images: ['/streetview/aeropuerto/path1_wp0_acceso.jpg'],
          routeWaypoints: [
            {
              index: 0,
              title: 'Pórtico de Entrada (Av. Hipólito Yrigoyen)',
              image: '/streetview/aeropuerto/path1_wp0_acceso.jpg',
              caption: 'Ingreso principal al predio del Aeropuerto Internacional de San Fernando.'
            },
            {
              index: 1,
              title: 'Boulevard Interno y Rotonda',
              image: '/streetview/aeropuerto/path1_wp1_rotonda.jpg',
              caption: 'Circunvalación arbolada hacia terminales, hangares y estacionamientos.'
            },
            {
              index: 2,
              title: 'Ingreso a Estacionamiento Ejecutivo',
              image: '/streetview/aeropuerto/path1_wp2_parking_entry.jpg',
              caption: 'Barrera de control y playa de estacionamiento para pasajeros y visitas.'
            },
            {
              index: 3,
              title: 'Llegada a Terminal Ejecutiva FBO',
              image: '/streetview/aeropuerto/path1_wp3_terminal_curb.jpg',
              caption: 'Dársena de descenso de pasajeros frente a la terminal principal.'
            }
          ]
        };

      // 12. Area 6 - Ramp / Apron
      case 'yphdy4lmva1qeq6':
        return {
          ...feat,
          name: 'Rampa Principal de Aeronaves (Apron)',
          notes: 'Plataforma de estacionamiento con posiciones numeradas para jets ejecutivos y turbohélices.',
          images: ['/streetview/aeropuerto/area6_rampa.jpg']
        };

      // 13. Marker 6 - Stand
      case 'r15ttizmva1qllz':
        return {
          ...feat,
          name: 'Posición de Estacionamiento Stand Norte',
          notes: 'Puesto de rampa para embarque y desembarque de pasajeros ejecutivos con alfombra roja y asistencia en tierra.',
          images: ['/streetview/aeropuerto/marker6_rampa_stand.jpg']
        };

      // 14. Path 2 - Taxiway Alpha to RWY 05
      case 'ml922lumva1r4dw':
        return {
          ...feat,
          name: 'Calle de Rodaje Taxiway Alpha a Pista 05',
          notes: 'Ruta de carreteo para aeronaves desde la rampa hacia la cabecera activa de Pista 05.',
          images: ['/streetview/aeropuerto/path2_wp0_rampa_exit.jpg'],
          routeWaypoints: [
            {
              index: 0,
              title: 'Salida de Rampa Norte',
              image: '/streetview/aeropuerto/path2_wp0_rampa_exit.jpg',
              caption: 'Aeronave iniciando maniobra de pushback y rodaje guiada por señalero.'
            },
            {
              index: 1,
              title: 'Calle de Rodaje Taxiway Alpha',
              image: '/streetview/aeropuerto/path2_wp1_taxiway_alpha.jpg',
              caption: 'Arteria principal de rodaje pavimentada con línea amarilla central de guía.'
            },
            {
              index: 2,
              title: 'Curva de Conexión a Pista',
              image: '/streetview/aeropuerto/path2_wp2_taxiway_turn.jpg',
              caption: 'Viraje señalizado con luces de borde de calle de rodaje.'
            },
            {
              index: 3,
              title: 'Punto de Espera (Holding Point RWY 05)',
              image: '/streetview/aeropuerto/path2_wp3_holding_point.jpg',
              caption: 'Línea de detención obligatoria antes de recibir autorización de Torre de Control.'
            },
            {
              index: 4,
              title: 'Alineación en Cabecera Pista 05',
              image: '/streetview/aeropuerto/path2_wp4_runway_threshold.jpg',
              caption: 'Aeronave alineada sobre el eje de Pista 05 lista para carrera de despegue.'
            }
          ]
        };

      // 15. Area 7 - Fuel Farm
      case 'v053g98mva1rhje':
        return {
          ...feat,
          name: 'Planta de Combustible YPF Aviación',
          notes: 'Depósito de tanques de combustible aeronáutico Jet A-1 y Avgas 100LL con sistemas de filtrado de alta seguridad.',
          images: ['/streetview/aeropuerto/area7_combustible.jpg']
        };

      // 16. Marker 7 - Refueler Truck
      case 'fqvdg06mva1rpdc':
        return {
          ...feat,
          name: 'Isla de Carga y Camión Cisterna',
          notes: 'Unidad de reabastecimiento móvil para despacho directo de combustible a las aeronaves en rampa.',
          images: ['/streetview/aeropuerto/marker7_cisterna_fuel.jpg']
        };

      // 17. Path 3 - Service Corridor
      case 'tlhznbwmva1sb9f':
        return {
          ...feat,
          name: 'Corredor de Servicio Operativo y Hangares',
          notes: 'Vía de circulación interna para vehículos de apoyo terrestre, cisternas de combustible y remolcadores.',
          images: ['/streetview/aeropuerto/path3_wp0_hangar_road.jpg'],
          routeWaypoints: [
            {
              index: 0,
              title: 'Frente Hangar 1',
              image: '/streetview/aeropuerto/path3_wp0_hangar_road.jpg',
              caption: 'Calle de servicio frente al hangar principal de aviación ejecutiva.'
            },
            {
              index: 1,
              title: 'Vía de Tránsito de Apoyo Terrestre',
              image: '/streetview/aeropuerto/path3_wp1_service_road.jpg',
              caption: 'Carril delimitado para tractores, carritos de equipaje y vans de tripulación.'
            },
            {
              index: 2,
              title: 'Conexión a Planta de Combustible YPF',
              image: '/streetview/aeropuerto/path3_wp2_fuel_corridor.jpg',
              caption: 'Acceso regulado hacia la estación de reabastecimiento y camiones cisterna.'
            },
            {
              index: 3,
              title: 'Plataforma de Mantenimiento Sur',
              image: '/streetview/aeropuerto/path3_wp3_ramp_east.jpg',
              caption: 'Área de operaciones frente a talleres aeronáuticos y hangares técnicos.'
            }
          ]
        };

      // 18. Area 8 - Aeroclub
      case 'dxe2iz3mva1taii':
        return {
          ...feat,
          name: 'Sector Sur - Hangares Aeroclub y Escuelas de Vuelo',
          notes: 'Instalaciones tradicionales del Aeroclub San Fernando y escuelas de instrucción de pilotos civiles.',
          images: ['/streetview/aeropuerto/area8_aeroclub.jpg']
        };

      // 19. Marker 8 - Run-up
      case 'g6ety57mva1th1g':
        return {
          ...feat,
          name: 'Punto de Prueba de Motores (Run-Up Bay)',
          notes: 'Área habilitada para chequeo previo de magnetos, potencia y hélices antes de ingresar a la pista.',
          images: ['/streetview/aeropuerto/marker8_runup_bay.jpg']
        };

      // 20. Area 9 - Runway 05
      case '4frjgwemva1u54p':
        return {
          ...feat,
          name: 'Cabecera de Pista 05 y Franja de Seguridad',
          notes: 'Umbral activo de la pista principal 05/23 (asfalto 1800m), zona libre de obstáculos y franja de seguridad operacional.',
          images: ['/streetview/aeropuerto/area9_pista.jpg']
        };

      // 21. Marker 9 - PAPI Lights
      case 'xy8cb2nmva1ukyu':
        return {
          ...feat,
          name: 'Umbral de Pista 05 y Luces PAPI',
          notes: 'Señalización horizontal de fajas de umbral e indicador visual de senda de aproximación de precisión PAPI.',
          images: ['/streetview/aeropuerto/marker9_papi_lights.jpg']
        };

      default:
        return feat;
    }
  });

  const updatedProject = {
    ...project,
    description: 'Plano aeroportuario interactivo de San Fernando con terminal FBO, hangares, rampa de aeronaves, calle de rodaje y recorrido virtual 360° foto a foto.',
    features: updatedFeatures,
    updatedAt: Date.now()
  };

  // 1. Update in local carbriata_data.json
  try {
    const dataPath = './carbriata_data.json';
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      if (!data.projects) data.projects = {};
      data.projects[project.id] = updatedProject;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log('Saved to local carbriata_data.json');
    }
  } catch (err) {
    console.error('Error saving to carbriata_data.json:', err);
  }

  // 2. Send PUT request to MapFlex Cloud API
  const putRes = await fetch(`https://www.mapflex.app/api/projects/${project.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updatedProject)
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`PUT /api/projects/${project.id} failed: ${putRes.status} ${errText}`);
  }

  const result = await putRes.json();
  console.log('Successfully updated project on Cloud API:', result.id, 'features:', result.features.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
