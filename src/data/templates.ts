import type { MapView, PlanTemplate } from '../types/plan';

export const defaultMapView: MapView = { lat: -34.6037, lng: -58.3816, zoom: 13 };

export const planTemplates: PlanTemplate[] = [
{
  id: 'event',
  name: 'Event layout',
  description: 'Zones, stages, food, parking and safety for festivals, fairs and car shows.',
  categories: [
  { id: 'zones', name: 'Zones', color: '#E8590C', icon: 'tent', kindHint: 'area' },
  { id: 'stages', name: 'Stages & shows', color: '#AE3EC9', icon: 'music' },
  { id: 'food', name: 'Food & drinks', color: '#F59F00', icon: 'food' },
  { id: 'parking', name: 'Parking', color: '#1C7ED6', icon: 'parking' },
  { id: 'access', name: 'Access & paths', color: '#F06595', icon: 'door', kindHint: 'line' },
  { id: 'safety', name: 'Safety & services', color: '#0CA678', icon: 'ambulance', kindHint: 'point' }]

},
{
  id: 'realEstate',
  name: 'Land development',
  description: 'Lots, streets, green spaces and amenities for neighborhoods and subdivisions.',
  categories: [
  { id: 'lots', name: 'Lots', color: '#E8590C', icon: 'house', kindHint: 'area' },
  { id: 'streets', name: 'Streets', color: '#F59F00', icon: 'route', kindHint: 'line' },
  { id: 'green', name: 'Green spaces', color: '#74B816', icon: 'trees' },
  { id: 'amenities', name: 'Amenities', color: '#AE3EC9', icon: 'store' },
  { id: 'common', name: 'Common areas', color: '#1C7ED6', icon: 'building' },
  { id: 'poi', name: 'Points of interest', color: '#F06595', icon: 'pin', kindHint: 'point' }]

},
{
  id: 'blank',
  name: 'Blank plan',
  description: 'Three basic layers to start with. Rename them or add your own.',
  categories: [
  { id: 'areas', name: 'Areas', color: '#E8590C', icon: 'star', kindHint: 'area' },
  { id: 'paths', name: 'Paths', color: '#1C7ED6', icon: 'route', kindHint: 'line' },
  { id: 'points', name: 'Points', color: '#0CA678', icon: 'pin', kindHint: 'point' }]

}];