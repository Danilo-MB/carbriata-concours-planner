import type { Project } from '../types/plan';

export const seedProjects: Project[] = [
{
  id: 'carbriata-2027',
  name: 'Carbriata Concours 2027',
  description:
  'Segunda edición del festival de autos en movimiento. Expo sin vallado y tramo de 800 m de pista con dos chicanas: cada auto sale dos veces por día. Objetivo: 150+ autos en pista y más de 12.000 visitantes.',
  location: 'Autódromo de Dolores, Buenos Aires',
  template: 'event',
  center: { lat: -36.32639, lng: -57.69722, zoom: 16 },
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

}];