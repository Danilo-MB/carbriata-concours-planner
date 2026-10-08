import React from 'react';
import { categoryIcons } from '../../data/categoryIcons';
import type { Category } from '../../types/plan';

interface LayerSwatchProps {
  category: Pick<Category, 'color' | 'icon'>;
  colorOverride?: string;
  size?: 'sm' | 'md';
}

export function LayerSwatch({ category, colorOverride, size = 'md' }: LayerSwatchProps) {
  const Icon = categoryIcons[category.icon];
  const box = size === 'sm' ? 'h-5 w-5 rounded-md' : 'h-7 w-7 rounded-lg';
  const bg = colorOverride || category.color;
  return (
    <span className={`grid shrink-0 place-items-center ${box}`} style={{ backgroundColor: bg }} aria-hidden>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} color="#fff" strokeWidth={2.25} />
    </span>
  );
}