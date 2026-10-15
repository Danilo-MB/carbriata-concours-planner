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
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Headline, Description & CTAs */}
          <div className="flex flex-col items-start text-left lg:col-span-7">
            {/* Headline */}
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[38px] xl:text-[42px] leading-tight sm:leading-[1.18]">
              {t('heroTitlePart1')}{' '}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 bg-clip-text text-transparent">
                {t('heroTitlePart2')}
              </span>{' '}
              {t('heroTitlePart3')}
            </h1>

            {/* Subtitle */}
            <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {t('heroDesc')}
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {onAiClick && (
                <button
                  type="button"
                  onClick={onAiClick}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 p-[1.5px] shadow-md transition-all hover:scale-[1.02] active:scale-95">
                  <span className="flex h-full w-full items-center gap-2 rounded-[10px] bg-surface px-4 text-xs sm:text-sm font-bold text-ink">
                    <SparklesIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
                    <span>{t('aiWizardButton')}</span>
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onCreateClick}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-xs sm:text-sm font-semibold text-on-ink shadow-md transition-all hover:bg-ink/90 active:scale-95">
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                <span>{t('heroCtaPrimary')}</span>
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right Column: Pill Badge & Hero Visual Graphic */}
          <div className="flex flex-col items-start lg:col-span-5 mt-4 lg:mt-0">
            {/* Top Value Pill aligned with headline */}
            <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-ink shadow-2xs backdrop-blur-sm self-start">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-700 dark:text-amber-400 font-bold">{t('heroTopBadgeTitle')}</span>
              <span className="text-muted/60">·</span>
              <span className="text-muted flex items-center gap-1">
                <FootprintsIcon className="h-3.5 w-3.5 text-amber-500" />
                {t('heroTopBadgeSub')}
              </span>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
              <img
                src="/images/hero-map-showcase.jpg"
                alt="MapFlex - Plataforma de trazado satelital interactivo"
                className="aspect-[4/3] sm:aspect-[16/10] w-full object-cover block"
                loading="eager"
              />

              {/* 4 Feature Badges placed outside and beneath the image */}
              <div className="border-t border-line/70 bg-surface/90 p-2.5 sm:p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-black/80 px-2.5 py-2 text-[11px] sm:text-xs font-bold text-amber-300 shadow-md backdrop-blur-md">
                    <FootprintsIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
                    <span className="leading-tight">{t('heroBadgeStreetView')}</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-black/80 px-2.5 py-2 text-[11px] sm:text-xs font-bold text-amber-300 shadow-md backdrop-blur-md">
                    <LayersIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
                    <span className="leading-tight">{t('heroBadgeMetrics')}</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-black/80 px-2.5 py-2 text-[11px] sm:text-xs font-bold text-amber-300 shadow-md backdrop-blur-md">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="leading-tight">{t('heroBadgeSatellite')}</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-black/80 px-2.5 py-2 text-[11px] sm:text-xs font-bold text-amber-300 shadow-md backdrop-blur-md">
                    <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
                    <span className="leading-tight">{t('heroBadgeMobile')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
