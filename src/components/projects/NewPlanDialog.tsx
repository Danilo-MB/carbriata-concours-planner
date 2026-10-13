import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlobeIcon, MapPinIcon, XIcon } from 'lucide-react';
import { planTemplates } from '../../data/templates';
import { PlaceSearch } from '../PlaceSearch';
import { TemplateIcon } from './TemplateIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import type { NewPlanInput, PlaceResult, TemplateId } from '../../types/plan';

interface NewPlanDialogProps {
  initialTemplate: TemplateId;
  onClose: () => void;
  onCreate: (input: NewPlanInput) => void;
}

const ease = [0.23, 1, 0.32, 1] as const;

export function NewPlanDialog({ initialTemplate, onClose, onCreate }: NewPlanDialogProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const canCreate = name.trim().length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canCreate) {
      onCreate({
        name,
        template,
        place,
        websiteUrl: websiteUrl.trim() || undefined
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease }}
        onClick={onClose}
        aria-hidden />
      
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-plan-title"
        onSubmit={submit}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease }}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-surface sm:rounded-2xl">
        
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="new-plan-title" className="text-lg font-semibold text-ink">
            {t('newPlan')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cancel')}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink">
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div>
            <label htmlFor="new-plan-name" className="text-sm font-medium text-ink">
              {t('planName')}
            </label>
            <input
              id="new-plan-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('planNamePlaceholder')}
              className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink">{t('planLocation')}</label>
            <p className="mt-0.5 text-xs text-muted">{t('planLocationSubtitle')}</p>
            <div className="mt-2">
              {place ? (
                <div className="flex items-center gap-3 rounded-lg border border-line bg-subtle px-3 py-2.5">
                  <MapPinIcon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{place.label}</span>
                    <span className="block truncate text-xs text-muted">{place.secondary}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPlace(null)}
                    className="text-sm font-medium text-ink underline-offset-2 hover:underline">
                    {t('changeLocation')}
                  </button>
                </div>
              ) : (
                <PlaceSearch
                  inline
                  onPick={setPlace}
                  placeholder={t('planLocationPlaceholder')}
                  label={t('planLocation')}
                />
              )}
            </div>
          </div>

          <div>
            <label htmlFor="new-plan-website" className="text-sm font-medium text-ink">
              {t('eventWebsiteLabel')} <span className="text-xs text-muted font-normal">({t('optional')})</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="new-plan-website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder={t('eventWebsitePlaceholder')}
                className="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
              />
              <GlobeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-ink">{t('whatPlanning')}</legend>
            <div role="radiogroup" className="mt-2 grid gap-2 sm:grid-cols-3">
              {planTemplates.map((tTemplate) => {
                const checked = tTemplate.id === template;
                return (
                  <button
                    key={tTemplate.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setTemplate(tTemplate.id)}
                    className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors duration-150 ${
                      checked ? 'border-ink bg-subtle' : 'border-line hover:border-ink/40'
                    }`}>
                    <TemplateIcon id={tTemplate.id} className="h-5 w-5 text-ink" />
                    <span className="mt-2 text-sm font-semibold text-ink">{tTemplate.name}</span>
                    <span className="mt-1 text-xs leading-relaxed text-muted">{tTemplate.description}</span>
                    <span className="mt-auto flex gap-1 pt-3" aria-hidden="true">
                      {tTemplate.categories.map((c) => (
                        <span key={c.id} className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-medium text-ink hover:bg-subtle">
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={!canCreate}
            className="h-10 rounded-lg bg-ink px-4 text-sm font-medium text-on-ink shadow-sm transition-colors duration-150 hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/30 active:scale-95">
            {t('createPlan')}
          </button>
        </div>
      </motion.form>
    </div>
  );
}