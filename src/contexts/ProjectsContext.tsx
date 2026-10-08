import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedProjects } from '../data/seedProjects';
import { defaultMapView, planTemplates } from '../data/templates';
import { createId } from '../utils/id';
import { loadProjects, saveProjects } from '../utils/storage';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import type { NewPlanInput, Project } from '../types/plan';

interface ProjectsContextValue {
  projects: Project[];
  createProject: (input: NewPlanInput) => Project;
  updateProject: (id: string, fn: (p: Project) => Project) => void;
  deleteProject: (id: string) => void;
  restoreProject: (project: Project, index: number) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() => loadProjects() ?? seedProjects);

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
            return Array.from(map.values());
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
    const project: Project = {
      id: createId(),
      name: input.name.trim(),
      description: '',
      location: place ? [place.label, place.secondary.split(',')[0]].filter(Boolean).join(', ') : 'Buenos Aires, Argentina',
      template: template.id,
      center: place ? { lat: place.lat, lng: place.lng, zoom: 17 } : defaultMapView,
      basemap: 'satellite',
      categories: template.categories.map((c) => ({ ...c })),
      features: [],
      hiddenCategoryIds: [],
      createdAt: now,
      updatedAt: now
    };

    setProjects((ps) => [project, ...ps]);
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
    () => ({ projects, createProject, updateProject, deleteProject, restoreProject }),
    [projects, createProject, updateProject, deleteProject, restoreProject]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error('useProjects must be used within ProjectsProvider');
  return context;
}