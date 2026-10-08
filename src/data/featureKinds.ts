import { MapPinIcon, PentagonIcon, SplineIcon, type LucideIcon } from 'lucide-react';
import type { FeatureKind } from '../types/plan';

export const featureKinds: Record<FeatureKind, {label: string;plural: string;icon: LucideIcon;}> = {
  area: { label: 'Area', plural: 'areas', icon: PentagonIcon },
  line: { label: 'Path', plural: 'paths', icon: SplineIcon },
  point: { label: 'Marker', plural: 'markers', icon: MapPinIcon }
};