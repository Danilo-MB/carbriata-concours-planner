import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectsContext';
import { decodeProjectFromUrl } from '../utils/shareUrl';
import { api } from '../utils/api';
import type { Project } from '../types/plan';

interface UseProjectLoaderResult {
  project: Project | null;
  loading: boolean;
}

export function useProjectLoader(projectId: string | undefined): UseProjectLoaderResult {
  const location = useLocation();
  const { projects, importProject } = useProjects();
  const [loading, setLoading] = useState(false);
  const [cloudProject, setCloudProject] = useState<Project | null>(null);

  // 1. Check local projects
  const localProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    // Already available locally
    if (localProject) return;

    // 2. Check URL payload (#p= or ?p=)
    const urlToCheck = window.location.href;
    const decoded = decodeProjectFromUrl(urlToCheck);
    if (decoded) {
      if (!projectId || decoded.id === projectId || projectId === 'shared') {
        importProject(decoded);
        setCloudProject(decoded);
        return;
      }
    }

    // 3. Fallback: fetch from cloud API
    if (projectId) {
      let isMounted = true;
      setLoading(true);

      api.projects
        .get(projectId)
        .then((remoteProj) => {
          if (isMounted && remoteProj && remoteProj.id) {
            importProject(remoteProj);
            setCloudProject(remoteProj);
          }
        })
        .catch(() => {
          // Cloud fetch failed or 404
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [projectId, localProject, location, importProject]);

  const activeProject = localProject || cloudProject;

  return {
    project: activeProject,
    loading: !activeProject && loading
  };
}
