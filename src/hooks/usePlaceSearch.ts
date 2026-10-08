import { useEffect, useState } from 'react';
import type { PlaceResult } from '../types/plan';

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
}

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export function usePlaceSearch(query: string): {status: SearchStatus;results: PlaceResult[];} {
  const [state, setState] = useState<{status: SearchStatus;results: PlaceResult[];}>({
    status: 'idle',
    results: []
  });

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setState({ status: 'idle', results: [] });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ status: 'loading', results: s.results }));
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=es,en&q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Search failed');
        const data = (await res.json()) as NominatimPlace[];
        setState({ status: 'success', results: data.map(toPlace) });
      } catch {
        if (!controller.signal.aborted) setState({ status: 'error', results: [] });
      }
    }, 400);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return state;
}

function toPlace(place: NominatimPlace): PlaceResult {
  const [label, ...rest] = place.display_name.split(',').map((s) => s.trim());
  const bb = place.boundingbox?.map(Number);
  return {
    id: String(place.place_id),
    label,
    secondary: rest.join(', '),
    lat: Number(place.lat),
    lng: Number(place.lon),
    bounds: bb && bb.every((n) => Number.isFinite(n)) ? [[bb[0], bb[2]], [bb[1], bb[3]]] : undefined
  };
}