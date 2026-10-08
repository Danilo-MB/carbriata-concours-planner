import type { LatLng, Tool } from './plan';

export interface MapCallbacks {
  tool: Tool;
  onSelect: (id: string | null) => void;
  onMapClick: (point: LatLng) => void;
  onFinishDraft: () => void;
  onGeometryChange: (id: string, coords: LatLng[]) => void;
  onDelete: (id: string) => void;
}