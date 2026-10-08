import L from 'leaflet';
import type { TileLayerOptions } from 'leaflet';

const TILE_SIZE = 256;
// Esri returns this JPEG when a zoom level has no imagery for that tile.
const PLACEHOLDER_BYTES = 2521;

interface TileCoords {
  z: number;
  x: number;
  y: number;
}

interface ResolvedTile extends TileCoords {
  url: string;
}

interface AbortableTile extends HTMLElement {
  _abort?: AbortController;
}

const unavailable = new Set<string>();
const ready = new Map<string, string>();
const pending = new Map<string, Promise<ResolvedTile | null>>();

function wrapX(x: number, z: number): number {
  const n = 2 ** z;
  return ((x % n) + n) % n;
}

function tileKey({ z, x, y }: TileCoords): string {
  return `${z}/${wrapX(x, z)}/${y}`;
}

function parentOf({ z, x, y }: TileCoords): TileCoords {
  return { z: z - 1, x: Math.floor(wrapX(x, z) / 2), y: Math.floor(y / 2) };
}

function tileUrl(template: string, { z, x, y }: TileCoords): string {
  return template.replace('{z}', String(z)).replace('{x}', String(wrapX(x, z))).replace('{y}', String(y));
}

function skipKnownGaps(start: TileCoords): TileCoords {
  let current = start;
  let cursor: TileCoords | null = start;
  while (cursor && cursor.z >= 0) {
    if (unavailable.has(tileKey(cursor))) {
      if (cursor.z === 0) break;
      current = parentOf(cursor);
    }
    if (cursor.z === 0) break;
    cursor = parentOf(cursor);
  }
  return current;
}

function fetchTile(template: string, coords: TileCoords): Promise<ResolvedTile | null> {
  const id = tileKey(coords);
  const existing = pending.get(id);
  if (existing) return existing;

  const task = (async () => {
    const response = await fetch(tileUrl(template, coords));
    if (!response.ok) throw new Error(`Satellite tile failed (${response.status})`);
    const blob = await response.blob();
    if (blob.size === PLACEHOLDER_BYTES && coords.z > 0) {
      unavailable.add(id);
      return null;
    }
    const url = URL.createObjectURL(blob);
    ready.set(id, url);
    return { z: coords.z, x: wrapX(coords.x, coords.z), y: coords.y, url };
  })().finally(() => pending.delete(id));

  pending.set(id, task);
  return task;
}

async function loadImagery(template: string, coords: TileCoords): Promise<ResolvedTile> {
  let current = skipKnownGaps(coords);
  for (;;) {
    const cached = ready.get(tileKey(current));
    if (cached) return { ...current, x: wrapX(current.x, current.z), url: cached };
    const resolved = await fetchTile(template, current);
    if (resolved) return resolved;
    if (current.z === 0) throw new Error('No satellite imagery');
    current = parentOf(current);
  }
}

function placeImage(img: HTMLImageElement, source: ResolvedTile, target: TileCoords): void {
  const scale = 2 ** (target.z - source.z);
  const relX = wrapX(target.x, target.z) - source.x * scale;
  const relY = target.y - source.y * scale;
  img.style.width = `${scale * TILE_SIZE}px`;
  img.style.height = `${scale * TILE_SIZE}px`;
  img.style.left = `${-relX * TILE_SIZE}px`;
  img.style.top = `${-relY * TILE_SIZE}px`;
  img.src = source.url;
}

export function createSatelliteTileLayer(url: string, options: TileLayerOptions): L.TileLayer {
  const Layer = L.TileLayer.extend({
    initialize(layerUrl: string, layerOptions: TileLayerOptions) {
      L.TileLayer.prototype.initialize.call(this, layerUrl, layerOptions);
      this.on('tileunload', (event: { tile: AbortableTile }) => {
        event.tile._abort?.abort();
      });
    },
    createTile(coords: TileCoords, done: (error?: Error, tile?: HTMLElement) => void) {
      const wrap = document.createElement('div');
      wrap.className = 'satellite-fallback-tile';
      const img = document.createElement('img');
      img.alt = '';
      wrap.appendChild(img);

      const controller = new AbortController();
      (wrap as AbortableTile)._abort = controller;
      const target = { z: coords.z, x: coords.x, y: coords.y };

      loadImagery(url, target).then((source) => {
        if (controller.signal.aborted) return;
        img.addEventListener('load', () => {
          if (!controller.signal.aborted) done(undefined, wrap);
        }, { once: true });
        img.addEventListener('error', () => {
          if (!controller.signal.aborted) done(new Error('Failed to load satellite imagery'), wrap);
        }, { once: true });
        placeImage(img, source, target);
      }).catch((error: unknown) => {
        if (controller.signal.aborted) return;
        done(error instanceof Error ? error : new Error('Failed to load satellite imagery'), wrap);
      });

      return wrap;
    }
  });

  return new Layer(url, options) as L.TileLayer;
}
