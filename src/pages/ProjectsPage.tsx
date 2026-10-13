import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CompassIcon, LandPlotIcon, PlusIcon, SparklesIcon } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { FeaturedPlan } from '../components/projects/FeaturedPlan';
import { NewPlanDialog } from '../components/projects/NewPlanDialog';
import { ProjectCard } from '../components/projects/ProjectCard';
import { TemplateIcon } from '../components/projects/TemplateIcon';
import { UserMenu } from '../components/auth/UserMenu';
import { LandingHero } from '../components/home/LandingHero';
import { FeatureCards } from '../components/home/FeatureCards';
import { EmbedShowcase } from '../components/home/EmbedShowcase';
import { useProjects } from '../contexts/ProjectsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { planTemplates } from '../data/templates';
import type { NewPlanInput, Project, TemplateId } from '../types/plan';

export function ProjectsPage() {
  const { projects, createProject, deleteProject, restoreProject } = useProjects();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [dialogTemplate, setDialogTemplate] = useState<TemplateId | null>(null);
  const sorted = useMemo(() => [...projects].sort((a, b) => b.updatedAt - a.updatedAt), [projects]);
  const [featured, ...others] = sorted;

  const handleDelete = (project: Project) => {
    const index = projects.findIndex((p) => p.id === project.id);
    deleteProject(project.id);
    toast(`Eliminado “${project.name}”`, {
      action: { label: t('undo'), onClick: () => restoreProject(project, index) }
    });
  };

  const handleCreate = (input: NewPlanInput) => {
    const project = createProject(input);
    setDialogTemplate(null);
    navigate(`/plan/${project.id}`);
  };

  const demoId = featured?.id || 'carbriata-2027';

  return (
    <div className="min-h-[100dvh] w-full bg-canvas text-ink">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-on-ink shadow-2xs">
              <LandPlotIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-ink">{t('brandName')}</span>
                <span className="hidden sm:inline-flex rounded-full border border-line bg-subtle px-2 py-0.5 text-[10px] font-semibold text-muted">
                  Interactive GIS
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle className="h-9 w-9" />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* 1. Marketing Hero at the Top */}
      <LandingHero
        onCreateClick={() => setDialogTemplate('event')}
        demoProjectId={demoId}
      />

      {/* 2. Platform Features Grid */}
      <FeatureCards />

      {/* 3. Embed & Visitor Experience Showcase */}
      <EmbedShowcase demoProjectId={demoId} />

      {/* 4. Plans Workspace Section */}
      <main id="mis-planos" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
              <CompassIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Workspace</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t('myPlans')}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t('brandTagline')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDialogTemplate('event')}
            className="inline-flex h-10 w-fit items-center gap-2 whitespace-nowrap rounded-lg bg-ink px-4 text-sm font-medium text-on-ink shadow-sm transition-colors duration-150 hover:bg-ink/90 active:scale-95">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            {t('newPlan')}
          </button>
        </div>

        <div className="mt-8">
          {featured ? (
            <FeaturedPlan project={featured} onDelete={() => handleDelete(featured)} />
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
              <h3 className="text-lg font-semibold text-ink">No hay planos aún</h3>
              <p className="mt-1 text-sm text-muted">Comienza con una plantilla para crear tu primer plano interactivo.</p>
            </div>
          )}
        </div>

        {others.length > 0 && (
          <section aria-labelledby="other-plans" className="mt-12">
            <h3 id="other-plans" className="text-sm font-semibold text-ink">
              Otros planos
            </h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <ProjectCard key={p.id} project={p} onDelete={() => handleDelete(p)} />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="start-new" className="mt-12 border-t border-line pt-8">
          <h3 id="start-new" className="text-sm font-semibold text-ink">
            {t('whatPlanning')}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {planTemplates.map((tTemplate) => (
              <button
                key={tTemplate.id}
                type="button"
                onClick={() => setDialogTemplate(tTemplate.id)}
                className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-left transition-[border-color] duration-150 hover:border-ink/40 active:scale-[0.99]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-subtle">
                  <TemplateIcon id={tTemplate.id} className="h-[18px] w-[18px] text-ink" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{tTemplate.name}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">{tTemplate.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-xs text-muted sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">{t('brandName')}</span>
            <span>—</span>
            <span>{t('brandTagline')}</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} {t('brandName')}. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {dialogTemplate && (
          <NewPlanDialog
            key="new-plan"
            initialTemplate={dialogTemplate}
            onClose={() => setDialogTemplate(null)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}