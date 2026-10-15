import React from 'react';
import { ArrowRightIcon, FootprintsIcon, LayersIcon, MapPinIcon, PlusIcon, SparklesIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LandingHeroProps {
  onCreateClick: () => void;
  onAiClick?: () => void;
  demoProjectId?: string;
}

export function LandingHero({ onCreateClick, onAiClick }: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <section id="inicio" className="scroll-mt-16 relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-emerald-500/15 blur-3xl" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Top Value Pill */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-ink shadow-2xs backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-700 dark:text-amber-400 font-bold">{t('heroTopBadgeTitle')}</span>
            <span className="text-muted/60">·</span>
            <span className="text-muted flex items-center gap-1">
              <FootprintsIcon className="h-3.5 w-3.5 text-amber-500" />
              {t('heroTopBadgeSub')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl sm:leading-[1.15]">
            {t('heroTitlePart1')}{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 bg-clip-text text-transparent">
              {t('heroTitlePart2')}
            </span>{' '}
            {t('heroTitlePart3')}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {t('heroDesc')}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {onAiClick && (
              <button
                type="button"
                onClick={onAiClick}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 p-[1.5px] shadow-md transition-all hover:scale-[1.02] active:scale-95">
                <span className="flex h-full w-full items-center gap-2 rounded-[10px] bg-surface px-5 text-sm font-bold text-ink">
                  <SparklesIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  <span>{t('aiWizardButton')}</span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onCreateClick}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-on-ink shadow-md transition-all hover:bg-ink/90 active:scale-95">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              <span>{t('heroCtaPrimary')}</span>
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative mt-12 sm:mt-16">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
            <img
              src="/images/hero-map-showcase.jpg"
              alt="MapFlex - Plataforma de trazado satelital interactivo"
              className="aspect-[16/9] w-full object-cover"
              loading="eager"
            />

            {/* Floating Interactive Glassmorphism Badges */}
            <div className="pointer-events-none absolute top-3 left-3 hidden sm:flex items-center gap-2 rounded-xl border border-amber-400/40 bg-black/85 px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md">
              <FootprintsIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span>{t('heroBadgeStreetView')}</span>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 hidden sm:flex items-center gap-2 rounded-xl border border-white/20 bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('heroBadgeSatellite')}</span>
            </div>

            <div className="pointer-events-none absolute top-3 right-3 hidden sm:flex items-center gap-2 rounded-xl border border-white/20 bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
              <LayersIcon className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              <span>{t('heroBadgeMetrics')}</span>
            </div>

            <div className="pointer-events-none absolute bottom-3 right-3 hidden sm:flex items-center gap-2 rounded-xl border border-white/20 bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
              <MapPinIcon className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
              <span>{t('heroBadgeMobile')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
