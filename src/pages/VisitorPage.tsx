import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import { PlanEditor } from '../components/editor/PlanEditor';
import { useLanguage } from '../contexts/LanguageContext';
import { useProjectLoader } from '../hooks/useProjectLoader';

export function VisitorPage() {
  const { projectId } = useParams();
  const { project, loading } = useProjectLoader(projectId);
  const { t } = useLanguage();

  if (loading) {
    return (
      <main className="grid min-h-[100dvh] w-full place-items-center bg-canvas px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm font-medium text-ink">Cargando plano interactivo...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="grid min-h-[100dvh] w-full place-items-center bg-canvas px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-ink">Plano no encontrado</h1>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            No se encontró el plano <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs">{projectId}</code> en este dispositivo ni en el servidor.
          </p>

          <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-left text-xs text-muted shadow-xs">
            <p className="font-semibold text-ink mb-1.5">¿Cómo abrir el plano?</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Pídele al organizador que abra el menú <strong>Compartir</strong> y copie el enlace actualizado para celulares.</li>
              <li>El nuevo enlace contiene los datos del plano directamente y abre al instante en cualquier teléfono sin necesidad de registrarse.</li>
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-on-ink hover:bg-ink/90">
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              {t('backToPlans')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <PlanEditor
      key={`visitor-${project.id}`}
      project={project}
      initialMode="visitor"
      isVisitorOnly={true}
    />
  );
}
