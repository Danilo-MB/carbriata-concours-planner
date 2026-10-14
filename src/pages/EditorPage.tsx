import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import { PlanEditor } from '../components/editor/PlanEditor';
import { useProjectLoader } from '../hooks/useProjectLoader';

export function EditorPage() {
  const { projectId } = useParams();
  const { project, loading } = useProjectLoader(projectId);

  if (loading) {
    return (
      <main className="grid min-h-[100dvh] w-full place-items-center bg-canvas px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm font-medium text-ink">Cargando editor del plano...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="grid min-h-[100dvh] w-full place-items-center bg-canvas px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-ink">Plano no encontrado</h1>
          <p className="mt-2 text-sm text-muted">Es posible que haya sido eliminado o que el enlace esté incompleto.</p>
          <Link
            to="/"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-on-ink hover:bg-ink/90">
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Volver a mis planos
          </Link>
        </div>
      </main>
    );
  }

  return <PlanEditor key={project.id} project={project} />;
}