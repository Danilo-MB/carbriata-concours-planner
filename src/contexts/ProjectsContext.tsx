import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedProjects } from '../data/seedProjects';
import { defaultMapView, planTemplates } from '../data/templates';
import { createId } from '../utils/id';
import { loadProjects, saveProjects } from '../utils/storage';
import type { NewPlanInput, Project } from '../types/plan';

interface ProjectsContextValue {
  projects: Project[];
  createProject: (input: NewPlanInput) => Project;
  updateProject: (id: string, fn: (p: Project) => Project) => void;
  deleteProject: (id: string) => void;
  restoreProject: (project: Project, index: number) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: {children: React.ReactNode;}) {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects() ?? seedProjects);

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
    return project;
  }, []);

  const updateProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setProjects((ps) => ps.map((p) => p.id === id ? { ...fn(p), updatedAt: Date.now() } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((ps) => ps.filter((p) => p.id !== id));
  }, []);

  const restoreProject = useCallback((project: Project, index: number) => {
    setProjects((ps) => {
      if (ps.some((p) => p.id === project.id)) return ps;
      const next = [...ps];
      next.splice(Math.min(index, next.length), 0, project);
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
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used inside ProjectsProvider');
  return ctx;
}