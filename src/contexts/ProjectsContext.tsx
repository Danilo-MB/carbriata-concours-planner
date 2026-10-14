import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedProjects } from '../data/seedProjects';
import { defaultMapView, planTemplates } from '../data/templates';
import { createId } from '../utils/id';
import { getFeaturesBounds, getFeaturesGeometricCenter, getOptimalZoomForBounds } from '../utils/geo';
import { loadProjects, loadProjectsFromIdb, saveProjects } from '../utils/storage';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import type { NewPlanInput, Project } from '../types/plan';

interface ProjectsContextValue {
  projects: Project[];
  createProject: (input: NewPlanInput) => Project;
  importProject: (project: Project) => Project;
  updateProject: (id: string, fn: (p: Project) => Project) => void;
  deleteProject: (id: string) => void;
  restoreProject: (project: Project, index: number) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function ensureStreetViewSeed(projs: Project[]): Project[] {
  const carbriataSeed = seedProjects.find((p) => p.id === 'carbriata-2027');
  if (!carbriataSeed) return projs;
  const streetViewRoute = carbriataSeed.features.find((f) => f.id === 'f-recorrido-streetview');

  return projs.map((p) => {
    let current = p;
    if (p.id === 'carbriata-2027' && streetViewRoute) {
      const hasRoute = p.features.some((f) => f.id === 'f-recorrido-streetview');
      if (!hasRoute) {
        current = {
          ...p,
          features: [streetViewRoute, ...p.features],
        };
      }
    }
    // Ensure center is the geometric center of all features if any exist
    if (current.features && current.features.length > 0) {
      const geomCenter = getFeaturesGeometricCenter(current.features);
      const bounds = getFeaturesBounds(current.features);
      if (geomCenter) {
        const optimalZoom = bounds ? getOptimalZoomForBounds(bounds) : current.center.zoom;
        // Check if center is different
        if (
          Math.abs(current.center.lat - geomCenter[0]) > 0.00001 ||
          Math.abs(current.center.lng - geomCenter[1]) > 0.00001
        ) {
          current = {
            ...current,
            center: {
              lat: geomCenter[0],
              lng: geomCenter[1],
              zoom: optimalZoom
            }
          };
        }
      }
    }
    return current;
  });
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() => {
    const loaded = loadProjects();
    const initial = loaded && loaded.length > 0 ? loaded : seedProjects;
    return ensureStreetViewSeed(initial);
  });

  // Restore high-resolution images from IndexedDB
  useEffect(() => {
    loadProjectsFromIdb().then((idbProjects) => {
      if (idbProjects && idbProjects.length > 0) {
        setProjects(() => ensureStreetViewSeed(idbProjects));
      }
    });
  }, []);

  // Sync from cloud when authenticated
  useEffect(() => {
    async function fetchCloudProjects() {
      try {
        const cloudProjects = await api.projects.list();
        if (Array.isArray(cloudProjects) && cloudProjects.length > 0) {
          setProjects((local) => {
            const map = new Map(local.map((p) => [p.id, p]));
            for (const cp of cloudProjects) {
              map.set(cp.id, cp);
            }
            return ensureStreetViewSeed(Array.from(map.values()));
          });
        }
      } catch {
        // Offline or backend initial state, keep local projects
      }
    }
    fetchCloudProjects();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const createProject = useCallback((input: NewPlanInput): Project => {
    const template = planTemplates.find((t) => t.id === input.template) ?? planTemplates[0];
    const now = Date.now();
    const place = input.place;

    // Merge template categories and ensure all feature categories are present
    const categoryMap = new Map<string, import('../types/plan').Category>();
    for (const c of template.categories) {
      categoryMap.set(c.id, { ...c });
    }
    // Also include standard event categories as fallback
    for (const c of planTemplates[0].categories) {
      if (!categoryMap.has(c.id)) {
        categoryMap.set(c.id, { ...c });
      }
    }
    if (input.features) {
      for (const f of input.features) {
        if (!categoryMap.has(f.categoryId)) {
          categoryMap.set(f.categoryId, {
            id: f.categoryId,
            name: f.name,
            color: f.color || '#E8590C',
            icon: 'pin'
          });
        }
      }
    }

    const features = input.features ? [...input.features] : [];
    const geomCenter = getFeaturesGeometricCenter(features);
    const bounds = getFeaturesBounds(features);
    const centerView: MapView = geomCenter && bounds
      ? {
          lat: geomCenter[0],
          lng: geomCenter[1],
          zoom: getOptimalZoomForBounds(bounds)
        }
      : place
      ? { lat: place.lat, lng: place.lng, zoom: 17 }
      : defaultMapView;

    const project: Project = {
      id: createId(),
      name: input.name.trim(),
      description: input.description || '',
      location: place ? [place.label, place.secondary.split(',')[0]].filter(Boolean).join(', ') : 'Buenos Aires, Argentina',
      websiteUrl: input.websiteUrl,
      template: template.id,
      center: centerView,
      basemap: 'satellite',
      categories: Array.from(categoryMap.values()),
      features,
      hiddenCategoryIds: [],
      createdAt: now,
      updatedAt: now
    };

    setProjects((ps) => [project, ...ps]);
    api.projects.create(project).catch(() => undefined);
    return project;
  }, []);

  const importProject = useCallback((project: Project): Project => {
    setProjects((ps) => {
      const existingIdx = ps.findIndex((p) => p.id === project.id);
      if (existingIdx >= 0) {
        const next = [...ps];
        next[existingIdx] = { ...ps[existingIdx], ...project, updatedAt: Date.now() };
        return next;
      }
      return [project, ...ps];
    });
    api.projects.create(project).catch(() => undefined);
    return project;
  }, []);

  const updateProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setProjects((ps) => {
      const next = ps.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...fn(p), updatedAt: Date.now() };
        api.projects.update(id, updated).catch(() => undefined);
        return updated;
      });
      return next;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((ps) => ps.filter((p) => p.id !== id));
    api.projects.delete(id).catch(() => undefined);
  }, []);

  const restoreProject = useCallback((project: Project, index: number) => {
    setProjects((ps) => {
      if (ps.some((p) => p.id === project.id)) return ps;
      const next = [...ps];
      next.splice(Math.min(index, next.length), 0, project);
      api.projects.create(project).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ projects, createProject, importProject, updateProject, deleteProject, restoreProject }),
    [projects, createProject, importProject, updateProject, deleteProject, restoreProject]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error('useProjects must be used within ProjectsProvider');
  return context;
}