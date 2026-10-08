import React, { useEffect, useState } from 'react';
import { BookmarkIcon, CheckIcon, PaletteIcon, RotateCcwIcon, SlidersIcon, Trash2Icon } from 'lucide-react';
import { OFFICIAL_PALETTE, clearUserColorPresets, getUserColorPresets, saveUserColorPreset } from '../../data/palettePresets';
import type { Category, PlanFeature } from '../../types/plan';

interface ElementStyleControlsProps {
  feature: PlanFeature;
  category: Category;
  onChange: (patch: Partial<PlanFeature>) => void;
}

export function ElementStyleControls({ feature, category, onChange }: ElementStyleControlsProps) {
  const currentColor = (feature.color || category.color).toUpperCase();
  const hasCustomColor = Boolean(feature.color);
  const [hexInput, setHexInput] = useState(currentColor.replace('#', ''));
  const [userPresets, setUserPresets] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setUserPresets(getUserColorPresets());
  }, []);

  useEffect(() => {
    setHexInput((feature.color || category.color).replace('#', '').toUpperCase());
  }, [feature.id, feature.color, category.color]);

  const handleHexChange = (value: string) => {
    const clean = value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).toUpperCase();
    setHexInput(clean);
    if (clean.length === 6 || clean.length === 3) {
      const full = clean.length === 3
        ? `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`
        : `#${clean}`;
      onChange({ color: full });
    }
  };

  const handleSavePreset = () => {
    const updated = saveUserColorPreset(currentColor);
    setUserPresets(updated);
    setToast('Color guardado');
    setTimeout(() => setToast(null), 2000);
  };

  const handleClearPresets = () => {
    clearUserColorPresets();
    setUserPresets([]);
  };

  // Opacity defaults and current values
  const defaultOpacity = feature.kind === 'area' ? 0.45 : feature.kind === 'line' ? 0.95 : 1.0;
  const currentOpacity = feature.opacity ?? defaultOpacity;
  const opacityPercent = Math.round(currentOpacity * 100);

  // Line width
  const defaultLineWidth = 5;
  const currentLineWidth = feature.strokeWidth ?? defaultLineWidth;

  return (
    <div className="mt-6 rounded-xl border border-line bg-subtle/40 p-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink">
          <PaletteIcon className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
          Color y Opacidad
        </label>
        {hasCustomColor && (
          <button
            type="button"
            onClick={() => onChange({ color: undefined })}
            title={`Restablecer al color oficial de ${category.name}`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-ink transition-colors">
            <RotateCcwIcon className="h-3 w-3" />
            Restablecer a capa
          </button>
        )}
      </div>

      {/* Main Color Picker Bar */}
      <div className="mt-3 flex items-center gap-2">
        {/* Color preview circle with hidden native input */}
        <label
          className="relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-line shadow-xs transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: currentColor }}
          title="Haz clic para abrir el selector de color libre">
          <input
            type="color"
            value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#10B981'}
            onChange={(e) => {
              const hex = e.target.value.toUpperCase();
              setHexInput(hex.replace('#', ''));
              onChange({ color: hex });
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>

        {/* Hex input box */}
        <div className="relative flex flex-1 items-center rounded-lg border border-line bg-surface px-2.5 py-1.5 focus-within:border-ink shadow-2xs">
          <span className="font-mono text-xs font-semibold text-muted select-none">#</span>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            maxLength={6}
            placeholder="HEX"
            className="ml-1 w-full bg-transparent font-mono text-xs font-semibold uppercase tracking-wider text-ink placeholder:text-muted focus:outline-none"
          />
        </div>

        {/* Bookmark button */}
        <button
          type="button"
          onClick={handleSavePreset}
          title="Guardar este color en Mis Guardados"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink shadow-2xs transition-colors hover:bg-subtle active:scale-95">
          <BookmarkIcon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          <span>{toast ? toast : 'Guardar'}</span>
        </button>
      </div>

      {/* Official Color Swatches Grid */}
      <div className="mt-3">
        <p className="text-[11px] font-medium text-muted">Colores predeterminados:</p>
        <div className="mt-1.5 grid grid-cols-6 gap-1.5">
          {OFFICIAL_PALETTE.map((preset) => {
            const isSelected = currentColor === preset.hex.toUpperCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => {
                  setHexInput(preset.hex.replace('#', ''));
                  onChange({ color: preset.hex });
                }}
                title={`${preset.label} (${preset.hex})`}
                className={`group relative aspect-square w-full rounded-md border transition-all ${
                  isSelected
                    ? 'border-ink ring-2 ring-ink ring-offset-1 scale-105 shadow-sm'
                    : 'border-black/10 hover:scale-105'
                }`}
                style={{ backgroundColor: preset.hex }}>
                {isSelected && (
                  <CheckIcon
                    className={`absolute inset-0 m-auto h-3 w-3 ${
                      preset.hex === '#F8FAFC' ? 'text-black' : 'text-white'
                    }`}
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Saved Colors (if any) */}
      {userPresets.length > 0 && (
        <div className="mt-3 border-t border-line/50 pt-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-muted">Mis colores guardados:</span>
            <button
              type="button"
              onClick={handleClearPresets}
              className="text-[10px] text-muted hover:text-danger flex items-center gap-0.5">
              <Trash2Icon className="h-2.5 w-2.5" />
              Limpiar
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {userPresets.map((hex) => {
              const isSelected = currentColor === hex.toUpperCase();
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    setHexInput(hex.replace('#', ''));
                    onChange({ color: hex });
                  }}
                  title={`Color personalizado: ${hex}`}
                  className={`h-6 w-6 rounded-md border transition-transform ${
                    isSelected ? 'border-ink ring-2 ring-ink ring-offset-1' : 'border-black/10 hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Opacity Slider */}
      <div className="mt-4 border-t border-line/60 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-ink flex items-center gap-1.5">
            <SlidersIcon className="h-3 w-3 text-muted" aria-hidden="true" />
            {feature.kind === 'area'
              ? 'Opacidad de relleno'
              : feature.kind === 'line'
              ? 'Opacidad de trazado'
              : 'Opacidad del marcador'}
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-ink">{opacityPercent}%</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={feature.kind === 'area' ? 10 : 20}
            max={100}
            step={5}
            value={opacityPercent}
            onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-line accent-ink focus:outline-none"
          />
          {feature.opacity !== undefined && (
            <button
              type="button"
              onClick={() => onChange({ opacity: undefined })}
              title="Restablecer opacidad por defecto"
              className="text-[11px] text-muted hover:text-ink shrink-0">
              <RotateCcwIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Stroke width slider for lines */}
      {feature.kind === 'line' && (
        <div className="mt-3 border-t border-line/60 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink">Grosor de la pista / línea</span>
            <span className="font-mono text-xs font-semibold tabular-nums text-ink">{currentLineWidth} px</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={14}
              step={1}
              value={currentLineWidth}
              onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-line accent-ink focus:outline-none"
            />
            {feature.strokeWidth !== undefined && (
              <button
                type="button"
                onClick={() => onChange({ strokeWidth: undefined })}
                title="Restablecer grosor por defecto"
                className="text-[11px] text-muted hover:text-ink shrink-0">
                <RotateCcwIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
