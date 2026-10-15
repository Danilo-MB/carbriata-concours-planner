import React, { useRef, useState } from 'react';
import {
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FootprintsIcon,
  PlayIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { compressImageFile } from '../../utils/imageUpload';
import {
  generateSampleWaypointsForCoords,
  getEffectiveWaypoints,
  hasStreetViewPhotos,
} from '../../data/streetViewSamples';
import type { PlanFeature, RouteWaypoint } from '../../types/plan';

interface RouteWaypointManagerProps {
  feature: PlanFeature;
  onChange: (patch: Partial<PlanFeature>) => void;
  onOpenStreetView: (initialIndex?: number) => void;
}

export function RouteWaypointManager({
  feature,
  onChange,
  onOpenStreetView,
}: RouteWaypointManagerProps) {
  const waypoints = getEffectiveWaypoints(feature);
  const fileInputsRef = useRef<Map<number, HTMLInputElement>>(new Map());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isUploadingIdx, setIsUploadingIdx] = useState<number | null>(null);

  const photosCount = waypoints.filter((w) => !!w.image).length;
  const hasPhotos = photosCount > 0;

  const updateWaypoint = (index: number, patch: Partial<RouteWaypoint>) => {
    const current = [...(feature.routeWaypoints || [])];
    const existingIdx = current.findIndex((w) => w.index === index);
    if (existingIdx >= 0) {
      current[existingIdx] = { ...current[existingIdx], ...patch };
    } else {
      current.push({
        index,
        title: `Punto ${index + 1}`,
        ...patch,
      });
    }
    onChange({ routeWaypoints: current });
  };

  const handleFileUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setIsUploadingIdx(index);
    try {
      const compressed = await compressImageFile(file, 1600, 0.85);
      updateWaypoint(index, { image: compressed });
      toast.success(`Foto guardada para el punto ${index + 1}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar la imagen');
    } finally {
      setIsUploadingIdx(null);
    }
  };

  const handleDeletePhoto = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateWaypoint(index, { image: undefined });
    toast.success(`Foto eliminada del punto ${index + 1}`);
  };

  const handleApplySamplePhotos = () => {
    const samples = generateSampleWaypointsForCoords(feature.coords.length, feature);
    onChange({ routeWaypoints: samples });
    toast.success('Fotos de ejemplo cargadas en todos los puntos');
  };

  return (
    <div className="mt-6 rounded-2xl border border-line bg-subtle/30 p-3.5 sm:p-4">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-line pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <FootprintsIcon className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-ink flex items-center gap-1.5">
                Recorrido Virtual 360°
              </h4>
              <p className="text-[11px] text-muted">
                {photosCount} de {waypoints.length} puntos con foto a nivel de suelo
              </p>
            </div>
          </div>

          {/* Open Street View Player Button */}
          <button
            type="button"
            onClick={() => onOpenStreetView(0)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-3 text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <PlayIcon className="h-3 w-3 fill-current" />
            Probar paseo
          </button>
        </div>

        {/* Quick action: Apply sample photos */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleApplySamplePhotos}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            Cargar fotos de ejemplo (Demo)
          </button>

          <span className="text-[11px] text-muted">
            Haz clic en un punto para editar
          </span>
        </div>
      </div>

      {/* Waypoint list */}
      <div className="mt-3 divide-y divide-line/60">
        {waypoints.map((wp, idx) => {
          const isExpanded = expandedIndex === idx;
          const isUploading = isUploadingIdx === idx;
          const isStart = idx === 0;
          const isEnd = idx === waypoints.length - 1;

          return (
            <div key={idx} className="py-2.5">
              {/* Waypoint Row Header */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="flex cursor-pointer items-center justify-between rounded-xl p-1.5 hover:bg-subtle transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Photo thumbnail or camera placeholder */}
                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-ink/5">
                    {wp.image ? (
                      <img
                        src={wp.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-muted">
                        <CameraIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[10px] font-bold text-ink">
                        P{idx + 1}
                      </span>
                      {isStart && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Inicio
                        </span>
                      )}
                      {isEnd && (
                        <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                          Fin
                        </span>
                      )}
                      <p className="truncate text-xs font-semibold text-ink">
                        {wp.title || `Punto ${idx + 1}`}
                      </p>
                    </div>

                    <p className="text-[11px] text-muted truncate">
                      {wp.image ? 'Foto adjunta' : 'Sin foto asignada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {wp.image && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenStreetView(idx);
                      }}
                      title="Ver recorrido desde aquí"
                      className="grid h-7 w-7 place-items-center rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                      <FootprintsIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4 text-muted" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-muted" />
                  )}
                </div>
              </div>

              {/* Waypoint Expanded Details */}
              {isExpanded && (
                <div className="mt-2 space-y-2.5 rounded-xl border border-line/60 bg-surface p-3">
                  {/* Photo preview & upload dropzone */}
                  <div className="flex items-start gap-3">
                    <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-black/5">
                      {wp.image ? (
                        <>
                          <img
                            src={wp.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleDeletePhoto(idx, e)}
                            title="Eliminar foto"
                            className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-md bg-black/70 text-white hover:bg-red-600 transition-colors"
                          >
                            <Trash2Icon className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="grid h-full w-full place-items-center text-muted">
                          <CameraIcon className="h-6 w-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => {
                          if (el) fileInputsRef.current.set(idx, el);
                          else fileInputsRef.current.delete(idx);
                        }}
                        onChange={(e) =>
                          handleFileUpload(idx, e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />

                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputsRef.current.get(idx)?.click()}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-subtle px-3 text-xs font-semibold text-ink hover:bg-subtle/80 transition-colors"
                      >
                        <UploadIcon className="h-3.5 w-3.5 text-muted" />
                        {isUploading
                          ? 'Subiendo...'
                          : wp.image
                          ? 'Cambiar foto'
                          : 'Subir foto a nivel de suelo'}
                      </button>

                      <p className="text-[11px] text-muted leading-tight">
                        Formatos JPG, PNG, WebP. Se comprime automáticamente.
                      </p>
                    </div>
                  </div>

                  {/* Title & Caption inputs */}
                  <div>
                    <label className="text-[11px] font-medium text-muted">
                      Nombre o referencia del punto:
                    </label>
                    <input
                      type="text"
                      value={wp.title || ''}
                      onChange={(e) =>
                        updateWaypoint(idx, { title: e.target.value })
                      }
                      placeholder={`Ej: Acceso ${idx + 1}, Pasillo Norte, etc.`}
                      className="mt-1 h-8 w-full rounded-lg border border-line bg-surface px-2.5 text-xs text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted">
                      Detalle o indicación (opcional):
                    </label>
                    <input
                      type="text"
                      value={wp.caption || ''}
                      onChange={(e) =>
                        updateWaypoint(idx, { caption: e.target.value })
                      }
                      placeholder="Ej: Girar hacia los stands a la derecha..."
                      className="mt-1 h-8 w-full rounded-lg border border-line bg-surface px-2.5 text-xs text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
