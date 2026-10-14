import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CompassIcon,
  FootprintsIcon,
  Maximize2Icon,
  Minimize2Icon,
  NavigationIcon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatLength, distance } from '../../utils/geo';
import { compressImageFile } from '../../utils/imageUpload';
import {
  calculateBearing,
  getCompassDirection,
  getEffectiveWaypoints,
  SAMPLE_STREETVIEW_WAYPOINTS,
} from '../../data/streetViewSamples';
import type { LatLng, PlanFeature, RouteWaypoint } from '../../types/plan';

interface StreetViewPlayerProps {
  feature: PlanFeature;
  initialIndex?: number;
  onClose?: () => void;
  isModal?: boolean;
  canEdit?: boolean;
  onUpdateWaypoint?: (index: number, patch: Partial<RouteWaypoint>) => void;
}

export function StreetViewPlayer({
  feature,
  initialIndex = 0,
  onClose,
  isModal = true,
  canEdit = false,
  onUpdateWaypoint,
}: StreetViewPlayerProps) {
  const waypoints = useMemo(() => getEffectiveWaypoints(feature), [feature]);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(waypoints.length - 1, 0))
  );
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showMinimap, setShowMinimap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWaypoint = waypoints[currentIndex] || {
    index: currentIndex,
    title: `Punto ${currentIndex + 1}`,
  };

  const nextWaypoint = currentIndex < waypoints.length - 1 ? waypoints[currentIndex + 1] : null;
  const prevWaypoint = currentIndex > 0 ? waypoints[currentIndex - 1] : null;

  // Bearing from current coord to next coord
  const bearing = useMemo(() => {
    if (feature.coords.length < 2) return 0;
    const from = feature.coords[currentIndex];
    const to =
      currentIndex < feature.coords.length - 1
        ? feature.coords[currentIndex + 1]
        : feature.coords[currentIndex - 1];
    if (!from || !to) return 0;
    return calculateBearing(from, to);
  }, [feature.coords, currentIndex]);

  const compassLabel = getCompassDirection(bearing);

  // Distance of current segment
  const segmentDistance = useMemo(() => {
    if (feature.coords.length < 2) return null;
    if (currentIndex < feature.coords.length - 1) {
      const p1 = feature.coords[currentIndex];
      const p2 = feature.coords[currentIndex + 1];
      return formatLength(distance(p1, p2));
    }
    return null;
  }, [feature.coords, currentIndex]);

  const goNext = () => {
    if (currentIndex < waypoints.length - 1) {
      setDirection('forward');
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex((i) => i - 1);
    }
  };

  const goToIndex = (idx: number) => {
    if (idx >= 0 && idx < waypoints.length) {
      setDirection(idx > currentIndex ? 'forward' : 'backward');
      setCurrentIndex(idx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, waypoints.length, onClose]);

  // Handle photo upload for current waypoint
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateWaypoint) return;
    setIsUploading(true);
    try {
      const compressed = await compressImageFile(file, 1600, 0.85);
      onUpdateWaypoint(currentIndex, { image: compressed });
      toast.success(`Foto guardada para el punto ${currentIndex + 1}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Fallback image if current waypoint has no image
  const currentImage = currentWaypoint.image || SAMPLE_STREETVIEW_WAYPOINTS[currentIndex % SAMPLE_STREETVIEW_WAYPOINTS.length].image;

  const content = (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden bg-black text-white select-none ${
        isModal ? 'h-[92dvh] w-full max-w-5xl rounded-2xl shadow-2xl border border-white/10' : 'h-full w-full'
      }`}
    >
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Main Street View Panorama Viewport */}
      <div className="relative flex-1 overflow-hidden bg-zinc-950">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`photo-${currentIndex}`}
            initial={{
              opacity: 0,
              scale: direction === 'forward' ? 1.08 : 0.94,
              x: direction === 'forward' ? 20 : -20,
            }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{
              opacity: 0,
              scale: direction === 'forward' ? 0.94 : 1.08,
              x: direction === 'forward' ? -20 : 20,
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full"
          >
            <img
              src={currentImage}
              alt={currentWaypoint.title || `Punto ${currentIndex + 1}`}
              className="h-full w-full object-cover"
            />
            {/* Ambient vignette gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
          </motion.div>
        </AnimatePresence>

        {/* Top HUD Overlay */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between p-4 sm:p-5">
          {/* Street View Badge & Location Title */}
          <div className="flex max-w-[70%] flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-black shadow-md backdrop-blur-md">
                <FootprintsIcon className="h-3 w-3" />
                Street View Virtual
              </span>
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                Paso {currentIndex + 1} de {waypoints.length}
              </span>
            </div>

            <h3 className="mt-1 text-base font-bold tracking-tight text-white drop-shadow-md sm:text-xl">
              {currentWaypoint.title || `Punto ${currentIndex + 1}`}
            </h3>

            {currentWaypoint.caption && (
              <p className="line-clamp-2 text-xs text-white/80 drop-shadow-sm sm:text-sm">
                {currentWaypoint.caption}
              </p>
            )}

            {/* Bearing & Segment metrics */}
            <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-white/70">
              <span className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-sm">
                <CompassIcon className="h-3 w-3 text-amber-400" />
                {compassLabel} ({Math.round(bearing)}°)
              </span>
              {segmentDistance && (
                <span className="rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-sm">
                  Distancia: {segmentDistance}
                </span>
              )}
            </div>
          </div>

          {/* Controls: Fullscreen, Upload, Close */}
          <div className="flex items-center gap-2">
            {canEdit && onUpdateWaypoint && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Cambiar foto de este punto"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-white/20 bg-black/60 px-3 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-black/80 hover:border-amber-400 active:scale-95"
              >
                <UploadIcon className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {isUploading ? 'Subiendo...' : 'Cambiar foto'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Pantalla completa"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 active:scale-95"
            >
              {isFullscreen ? (
                <Minimize2Icon className="h-4 w-4" />
              ) : (
                <Maximize2Icon className="h-4 w-4" />
              )}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar Street View"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-red-500/80 hover:border-red-400 active:scale-95"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Street-Level Interactive Ground Step Arrow (The Google Street View Chevron!) */}
        {nextWaypoint && (
          <div className="pointer-events-auto absolute bottom-28 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center">
            <motion.button
              type="button"
              onClick={goNext}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex flex-col items-center"
            >
              {/* Tooltip banner */}
              <div className="mb-2 flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-black/80 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md transition-all group-hover:bg-amber-500 group-hover:text-black">
                <FootprintsIcon className="h-3.5 w-3.5 animate-bounce" />
                <span>Avanzar al Punto {currentIndex + 2}: {nextWaypoint.title || `Punto ${currentIndex + 2}`}</span>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </div>

              {/* 3D-perspective Chevron Disc on the Ground */}
              <div
                style={{ transform: 'perspective(400px) rotateX(48deg)' }}
                className="relative flex h-14 w-24 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500/30 shadow-[0_0_25px_rgba(245,159,0,0.6)] backdrop-blur-xs transition-all group-hover:bg-amber-400 group-hover:shadow-[0_0_35px_rgba(245,159,0,0.9)]"
              >
                <ChevronUpIcon className="h-8 w-8 text-amber-300 drop-shadow group-hover:text-black transition-colors" />
                <div className="absolute inset-0 animate-ping rounded-full border border-amber-400/40" />
              </div>
            </motion.button>
          </div>
        )}

        {/* Step-Back Arrow on Left if previous exists */}
        {prevWaypoint && (
          <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Punto anterior"
              className="group flex items-center gap-2 rounded-2xl border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 active:scale-95"
            >
              <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
              <div className="hidden text-left md:block">
                <p className="text-[10px] uppercase font-bold text-white/60">Anterior</p>
                <p className="max-w-[100px] truncate text-xs font-semibold text-white">
                  {prevWaypoint.title || `Punto ${currentIndex}`}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Step-Forward Arrow on Right if next exists */}
        {nextWaypoint && (
          <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2">
            <button
              type="button"
              onClick={goNext}
              aria-label="Punto siguiente"
              className="group flex items-center gap-2 rounded-2xl border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 active:scale-95"
            >
              <div className="hidden text-right md:block">
                <p className="text-[10px] uppercase font-bold text-white/60">Siguiente</p>
                <p className="max-w-[100px] truncate text-xs font-semibold text-white">
                  {nextWaypoint.title || `Punto ${currentIndex + 2}`}
                </p>
              </div>
              <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Picture-in-picture Mini-Map (Radar) */}
        {showMinimap && feature.coords.length > 0 && (
          <div className="absolute bottom-24 right-4 z-20 hidden sm:block">
            <MiniMapRadar
              coords={feature.coords}
              currentIndex={currentIndex}
              bearing={bearing}
              onSelectIndex={goToIndex}
            />
          </div>
        )}
      </div>

      {/* Bottom Control Bar & Waypoint Thumbnails Strip */}
      <div className="relative z-20 flex flex-col border-t border-white/10 bg-zinc-900/95 p-3 backdrop-blur-md">
        {/* Progress track */}
        <div className="mb-2 flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{feature.name || 'Recorrido'}</span>
            <span>·</span>
            <span>Usa las teclas ← → o clics para caminar</span>
          </div>
          <span className="font-mono text-amber-400 font-bold">
            {Math.round(((currentIndex + 1) / waypoints.length) * 100)}%
          </span>
        </div>

        {/* Thumbnails strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {waypoints.map((wp, idx) => {
            const isActive = idx === currentIndex;
            const img = wp.image || SAMPLE_STREETVIEW_WAYPOINTS[idx % SAMPLE_STREETVIEW_WAYPOINTS.length].image;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToIndex(idx)}
                className={`group relative flex h-14 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 z-10'
                    : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/40'
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[10px] font-bold text-white leading-tight">
                  <span className="rounded bg-black/60 px-1">{idx + 1}</span>
                  <span className="truncate max-w-[50px]">{wp.title || `P${idx + 1}`}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl"
      >
        {content}
      </motion.div>
    </div>
  );
}

/**
 * Picture-in-picture SVG Mini-Map Radar component
 */
function MiniMapRadar({
  coords,
  currentIndex,
  bearing,
  onSelectIndex,
}: {
  coords: LatLng[];
  currentIndex: number;
  bearing: number;
  onSelectIndex: (idx: number) => void;
}) {
  if (coords.length === 0) return null;

  // Compute bounding box
  const lats = coords.map((c) => c[0]);
  const lngs = coords.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);

  const width = 140;
  const height = 110;
  const padding = 16;

  // Project lat/lng to SVG space
  const project = (coord: LatLng) => {
    const [lat, lng] = coord;
    const x = padding + ((lng - minLng) / lngSpan) * (width - 2 * padding);
    const y = height - (padding + ((lat - minLat) / latSpan) * (height - 2 * padding));
    return { x, y };
  };

  const points = coords.map(project);
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const currentPoint = points[currentIndex] || points[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/80 p-2 shadow-2xl backdrop-blur-md">
      <div className="mb-1 flex items-center justify-between px-1 text-[10px] font-bold text-white/70">
        <span className="flex items-center gap-1">
          <NavigationIcon className="h-2.5 w-2.5 text-amber-400" />
          Mini-mapa
        </span>
        <span className="font-mono text-amber-400">P{currentIndex + 1}</span>
      </div>

      <svg width={width} height={height} className="rounded-lg bg-zinc-900/90">
        {/* Route line shadow */}
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Route line */}
        <path d={pathD} fill="none" stroke="#F59F00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Waypoint dots */}
        {points.map((pt, i) => {
          const isCurrent = i === currentIndex;
          return (
            <g
              key={i}
              className="cursor-pointer"
              onClick={() => onSelectIndex(i)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isCurrent ? 7 : 4}
                fill={isCurrent ? '#38BDF8' : '#FFFFFF'}
                stroke={isCurrent ? '#FFFFFF' : '#000000'}
                strokeWidth={isCurrent ? 2 : 1}
              />
            </g>
          );
        })}

        {/* Vision Cone / Flashlight wedge representing Street View camera direction */}
        <g transform={`translate(${currentPoint.x}, ${currentPoint.y}) rotate(${bearing})`}>
          <path
            d="M 0 0 L -14 -32 A 32 32 0 0 1 14 -32 Z"
            fill="rgba(56, 189, 248, 0.35)"
            stroke="rgba(56, 189, 248, 0.7)"
            strokeWidth="1"
          />
          <circle cx="0" cy="0" r="3.5" fill="#0284C7" />
        </g>
      </svg>
    </div>
  );
}
