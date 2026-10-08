export type LatLng = [number, number];

export type FeatureKind = 'area' | 'line' | 'point';

export type Tool = 'select' | 'area' | 'rectangle' | 'line' | 'point';

export type Basemap = 'satellite' | 'streets';

export type TemplateId = 'event' | 'realEstate' | 'blank';

export type PanelView = 'elements' | 'plan';

export type CategoryIconKey =
'car' |
'flag' |
'parking' |
'food' |
'music' |
'mic' |
'tent' |
'ambulance' |
'shield' |
'door' |
'trees' |
'house' |
'building' |
'store' |
'route' |
'pin' |
'star' |
'camera' |
'info' |
'trophy' |
'gavel' |
'water' |
'power' |
'warehouse' |
'construction';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: CategoryIconKey;
  kindHint?: FeatureKind;
}

export interface PlanFeature {
  id: string;
  kind: FeatureKind;
  name: string;
  categoryId: string;
  notes: string;
  coords: LatLng[];
  createdAt: number;
  images?: string[];
}

export interface MapView {
  lat: number;
  lng: number;
  zoom: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  template: TemplateId;
  center: MapView;
  basemap: Basemap;
  categories: Category[];
  features: PlanFeature[];
  hiddenCategoryIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PlanTemplate {
  id: TemplateId;
  name: string;
  description: string;
  categories: Category[];
}

export interface PlaceResult {
  id: string;
  label: string;
  secondary: string;
  lat: number;
  lng: number;
  bounds?: [LatLng, LatLng];
}

export interface NewPlanInput {
  name: string;
  template: TemplateId;
  place: PlaceResult | null;
}