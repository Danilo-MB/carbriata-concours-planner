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
 * Modern MapFlex Mark: Location Pin anchored over a 3D isometric folded map with colored zoned areas
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
        {/* Map Panel Gradients */}
        <linearGradient id="mf-fold-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="mf-fold-mid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="mf-fold-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Zoned Areas Gradients */}
        <linearGradient id="mf-area-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="mf-area-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="mf-area-amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Pin Gradient & Drop Shadow */}
        <linearGradient id="mf-pin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5E62" />
          <stop offset="50%" stopColor="#FF9966" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <filter id="mf-pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.55" />
        </filter>
        <radialGradient id="mf-beacon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* MAP BASE: 3-Fold Perspective Map */}
      {/* Left Panel */}
      <path
        d="M6 16.5L18 11.5V37.5L6 42.5V16.5Z"
        fill="url(#mf-fold-left)"
        stroke="#475569"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      {/* Center Panel */}
      <path
        d="M18 11.5L30 17.5V43.5L18 37.5V11.5Z"
        fill="url(#mf-fold-mid)"
        stroke="#475569"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      {/* Right Panel */}
      <path
        d="M30 17.5L42 12.5V38.5L30 43.5V17.5Z"
        fill="url(#mf-fold-right)"
        stroke="#475569"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Map Crease Highlights */}
      <path d="M18 11.5V37.5" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1" />
      <path d="M30 17.5V43.5" stroke="#000000" strokeOpacity="0.4" strokeWidth="1" />

      {/* Subtle Map Grid Lines */}
      <path d="M6 25L18 20 M6 33.5L18 28.5" stroke="#64748B" strokeOpacity="0.25" strokeWidth="0.75" strokeDasharray="2 2" />
      <path d="M18 20L30 26 M18 28.5L30 34.5" stroke="#64748B" strokeOpacity="0.25" strokeWidth="0.75" strokeDasharray="2 2" />
      <path d="M30 26L42 21 M30 34.5L42 29.5" stroke="#64748B" strokeOpacity="0.25" strokeWidth="0.75" strokeDasharray="2 2" />

      {/* ZONED AREA 1: Emerald Parcel (Left Fold) */}
      <path
        d="M8 22L16 18.5V30.5L8 34V22Z"
        fill="url(#mf-area-emerald)"
        fillOpacity="0.85"
        stroke="#34D399"
        strokeWidth="0.8"
      />
      <circle cx="8" cy="22" r="0.9" fill="#A7F3D0" />
      <circle cx="16" cy="18.5" r="0.9" fill="#A7F3D0" />
      <circle cx="16" cy="30.5" r="0.9" fill="#A7F3D0" />
      <circle cx="8" cy="34" r="0.9" fill="#A7F3D0" />

      {/* ZONED AREA 3: Amber Exhibition Parcel (Right Fold) */}
      <path
        d="M32 23.5L40 20V31.5L32 35V23.5Z"
        fill="url(#mf-area-amber)"
        fillOpacity="0.85"
        stroke="#FBBF24"
        strokeWidth="0.8"
      />
      <circle cx="32" cy="23.5" r="0.9" fill="#FDE68A" />
      <circle cx="40" cy="20" r="0.9" fill="#FDE68A" />
      <circle cx="40" cy="31.5" r="0.9" fill="#FDE68A" />
      <circle cx="32" cy="35" r="0.9" fill="#FDE68A" />

      {/* ZONED AREA 2: Central Staging Venue (Center Fold - Primary) */}
      <path
        d="M20 20L28 24V35L20 31V20Z"
        fill="url(#mf-area-indigo)"
        fillOpacity="0.9"
        stroke="#818CF8"
        strokeWidth="0.9"
      />
      <circle cx="20" cy="20" r="1" fill="#C7D2FE" />
      <circle cx="28" cy="24" r="1" fill="#C7D2FE" />
      <circle cx="28" cy="35" r="1" fill="#C7D2FE" />
      <circle cx="20" cy="31" r="1" fill="#C7D2FE" />

      {/* Connecting GPS Trail between areas */}
      <path
        d="M12 26.5 C 15 25 17 21 21 23 C 24 24.5 26 27 30 25 C 33 23.5 36 25.5 36 25.5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="1.5 1.5"
        strokeOpacity="0.8"
      />

      {/* PIN BEACON PULSE ON GROUND */}
      <ellipse cx="24.5" cy="26" rx="5" ry="2" fill="url(#mf-beacon-glow)" />
      <ellipse cx="24.5" cy="26" rx="4" ry="1.6" fill="none" stroke="#FF9966" strokeWidth="0.8" strokeDasharray="2 1.5" />
      <circle cx="24.5" cy="26" r="1.2" fill="#FFFFFF" />

      {/* THE LOCATION PIN (Floating above with soft drop shadow) */}
      <g filter="url(#mf-pin-shadow)">
        <path
          d="M24.5 5.5 C 21.46 5.5 19 7.96 19 11 C 19 15.3 23.8 21.6 24.15 22.1 C 24.32 22.3 24.68 22.3 24.85 22.1 C 25.2 21.6 30 15.3 30 11 C 30 7.96 27.54 5.5 24.5 5.5 Z"
          fill="url(#mf-pin-gradient)"
          stroke="#FFFFFF"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <circle cx="24.5" cy="11" r="2.4" fill="#FFFFFF" />
        <path
          d="M22 8.5 C 22.8 7.6 24 7.2 25.2 7.3"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
      </g>
    </svg>
  );
}

export function MapFlexBadge({ size = 36, className = '' }: { size?: number; className?: string }) {
  const markSize = Math.round(size * 0.78);
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
        Map
        <span className="bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
          Flex
        </span>
      </span>
    </div>
  );
}
