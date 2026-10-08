import { MapPinIcon, MousePointer2Icon, PentagonIcon, SplineIcon, SquareIcon, type LucideIcon } from 'lucide-react';
import type { Tool } from '../types/plan';

export const drawingTools: {id: Tool;label: string;shortcut: string;icon: LucideIcon;}[] = [
{ id: 'select', label: 'Select', shortcut: 'V', icon: MousePointer2Icon },
{ id: 'area', label: 'Area', shortcut: 'A', icon: PentagonIcon },
{ id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: SquareIcon },
{ id: 'line', label: 'Path', shortcut: 'L', icon: SplineIcon },
{ id: 'point', label: 'Marker', shortcut: 'M', icon: MapPinIcon }];