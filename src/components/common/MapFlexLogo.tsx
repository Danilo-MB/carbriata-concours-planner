import React from 'react';

export interface MapFlexLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  linkToHome?: boolean;
}

const sizeConfig = {
  xs: { iconSize: 20, textSize: 'text-xs' },
  sm: { iconSize: 26, textSize: 'text-sm' },
  md: { iconSize: 32, textSize: 'text-base sm:text-lg' },
  lg: { iconSize: 40, textSize: 'text-xl' },
  xl: { iconSize: 48, textSize: 'text-2xl' },
};

/**
 * Modern Monochrome MapFlex Mark:
 * Minimalist Location Pin anchored over a 3D perspective map with architectural zoned areas.
 */
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
        {/* Monochrome Map Panel Folds */}
        <linearGradient id="mf-mono-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0B0F17" />
        </linearGradient>
        <linearGradient id="mf-mono-mid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#172033" />
        </linearGradient>
        <linearGradient id="mf-mono-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0B0F17" />
        </linearGradient>

        {/* Pure Monochrome Pin Gradient */}
        <linearGradient id="mf-mono-pin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* High-contrast soft drop shadow */}
        <filter id="mf-mono-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* 3-FOLD ISOMETRIC MAP BASE */}
      {/* Left Panel */}
      <path
        d="M6 16.5L18 11.5V37.5L6 42.5V16.5Z"
        fill="url(#mf-mono-left)"
        stroke="#475569"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      {/* Center Panel */}
      <path
        d="M18 11.5L30 17.5V43.5L18 37.5V11.5Z"
        fill="url(#mf-mono-mid)"
        stroke="#475569"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      {/* Right Panel */}
      <path
        d="M30 17.5L42 12.5V38.5L30 43.5V17.5Z"
        fill="url(#mf-mono-right)"
        stroke="#475569"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Architectural Crease Highlights */}
      <path d="M18 11.5V37.5" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M30 17.5V43.5" stroke="#000000" strokeOpacity="0.6" strokeWidth="1" />

      {/* Subtle Contour & Grid Lines */}
      <path d="M6 25L18 20 M6 33.5L18 28.5" stroke="#94A3B8" strokeOpacity="0.2" strokeWidth="0.75" strokeDasharray="2 2" />
      <path d="M18 20L30 26 M18 28.5L30 34.5" stroke="#94A3B8" strokeOpacity="0.2" strokeWidth="0.75" strokeDasharray="2 2" />
      <path d="M30 26L42 21 M30 34.5L42 29.5" stroke="#94A3B8" strokeOpacity="0.2" strokeWidth="0.75" strokeDasharray="2 2" />

      {/* ZONED AREA 1: Left Architectural Parcel */}
      <path
        d="M8 22L16 18.5V30.5L8 34V22Z"
        fill="#FFFFFF"
        fillOpacity="0.08"
        stroke="#FFFFFF"
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />
      <circle cx="8" cy="22" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="16" cy="18.5" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="16" cy="30.5" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="8" cy="34" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />

      {/* ZONED AREA 3: Right Architectural Parcel */}
      <path
        d="M32 23.5L40 20V31.5L32 35V23.5Z"
        fill="#FFFFFF"
        fillOpacity="0.08"
        stroke="#FFFFFF"
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />
      <circle cx="32" cy="23.5" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="40" cy="20" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="40" cy="31.5" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="32" cy="35" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />

      {/* ZONED AREA 2: Main Focus Parcel (Center Stage) */}
      <path
        d="M20 20L28 24V35L20 31V20Z"
        fill="#FFFFFF"
        fillOpacity="0.18"
        stroke="#FFFFFF"
        strokeOpacity="0.85"
        strokeWidth="0.9"
      />
      <circle cx="20" cy="20" r="1" fill="#FFFFFF" />
      <circle cx="28" cy="24" r="1" fill="#FFFFFF" />
      <circle cx="28" cy="35" r="1" fill="#FFFFFF" />
      <circle cx="20" cy="31" r="1" fill="#FFFFFF" />

      {/* Connecting Dotted Trail */}
      <path
        d="M12 26.5 C 15 25 17 21 21 23 C 24 24.5 26 27 30 25 C 33 23.5 36 25.5 36 25.5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="1.5 1.5"
        strokeOpacity="0.65"
      />

      {/* GROUND TARGET BEACON (Center Area) */}
      <ellipse cx="24.5" cy="26" rx="5" ry="2" fill="#FFFFFF" fillOpacity="0.14" />
      <ellipse cx="24.5" cy="26" rx="4" ry="1.6" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.8" strokeDasharray="2 1.5" />
      <circle cx="24.5" cy="26" r="1.2" fill="#FFFFFF" />

      {/* THE PURE MONOCHROME LOCATION PIN */}
      <g filter="url(#mf-mono-shadow)">
        <path
          d="M24.5 5.5 C 21.46 5.5 19 7.96 19 11 C 19 15.3 23.8 21.6 24.15 22.1 C 24.32 22.3 24.68 22.3 24.85 22.1 C 25.2 21.6 30 15.3 30 11 C 30 7.96 27.54 5.5 24.5 5.5 Z"
          fill="url(#mf-mono-pin)"
          stroke="#0F172A"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        {/* Inner Aperture Hole */}
        <circle cx="24.5" cy="11" r="2.4" fill="#0B0F19" />
      </g>
    </svg>
  );
}

export function MapFlexBadge({ size = 36, className = '' }: { size?: number; className?: string }) {
  const markSize = Math.round(size * 0.78);
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid place-items-center rounded-xl bg-black border border-white/15 shadow-sm shrink-0 overflow-hidden ${className}`}>
      <MapFlexMark size={markSize} />
    </div>
  );
}

export function MapFlexLogo({
  variant = 'full',
  size = 'md',
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
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <MapFlexBadge size={cfg.iconSize} />
      <span className={`font-black tracking-tight leading-none text-ink ${cfg.textSize}`}>
        Map<span className="font-semibold text-slate-500 dark:text-slate-400">Flex</span>
      </span>
    </div>
  );
}
