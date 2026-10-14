import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2Icon, ExternalLinkIcon, FootprintsIcon, SparklesIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmbedShowcaseProps {
  demoProjectId?: string;
}

export function EmbedShowcase({ demoProjectId = 'carbriata-2027' }: EmbedShowcaseProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'streetview' | 'map'>('streetview');

  const benefits = [
    t('embedFeature1'),
    t('embedFeature2'),
    t('embedFeature3'),
    t('embedFeature4')
  ];

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 bg-surface/50 border-y border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left Column: Text & Benefits */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-accent shadow-2xs">
              <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('embedShowcaseBadge')}</span>
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-4xl">
              {t('embedShowcaseTitle')}
            </h2>

            <p className="mt-4 text-base leading-relaxed text-muted">
              {t('embedShowcaseSubtitle')}
            </p>

            <ul className="mt-6 space-y-3">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-ink">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={`/view/${demoProjectId}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-on-ink shadow-sm transition-all hover:bg-ink/90 active:scale-95">
                <FootprintsIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span>{t('embedCtaDemo')}</span>
                <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Mockup with Interactive Mode Toggle */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-line bg-subtle/60 px-4 py-2.5">
                <span className="text-xs font-semibold text-muted">Vista previa interactiva</span>
                <div className="flex rounded-lg border border-line bg-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('streetview')}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      activeTab === 'streetview'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-2xs'
                        : 'text-muted hover:text-ink'
                    }`}>
                    <FootprintsIcon className="h-3.5 w-3.5" />
                    <span>Street View 360</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('map')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      activeTab === 'map'
                        ? 'bg-ink text-on-ink font-semibold shadow-2xs'
                        : 'text-muted hover:text-ink'
                    }`}>
                    🛰️ Mapa Satelital
                  </button>
                </div>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
                {activeTab === 'map' ? (
                  <img
                    src="/images/embed-mockup.jpg"
                    alt="TuMapa - Vista interactiva de visitantes incrustada en sitio web"
                    className="h-full w-full object-cover transition-opacity duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <img
                      src="/streetview/point2_promenade.jpg"
                      alt="TuMapa - Paseo Street View virtual a nivel de suelo"
                      className="h-full w-full object-cover transition-opacity duration-300"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />

                    {/* Top overlay badge */}
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm">
                      <FootprintsIcon className="h-3.5 w-3.5 text-amber-400" />
                      <span>Paseo Central Arbolado · Punto 2 de 5</span>
                    </div>

                    {/* Bottom overlay info bar */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="rounded-lg bg-black/70 px-2.5 py-1 font-mono text-[11px] backdrop-blur-md">
                        🧭 Rumbo: 215° SO
                      </span>
                      <span className="rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-black shadow-sm">
                        Foto a nivel de suelo
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
