import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { PlanEditor } from '../components/editor/PlanEditor';
import { useProjects } from '../contexts/ProjectsContext';

export function EditorPage() {
  const { projectId } = useParams();
  const { projects } = useProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <main className="grid min-h-[100dvh] w-full place-items-center bg-canvas px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-ink">This plan doesn’t exist</h1>
          <p className="mt-2 text-sm text-muted">It may have been deleted, or the link is incomplete.</p>
          <Link
            to="/"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-on-ink hover:bg-ink/90">
            
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back to plans
          </Link>
        </div>
      </main>);

  }

  return <PlanEditor key={project.id} project={project} />;
}