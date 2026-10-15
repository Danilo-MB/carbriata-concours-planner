import React from 'react';

export interface MapFlexLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  casing?: 'lower' | 'title';
  className?: string;
}

const sizeConfig = {
  xs: { pinSize: 14, iconSize: 16, textSize: 'text-xs', badgeSize: 22 },
  sm: { pinSize: 17, iconSize: 20, textSize: 'text-sm sm:text-base', badgeSize: 28 },
  md: { pinSize: 21, iconSize: 26, textSize: 'text-lg sm:text-xl', badgeSize: 34 },
  lg: { pinSize: 26, iconSize: 32, textSize: 'text-2xl sm:text-3xl', badgeSize: 42 },
  xl: { pinSize: 32, iconSize: 40, textSize: 'text-3xl sm:text-4xl', badgeSize: 50 },
};

/**
 * Modern Minimalist Pin Icon
 * Clean geometric teardrop silhouette with aperture cutout hole
 */
export function MapFlexPin({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C7.858 2 4.5 5.358 4.5 9.5C4.5 14.364 10.916 21.284 11.232 21.623C11.638 22.06 12.362 22.06 12.768 21.623C13.084 21.284 19.5 14.364 19.5 9.5C19.5 5.358 16.142 2 12 2ZM12 12.5C10.343 12.5 9 11.157 9 9.5C9 7.843 10.343 6.5 12 6.5C13.657 6.5 15 7.843 15 9.5C15 11.157 13.657 12.5 12 12.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Backward compatibility alias for MapFlexPin
 */
export const MapFlexMark = MapFlexPin;

/**
 * Subtle Icon Badge:
 * Minimalist squircle with centered pin icon
 */
export function MapFlexBadge({ size = 32, className = '' }: { size?: number; className?: string }) {
  const pinSize = Math.round(size * 0.58);
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid place-items-center rounded-xl bg-ink text-on-ink shadow-2xs shrink-0 select-none ${className}`}>
      <MapFlexPin size={pinSize} />
    </div>
  );
}

/**
 * Unified Wordmark Logo:
 * Shows the subtle pin at the beginning, followed by the wordmark "mapflex"
 */
export function MapFlexLogo({
  variant = 'full',
  size = 'md',
  casing = 'lower',
  className = '',
}: MapFlexLogoProps) {
  const cfg = sizeConfig[size];

  if (variant === 'icon') {
    return <MapFlexPin size={cfg.iconSize} className={className} />;
  }

  if (variant === 'badge') {
    return <MapFlexBadge size={cfg.badgeSize} className={className} />;
  }

  const firstPart = casing === 'title' ? 'Map' : 'map';
  const secondPart = casing === 'title' ? 'Flex' : 'flex';

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <span className="text-ink inline-flex items-center justify-center shrink-0">
        <MapFlexPin size={cfg.pinSize} />
      </span>
      <span className={`font-black tracking-tight leading-none text-ink ${cfg.textSize}`}>
        {firstPart}
        <span className="font-semibold text-slate-500 dark:text-slate-400">
          {secondPart}
        </span>
      </span>
    </div>
  );
}
