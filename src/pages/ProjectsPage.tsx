import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  FootprintsIcon,
  LayersIcon,
  MenuIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
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
import { planTemplates } from '../data/templates';
import type { NewPlanInput, Project, TemplateId } from '../types/plan';

export function ProjectsPage() {
  const { projects, createProject, deleteProject, restoreProject, demoProjectId } = useProjects();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [dialogTemplate, setDialogTemplate] = useState<TemplateId | null>(null);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sorted = useMemo(() => [...projects].sort((a, b) => b.updatedAt - a.updatedAt), [projects]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkCarouselScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkCarouselScroll();
    window.addEventListener('resize', checkCarouselScroll);
    return () => window.removeEventListener('resize', checkCarouselScroll);
  }, [checkCarouselScroll, sorted]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.7, 300);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const navSections = useMemo(
    () => [
      { id: 'inicio', label: t('navHome'), icon: SparklesIcon },
      { id: 'funciones', label: t('navFeatures'), icon: LayersIcon },
      { id: 'recorrido', label: t('navVirtualTour'), icon: FootprintsIcon },
      { id: 'mis-planos', label: t('navMyMaps'), icon: CompassIcon },
      { id: 'plantillas', label: t('navTemplates'), icon: PlusIcon },
    ],
    [t]
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = navSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(navSections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(navSections[i].id);
          return;
        }
      }
      setActiveSection('inicio');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navSections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

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

  const demoId = demoProjectId || 'i6666hqmv8mdpge';

  return (
    <div className="min-h-[100dvh] w-full bg-canvas text-ink">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollToSection('inicio')}
              className="text-left focus:outline-hidden hover:opacity-85 transition-opacity"
              title="MapFlex - Ir al inicio"
            >
              <MapFlexLogo variant="full" size="md" />
            </button>
          </div>

          {/* Center Navigation Links for vertical sections */}
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1 lg:gap-2">
            {navSections.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 lg:text-sm ${
                    isActive
                      ? 'bg-ink/10 text-ink shadow-2xs font-bold'
                      : 'text-muted hover:bg-subtle hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            {/* <ThemeToggle className="h-9 w-9" /> */}
            <UserMenu />

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-ink md:hidden hover:bg-subtle active:scale-95 transition-all"
            >
              {mobileMenuOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="border-t border-line bg-surface/95 backdrop-blur-md md:hidden overflow-hidden"
            >
              <div className="flex flex-col p-3 space-y-1">
                {navSections.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                          : 'text-muted hover:bg-subtle hover:text-ink'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      <main id="mis-planos" className="scroll-mt-16 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
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
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scroll Navigation Buttons for desktop when there are multiple plans */}
            {sorted.length > 3 && (
              <div className="hidden sm:flex items-center gap-1.5 mr-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  disabled={!canScrollLeft}
                  title="Plano anterior"
                  aria-label="Plano anterior"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink shadow-2xs transition-all hover:bg-subtle active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  disabled={!canScrollRight}
                  title="Siguiente plano"
                  aria-label="Siguiente plano"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink shadow-2xs transition-all hover:bg-subtle active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}

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

        {sorted.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-ink">No hay planos aún</h3>
            <p className="mt-1 text-sm text-muted">Comienza con una plantilla para crear tu primer plano interactivo.</p>
          </div>
        ) : (
          <div className="relative mt-8">
            <div
              ref={carouselRef}
              onScroll={checkCarouselScroll}
              className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth items-stretch"
            >
              {sorted.map((p) => (
                <div
                  key={p.id}
                  className="w-full sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] shrink-0 snap-start flex flex-col"
                >
                  <ProjectCard project={p} onDelete={() => setProjectToDelete(p)} />
                </div>
              ))}
            </div>

            {/* Mobile Carousel Navigation Arrows */}
            {sorted.length > 1 && (
              <div className="flex sm:hidden items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  disabled={!canScrollLeft}
                  aria-label="Plano anterior"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface text-ink disabled:opacity-30"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  disabled={!canScrollRight}
                  aria-label="Siguiente plano"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface text-ink disabled:opacity-30"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <section id="plantillas" aria-labelledby="start-new" className="scroll-mt-16 mt-12 border-t border-line pt-8">
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