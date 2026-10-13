import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2Icon, ExternalLinkIcon, SparklesIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmbedShowcaseProps {
  demoProjectId?: string;
}

export function EmbedShowcase({ demoProjectId = 'carbriata-2027' }: EmbedShowcaseProps) {
  const { t } = useLanguage();

  const benefits = [
    t('embedFeature1'),
    t('embedFeature2'),
    t('embedFeature3')
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

            <div className="mt-8">
              <Link
                to={`/view/${demoProjectId}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-on-ink shadow-sm transition-all hover:bg-ink/90 active:scale-95">
                <span>{t('embedCtaDemo')}</span>
                <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
              <img
                src="/images/embed-mockup.jpg"
                alt="TuMapa - Vista interactiva de visitantes incrustada en sitio web"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
