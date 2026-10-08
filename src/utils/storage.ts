import type { Project } from '../types/plan';

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

export function saveProjects(projects: Project[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {

    // Storage may be full or unavailable; the session keeps working in memory.
  }}