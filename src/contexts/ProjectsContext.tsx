import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedProjects } from '../data/seedProjects';
import { defaultMapView, planTemplates } from '../data/templates';
import { createId } from '../utils/id';
import { getFeaturesBounds, getFeaturesGeometricCenter, getOptimalZoomForBounds } from '../utils/geo';
import { loadProjects, loadProjectsFromIdb, saveProjects } from '../utils/storage';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { isUnlimitedUser } from '../utils/plan';
import type { NewPlanInput, Project, MapView } from '../types/plan';

export const DEFAULT_DEMO_PROJECT_ID = 'i6666hqmv8mdpge';

interface ProjectsContextValue {
  projects: Project[];
  createProject: (input: NewPlanInput) => Project;
  importProject: (project: Project) => Project;
  updateProject: (id: string, fn: (p: Project) => Project) => void;
  deleteProject: (id: string) => void;
  restoreProject: (project: Project, index: number) => void;
  saveLocalToCloud: (id: string) => Promise<void>;
  demoProjectId: string;
  setDemoProjectId: (id: string) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function ensureStreetViewSeed(projs: Project[]): Project[] {
  return projs.map((p) => {
    let current = p;
    const seedProj = seedProjects.find((s) => s.id === p.id);
    if (seedProj) {
      // Merge all features from seed: update existing and add missing ones
      const existingFeatureMap = new Map(current.features.map((f) => [f.id, f]));
      
      const mergedFeatures = seedProj.features.map((sf) => {
        const existing = existingFeatureMap.get(sf.id);
        if (!existing) return sf;

        // If it's Barrio Carlina, industrial project, or Carbriata, always ensure the curated waypoints and images
        if (p.id === 'ijdhormmv8a4760' || p.id === 'i6666hqmv8mdpge' || p.id === 'w3xini1mv8zaemz') {
          return {
            ...existing,
            name: sf.name || existing.name,
            notes: sf.notes || existing.notes,
            images: sf.images && sf.images.length > 0 ? sf.images : existing.images,
            routeWaypoints: sf.routeWaypoints && sf.routeWaypoints.length > 0 ? sf.routeWaypoints : existing.routeWaypoints
          };
        }

        return {
          ...existing,
          routeWaypoints: sf.routeWaypoints && sf.routeWaypoints.length > 0 && (!existing.routeWaypoints || existing.routeWaypoints.length === 0)
            ? sf.routeWaypoints
            : existing.routeWaypoints,
          images: sf.images && sf.images.length > 0 && (!existing.images || existing.images.length === 0)
            ? sf.images
            : existing.images,
          notes: sf.notes && (!existing.notes || existing.notes.trim() === '')
            ? sf.notes
            : existing.notes
        };
      });

      // Keep any user-added custom features that weren't in seed
      const seedFeatureIds = new Set(seedProj.features.map((sf) => sf.id));
      const extraFeatures = current.features.filter((f) => !seedFeatureIds.has(f.id));

      current = {
        ...current,
        features: [...mergedFeatures, ...extraFeatures]
      };

      if (p.id === 'carbriata-2027') {
        const streetViewRoute = seedProj.features.find((f) => f.id === 'f-recorrido-streetview');
        if (streetViewRoute && !current.features.some((f) => f.id === 'f-recorrido-streetview')) {
          current = {
            ...current,
            features: [streetViewRoute, ...current.features],
          };
        }
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
  const [demoProjectId, setDemoProjectIdState] = useState<string>(() => {
    try {
      return localStorage.getItem('mapflex_demo_project_id') || DEFAULT_DEMO_PROJECT_ID;
    } catch {
      return DEFAULT_DEMO_PROJECT_ID;
    }
  });

  // Fetch configured demoProjectId from server
  useEffect(() => {
    api.projects.getDemoProject()
      .then((res) => {
        if (res?.demoProjectId) {
          setDemoProjectIdState(res.demoProjectId);
          try {
            localStorage.setItem('mapflex_demo_project_id', res.demoProjectId);
          } catch {}
        }
      })
      .catch(() => undefined);
  }, []);

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

    const isUnlimited = isUnlimitedUser(user);
    const userCloudProjects = projects.filter(
      (p) => !p.isDeleted && !p.isLocalOnly && (p.userId === user?.id || (user?.email && p.authorEmail?.toLowerCase() === user.email.toLowerCase()))
    );
    const exceedsCloudLimit = Boolean(isAuthenticated && !isUnlimited && userCloudProjects.length >= 1);
    const isLocalOnly = !isAuthenticated || exceedsCloudLimit;

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
      userId: isAuthenticated ? user?.id : undefined,
      authorEmail: isAuthenticated ? user?.email : undefined,
      authorName: isAuthenticated ? user?.name : undefined,
      isLocalOnly,
      createdAt: now,
      updatedAt: now
    };

    setProjects((ps) => [project, ...ps]);

    if (exceedsCloudLimit) {
      toast.warning('Límite de planos en la nube alcanzado (máx. 1)', {
        description: 'Has alcanzado el límite de 1 plano en la nube. Este nuevo plano se guardará únicamente de forma local en tu navegador.',
        duration: 6500
      });
    } else if (isAuthenticated) {
      api.projects.create(project).catch(() => undefined);
    }

    return project;
  }, [isAuthenticated, user, projects]);

  const importProject = useCallback((project: Project): Project => {
    const isUnlimited = isUnlimitedUser(user);
    const userCloudProjects = projects.filter(
      (p) => !p.isDeleted && !p.isLocalOnly && (p.userId === user?.id || (user?.email && p.authorEmail?.toLowerCase() === user.email.toLowerCase()))
    );
    const exceedsCloudLimit = Boolean(isAuthenticated && !isUnlimited && userCloudProjects.length >= 1);
    const finalProject: Project = {
      ...project,
      isLocalOnly: !isAuthenticated || exceedsCloudLimit || Boolean(project.isLocalOnly)
    };

    setProjects((ps) => {
      const existingIdx = ps.findIndex((p) => p.id === finalProject.id);
      if (existingIdx >= 0) {
        const next = [...ps];
        next[existingIdx] = { ...ps[existingIdx], ...finalProject, updatedAt: Date.now() };
        return next;
      }
      return [finalProject, ...ps];
    });

    if (exceedsCloudLimit) {
      toast.warning('Límite de planos en la nube alcanzado (máx. 1)', {
        description: 'Has alcanzado el límite de 1 plano en la nube. Este plano importado funcionará solo de forma local.',
        duration: 6500
      });
    } else if (isAuthenticated && !finalProject.isLocalOnly) {
      api.projects.create(finalProject).catch(() => undefined);
    }

    return finalProject;
  }, [isAuthenticated, user, projects]);

  const updateProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setProjects((ps) => {
      const next = ps.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...fn(p), updatedAt: Date.now() };
        // Only sync to cloud if user is logged in and it's not a local-only guest draft
        if (isAuthenticated && !p.isLocalOnly) {
          api.projects.update(id, updated).catch(() => undefined);
        }
        return updated;
      });
      return next;
    });
  }, [isAuthenticated]);

  const deleteProject = useCallback((id: string) => {
    setProjects((ps) => {
      const target = ps.find((p) => p.id === id);
      if (target && !target.isLocalOnly && isAuthenticated) {
        api.projects.delete(id).catch(() => undefined);
      }
      return ps.filter((p) => p.id !== id);
    });
  }, [isAuthenticated]);

  const restoreProject = useCallback((project: Project, index: number) => {
    setProjects((ps) => {
      if (ps.some((p) => p.id === project.id)) return ps;
      const isUnlimited = isUnlimitedUser(user);
      const userCloudProjects = ps.filter(
        (p) => !p.isDeleted && !p.isLocalOnly && (p.userId === user?.id || (user?.email && p.authorEmail?.toLowerCase() === user.email.toLowerCase()))
      );
      const exceedsCloudLimit = Boolean(isAuthenticated && !isUnlimited && userCloudProjects.length >= 1);

      const restoredProject: Project = {
        ...project,
        isDeleted: false,
        isLocalOnly: Boolean(project.isLocalOnly) || exceedsCloudLimit
      };

      const next = [...ps];
      next.splice(Math.min(index, next.length), 0, restoredProject);

      if (exceedsCloudLimit && !project.isLocalOnly) {
        toast.warning('Restaurado como copia local (máx. 1 en la nube)', {
          description: 'Ya tienes 1 plano activo en la nube. Este plano se ha restaurado de forma local en tu navegador.',
          duration: 6500
        });
      } else if (isAuthenticated && !restoredProject.isLocalOnly) {
        api.projects.restore(restoredProject.id).catch(() => api.projects.create(restoredProject).catch(() => undefined));
      }

      return next;
    });
  }, [isAuthenticated, user]);

  const saveLocalToCloud = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Inicia sesión para guardar tu plano en la nube.');
      return;
    }
    const isUnlimited = isUnlimitedUser(user);
    const userCloudProjects = projects.filter(
      (p) => !p.isDeleted && !p.isLocalOnly && p.id !== id && (p.userId === user.id || (user.email && p.authorEmail?.toLowerCase() === user.email.toLowerCase()))
    );

    if (!isUnlimited && userCloudProjects.length >= 1) {
      toast.warning('Límite de planos en la nube alcanzado (máx. 1)', {
        description: 'Ya tienes 1 plano guardado en la nube. Este plano permanecerá guardado únicamente de forma local en tu navegador.',
        duration: 6500
      });
      return;
    }

    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    const cloudVersion: Project = {
      ...proj,
      userId: user.id,
      authorEmail: user.email,
      authorName: user.name,
      isLocalOnly: false,
      updatedAt: Date.now()
    };
    try {
      await api.projects.create(cloudVersion);
      setProjects((ps) => ps.map((p) => (p.id === id ? cloudVersion : p)));
      toast.success('¡Plano guardado y sincronizado en la nube!');
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar en la nube.');
    }
  }, [isAuthenticated, user, projects]);

  const setDemoProjectId = useCallback(async (newId: string) => {
    setDemoProjectIdState(newId);
    try {
      localStorage.setItem('mapflex_demo_project_id', newId);
    } catch {}

    try {
      await api.projects.setDemoProject(newId);
    } catch (err: any) {
      console.warn('Could not persist demoProjectId to server:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      projects,
      createProject,
      importProject,
      updateProject,
      deleteProject,
      restoreProject,
      saveLocalToCloud,
      demoProjectId,
      setDemoProjectId
    }),
    [projects, createProject, importProject, updateProject, deleteProject, restoreProject, saveLocalToCloud, demoProjectId, setDemoProjectId]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error('useProjects must be used within ProjectsProvider');
  return context;
}