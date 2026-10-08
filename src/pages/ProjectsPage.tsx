import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { LandPlotIcon, PlusIcon } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { FeaturedPlan } from '../components/projects/FeaturedPlan';
import { NewPlanDialog } from '../components/projects/NewPlanDialog';
import { ProjectCard } from '../components/projects/ProjectCard';
import { TemplateIcon } from '../components/projects/TemplateIcon';
import { UserMenu } from '../components/auth/UserMenu';
import { useProjects } from '../contexts/ProjectsContext';
import { planTemplates } from '../data/templates';
import { currentUser } from '../data/user';
import type { NewPlanInput, Project, TemplateId } from '../types/plan';

export function ProjectsPage() {
  const { projects, createProject, deleteProject, restoreProject } = useProjects();
  const navigate = useNavigate();
  const [dialogTemplate, setDialogTemplate] = useState<TemplateId | null>(null);
  const sorted = useMemo(() => [...projects].sort((a, b) => b.updatedAt - a.updatedAt), [projects]);
  const [featured, ...others] = sorted;

  const handleDelete = (project: Project) => {
    const index = projects.findIndex((p) => p.id === project.id);
    deleteProject(project.id);
    toast(`Deleted “${project.name}”`, {
      action: { label: 'Undo', onClick: () => restoreProject(project, index) }
    });
  };

  const handleCreate = (input: NewPlanInput) => {
    const project = createProject(input);
    setDialogTemplate(null);
    navigate(`/plan/${project.id}`);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-on-ink">
              <LandPlotIcon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-ink">Terreno</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="h-9 w-9" />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Plans</h1>
            <p className="mt-1 text-muted">Lay out events, lots and venues over real satellite maps.</p>
          </div>
          <button
            type="button"
            onClick={() => setDialogTemplate('event')}
            className="inline-flex h-10 w-fit items-center gap-2 whitespace-nowrap rounded-lg bg-ink px-4 text-sm font-medium text-on-ink transition-colors duration-150 hover:bg-ink/90">
            
            <PlusIcon className="h-4 w-4" aria-hidden />
            New plan
          </button>
        </div>

        <div className="mt-8">
          {featured ?
          <FeaturedPlan project={featured} onDelete={() => handleDelete(featured)} /> :

          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
              <h2 className="text-lg font-semibold text-ink">No plans yet</h2>
              <p className="mt-1 text-sm text-muted">Start from a template below to draw your first layout.</p>
            </div>
          }
        </div>

        {others.length > 0 &&
        <section aria-labelledby="other-plans" className="mt-12">
            <h2 id="other-plans" className="text-sm font-semibold text-ink">
              Other plans
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) =>
            <ProjectCard key={p.id} project={p} onDelete={() => handleDelete(p)} />
            )}
            </div>
          </section>
        }

        <section aria-labelledby="start-new" className="mt-12 border-t border-line pt-8">
          <h2 id="start-new" className="text-sm font-semibold text-ink">
            Start a new plan
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {planTemplates.map((t) =>
            <button
              key={t.id}
              type="button"
              onClick={() => setDialogTemplate(t.id)}
              className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-left transition-[border-color] duration-150 hover:border-ink/40">
              
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-subtle">
                  <TemplateIcon id={t.id} className="h-[18px] w-[18px] text-ink" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{t.name}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">{t.description}</span>
                </span>
              </button>
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {dialogTemplate &&
        <NewPlanDialog
          key="new-plan"
          initialTemplate={dialogTemplate}
          onClose={() => setDialogTemplate(null)}
          onCreate={handleCreate} />

        }
      </AnimatePresence>
    </div>);

}