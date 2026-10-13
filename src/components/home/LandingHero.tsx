import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CompassIcon, LayersIcon, MapPinIcon, PlusIcon, SparklesIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LandingHeroProps {
  onCreateClick: () => void;
  demoProjectId?: string;
}

export function LandingHero({ onCreateClick, demoProjectId = 'carbriata-2027' }: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-emerald-500/15 blur-3xl" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-2xs backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            <span>{t('heroBadge')}</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 max-w-4xl text-3xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl sm:leading-[1.15]">
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
            <button
              type="button"
              onClick={onCreateClick}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-on-ink shadow-md transition-all hover:bg-ink/90 active:scale-95">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              <span>{t('heroCtaPrimary')}</span>
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            <Link
              to={`/view/${demoProjectId}`}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-surface px-6 text-sm font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle active:scale-95">
              <CompassIcon className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{t('heroCtaSecondary')}</span>
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative mt-12 sm:mt-16">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
            <img
              src="/images/hero-map-showcase.jpg"
              alt="TuMapa - Plataforma de trazado satelital interactivo"
              className="aspect-[16/9] w-full object-cover"
              loading="eager"
            />

            {/* Floating Interactive Glassmorphism Badges */}
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
