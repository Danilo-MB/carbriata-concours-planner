import React from 'react';
import { CameraIcon, Code2Icon, LayersIcon, SmartphoneIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function FeatureCards() {
  const { t } = useLanguage();

  const features = [
    {
      icon: LayersIcon,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-500',
      badge: 'GIS & Métrica',
      title: t('feature1Title'),
      desc: t('feature1Desc')
    },
    {
      icon: CameraIcon,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500',
      badge: 'Multimedia',
      title: t('feature2Title'),
      desc: t('feature2Desc')
    },
    {
      icon: Code2Icon,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-500',
      badge: '1-Clic Embed',
      title: t('feature3Title'),
      desc: t('feature3Desc')
    },
    {
      icon: SmartphoneIcon,
      color: 'from-purple-500/20 to-pink-500/10 text-purple-500',
      badge: 'Mobile & GPS',
      title: t('feature4Title'),
      desc: t('feature4Desc')
    }
  ];

  return (
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('featuresTitle')}
          </h2>
          <p className="mt-3 text-base text-muted">
            {t('featuresSubtitle')}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-ink/20 hover:shadow-md">
                <div>
                  <div className={`inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${feature.color} shadow-2xs`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {feature.desc}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-line/60">
                  <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-muted/80">
                    {feature.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
