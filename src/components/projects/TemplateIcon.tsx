import React from 'react';
import { Building2Icon, CalendarDaysIcon, FactoryIcon, SquareDashedIcon, WarehouseIcon } from 'lucide-react';
import type { TemplateId } from '../../types/plan';

const icons = {
  event: CalendarDaysIcon,
  realEstate: Building2Icon,
  logistics: WarehouseIcon,
  industrial: FactoryIcon,
  blank: SquareDashedIcon
};

export function TemplateIcon({ id, className }: {id: TemplateId;className?: string;}) {
  const Icon = icons[id] || SquareDashedIcon;
  return <Icon className={className} aria-hidden />;
}