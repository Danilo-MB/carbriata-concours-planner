import React from 'react';
import { useParams } from 'react-router-dom';
import { PlanEditor } from '../components/editor/PlanEditor';
import { useProjects } from '../contexts/ProjectsContext';
import { useLanguage } from '../contexts/LanguageContext';

export function EmbedPage() {
  const { projectId } = useParams();
  const { projects } = useProjects();
  const { t } = useLanguage();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <main className="grid min-h-[100dvh] w-full place-items-center bg-canvas px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-base font-semibold text-ink">Plano no encontrado</h1>
          <p className="mt-1 text-xs text-muted">El plano no existe o fue eliminado.</p>
        </div>
      </main>
    );
  }

  return (
    <PlanEditor
      key={`embed-${project.id}`}
      project={project}
      initialMode="visitor"
      isEmbed={true}
    />
  );
}
