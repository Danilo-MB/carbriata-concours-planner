import React from 'react';

export interface MapFlexLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDomain?: boolean;
  className?: string;
  linkToHome?: boolean;
}

const sizeConfig = {
  xs: { iconSize: 18, textSize: 'text-xs', badgeSize: 'text-[9px] px-1 py-0.2' },
  sm: { iconSize: 24, textSize: 'text-sm', badgeSize: 'text-[10px] px-1.5 py-0.5' },
  md: { iconSize: 32, textSize: 'text-base', badgeSize: 'text-[10px] px-1.5 py-0.5' },
  lg: { iconSize: 40, textSize: 'text-xl', badgeSize: 'text-xs px-2 py-0.5' },
  xl: { iconSize: 48, textSize: 'text-2xl', badgeSize: 'text-xs px-2.5 py-1' },
};

export function MapFlexMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true">
      <defs>
        <linearGradient id="mf-mark-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        <linearGradient id="mf-mark-mid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="mf-mark-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <filter id="mf-mark-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#38BDF8" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* Fold 1 (Left panel) */}
      <path d="M6 14.5L18 9V35.5L6 41V14.5Z" fill="url(#mf-mark-left)" />

      {/* Fold 2 (Center panel - M-fold slope) */}
      <path d="M18 9L30 16V42.5L18 35.5V9Z" fill="url(#mf-mark-mid)" />

      {/* Fold 3 (Right panel) */}
      <path d="M30 16L42 10.5V37L30 42.5V16Z" fill="url(#mf-mark-right)" />

      {/* Crease highlights */}
      <path d="M18 9V35.5" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1" />
      <path d="M30 16V42.5" stroke="#000000" strokeOpacity="0.25" strokeWidth="1" />

      {/* Dynamic route flex curve */}
      <path
        d="M9 27C13 25.5 15 19.5 21 21C26 22.5 28 29.5 34 26.5C37 25 39 21.5 39 21.5"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#mf-mark-glow)"
      />

      {/* Waypoint beacon pins */}
      <circle cx="9" cy="27" r="2" fill="#FFFFFF" />
      <circle cx="39" cy="21.5" r="3.5" fill="#FFFFFF" />
      <circle cx="39" cy="21.5" r="2" fill="#0284C7" />
    </svg>
  );
}

export function MapFlexBadge({ size = 36, className = '' }: { size?: number; className?: string }) {
  const markSize = Math.round(size * 0.72);
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid place-items-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/15 shadow-sm shrink-0 overflow-hidden ${className}`}>
      <MapFlexMark size={markSize} />
    </div>
  );
}

export function MapFlexLogo({
  variant = 'full',
  size = 'md',
  showDomain = false,
  className = '',
}: MapFlexLogoProps) {
  const cfg = sizeConfig[size];

  if (variant === 'icon') {
    return <MapFlexMark size={cfg.iconSize} className={className} />;
  }

  if (variant === 'badge') {
    return <MapFlexBadge size={cfg.iconSize} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <MapFlexBadge size={cfg.iconSize} />
      <div className="flex items-center gap-1.5">
        <span className={`font-black tracking-tight leading-none text-ink ${cfg.textSize}`}>
          Map
          <span className="bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
            Flex
          </span>
        </span>
        {showDomain && (
          <span
            className={`hidden sm:inline-flex items-center font-bold tracking-wider rounded-md border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 ${cfg.badgeSize}`}>
            .APP
          </span>
        )}
      </div>
    </div>
  );
}
