import React from 'react';
import { Building2Icon, CalendarDaysIcon, SquareDashedIcon } from 'lucide-react';
import type { TemplateId } from '../../types/plan';

const icons = {
  event: CalendarDaysIcon,
  realEstate: Building2Icon,
  blank: SquareDashedIcon
};

export function TemplateIcon({ id, className }: {id: TemplateId;className?: string;}) {
  const Icon = icons[id];
  return <Icon className={className} aria-hidden />;
}