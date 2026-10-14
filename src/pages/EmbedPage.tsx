import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { PlanEditor } from '../components/editor/PlanEditor';
import { useProjectLoader } from '../hooks/useProjectLoader';

export function EmbedPage() {
  const { projectId } = useParams();
  const { project, loading } = useProjectLoader(projectId);

  if (loading) {
    return (
      <main className="grid min-h-[100dvh] w-full place-items-center bg-canvas px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Loader2Icon className="h-6 w-6 animate-spin text-accent" />
          <p className="text-xs text-muted">Cargando mapa embebido...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="grid min-h-[100dvh] w-full place-items-center bg-canvas px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-base font-semibold text-ink">Plano no encontrado</h1>
          <p className="mt-1 text-xs text-muted">El plano no existe o el enlace iFrame está incompleto.</p>
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
