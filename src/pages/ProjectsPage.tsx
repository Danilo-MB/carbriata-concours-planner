import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertCircleIcon, CloudIcon, CompassIcon, PlusIcon, SparklesIcon, Trash2Icon } from 'lucide-react';
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
import { AiWizardModal } from '../components/ai/AiWizardModal';
import { MapFlexLogo } from '../components/common/MapFlexLogo';
import { useProjects } from '../contexts/ProjectsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { isUnlimitedUser } from '../utils/plan';
import { planTemplates } from '../data/templates';
import type { NewPlanInput, Project, TemplateId } from '../types/plan';

export function ProjectsPage() {
  const { projects, createProject, deleteProject, restoreProject } = useProjects();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [dialogTemplate, setDialogTemplate] = useState<TemplateId | null>(null);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const sorted = useMemo(() => [...projects].sort((a, b) => b.updatedAt - a.updatedAt), [projects]);
  const [featured, ...others] = sorted;

  const confirmDelete = () => {
    if (!projectToDelete) return;
    const p = projectToDelete;
    const index = projects.findIndex((item) => item.id === p.id);
    deleteProject(p.id);
    setProjectToDelete(null);
    toast(`Plano “${p.name}” movido a la papelera`, {
      action: {
        label: t('undo'),
        onClick: () => restoreProject(p, index)
      }
    });
  };

  const handleCreate = (input: NewPlanInput) => {
    const project = createProject(input);
    setDialogTemplate(null);
    navigate(`/plan/${project.id}`);
  };

  const demoId = featured?.id || 'carbriata-2027';

  const isUnlimited = isUnlimitedUser(user);
  const userCloudCount = projects.filter(
    (p) => !p.isDeleted && !p.isLocalOnly && (p.userId === user?.id || (user?.email && p.authorEmail?.toLowerCase() === user.email.toLowerCase()))
  ).length;

  return (
    <div className="min-h-[100dvh] w-full bg-canvas text-ink">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <MapFlexLogo variant="full" size="md" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            {/* <ThemeToggle className="h-9 w-9" /> */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* 1. Marketing Hero at the Top */}
      <LandingHero
        onCreateClick={() => setDialogTemplate('event')}
        onAiClick={() => setIsAiWizardOpen(true)}
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
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
                <CompassIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Workspace</span>
              </div>
              {user && (
                isUnlimited ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CloudIcon className="h-3 w-3" />
                    <span>Nube Ilimitada</span>
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    userCloudCount >= 1
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'border-line bg-surface text-muted'
                  }`}>
                    <CloudIcon className="h-3 w-3" />
                    <span>{userCloudCount}/1 plano en nube</span>
                  </span>
                )
              )}
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t('myPlans')}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t('brandTagline')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAiWizardOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-2xs transition-all hover:bg-subtle active:scale-95">
              <SparklesIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <span>{t('aiWizardButton')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDialogTemplate('event')}
              className="inline-flex h-10 w-fit items-center gap-2 whitespace-nowrap rounded-lg bg-ink px-4 text-sm font-medium text-on-ink shadow-sm transition-colors duration-150 hover:bg-ink/90 active:scale-95">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              {t('newPlan')}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {featured ? (
            <FeaturedPlan project={featured} onDelete={() => setProjectToDelete(featured)} />
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
                <ProjectCard key={p.id} project={p} onDelete={() => setProjectToDelete(p)} />
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
          <div className="flex items-center gap-3">
            <MapFlexLogo variant="full" size="sm" />
            <span className="hidden sm:inline text-muted/50">|</span>
            <span className="hidden sm:inline">{t('brandTagline')}</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} MapFlex. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isAiWizardOpen && (
          <AiWizardModal
            key="ai-wizard"
            onClose={() => setIsAiWizardOpen(false)}
            onCreate={handleCreate}
          />
        )}
        {dialogTemplate && (
          <NewPlanDialog
            key="new-plan"
            initialTemplate={dialogTemplate}
            onClose={() => setDialogTemplate(null)}
            onCreate={handleCreate}
            onSwitchToAi={() => {
              setDialogTemplate(null);
              setIsAiWizardOpen(true);
            }}
          />
        )}
        {projectToDelete && (
          <div key="delete-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProjectToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-float">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger border border-danger/20">
                  <Trash2Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-ink">
                    ¿Eliminar este plano?
                  </h3>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    ¿Estás seguro de que deseas eliminar <strong className="text-ink">“{projectToDelete.name}”</strong>? 
                    El plano se moverá a la papelera en la base de datos y podrás recuperarlo en cualquier momento.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-subtle active:scale-95">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-danger/90 active:scale-95">
                  <Trash2Icon className="h-3.5 w-3.5" />
                  <span>Eliminar plano</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}