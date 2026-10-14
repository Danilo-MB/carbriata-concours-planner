import type { Project } from '../types/plan';
import { saveProjectsToIdb, loadProjectsFromIdb } from './idbStorage';

const STORAGE_KEY = 'terreno.projects.v1';

export function loadProjects(): Project[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((project) => {
      const item = project as Project;
      return item.basemap === 'satellite' || item.basemap === 'streets' ? item : { ...item, basemap: 'satellite' };
    });
  } catch {
    return null;
  }
}

export { loadProjectsFromIdb };

export function saveProjects(projects: Project[]): void {
  // Always persist full projects with all high-res images into IndexedDB
  saveProjectsToIdb(projects).catch(() => undefined);

  // Also attempt to save to localStorage as immediate synchronous cache
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    try {
      // If quota exceeded due to large base64 photos, store lightweight copy in localStorage
      const lightweight = projects.map((p) => ({
        ...p,
        features: p.features.map((f) => ({
          ...f,
          images: f.images ? f.images.map((img) => (img.startsWith('data:') ? '' : img)).filter(Boolean) : [],
          routeWaypoints: f.routeWaypoints
            ? f.routeWaypoints.map((w) => ({
                ...w,
                image: w.image?.startsWith('data:') ? undefined : w.image,
              }))
            : undefined,
        })),
      }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch {
      // IndexedDB preserves full data
    }
  }
}