import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  CarIcon,
  CheckCircle2Icon,
  LayersIcon,
  MapPinIcon,
  MusicIcon,
  RotateCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StoreIcon,
  UsersIcon,
  UtensilsIcon,
  XIcon
} from 'lucide-react';
import { PlaceSearch } from '../PlaceSearch';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateAiPlan, type AiPlanResult } from '../../services/aiPlannerService';
import type { NewPlanInput, PlaceResult, TemplateId } from '../../types/plan';

interface AiWizardModalProps {
  onClose: () => void;
  onCreate: (input: NewPlanInput) => void;
}

const ease = [0.23, 1, 0.32, 1] as const;

export function AiWizardModal({ onClose, onCreate }: AiWizardModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [template, setTemplate] = useState<TemplateId>('event');

  const [attendees, setAttendees] = useState(5000);
  const [booths, setBooths] = useState(25);

  const [hasParking, setHasParking] = useState(true);
  const [hasFood, setHasFood] = useState(true);
  const [hasStage, setHasStage] = useState(true);
  const [hasVip, setHasVip] = useState(true);
  const [hasSafety, setHasSafety] = useState(true);

  const [customPrompt, setCustomPrompt] = useState('');

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStepIndex, setGenStepIndex] = useState(0);
  const [result, setResult] = useState<AiPlanResult | null>(null);

  const stepsLabels = [
    t('aiScanningTerrain'),
    t('aiQueryingOsm'),
    t('aiCalculatingSafety'),
    t('aiDrawingPolygons')
  ];

  const handleStartGeneration = async () => {
    if (!place) return;
    setStep(3);
    setIsGenerating(true);
    setGenStepIndex(0);

    // Simulate animated step progression
    const timer1 = setTimeout(() => setGenStepIndex(1), 900);
    const timer2 = setTimeout(() => setGenStepIndex(2), 1900);
    const timer3 = setTimeout(() => setGenStepIndex(3), 2900);

    try {
      const planRes = await generateAiPlan({
        name: name.trim() || place.label,
        place,
        template,
        attendees,
        booths,
        hasParking,
        hasFood,
        hasStage,
        hasVip,
        hasSafety,
        customPrompt: customPrompt.trim() || undefined
      });

      setTimeout(() => {
        setResult(planRes);
        setIsGenerating(false);
      }, 3400);
    } catch {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
    if (!place || !result) return;
    onCreate({
      name: name.trim() || `${place.label} — Plan Inteligente`,
      template,
      place,
      description: result.summary,
      features: result.features
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease }}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-surface sm:rounded-2xl border border-line shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-2xs">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">
                {t('aiWizardTitle')}
              </h2>
              <p className="text-xs text-muted">
                {step === 1 && t('aiStep1Title')}
                {step === 2 && t('aiStep2Title')}
                {step === 3 && t('aiStep3Title')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink">
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: Venue & Template */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5">
                <div>
                  <label htmlFor="ai-plan-name" className="text-sm font-semibold text-ink">
                    {t('planName')}
                  </label>
                  <input
                    id="ai-plan-name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ej. Festival de Primavera 2027 o Feria de Autos"
                    className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-ink">
                    {t('planLocation')}
                  </label>
                  <p className="mt-0.5 text-xs text-muted">
                    {t('planLocationSubtitle')}
                  </p>
                  <div className="mt-2">
                    {place ? (
                      <div className="flex items-center gap-3 rounded-xl border border-line bg-subtle px-3.5 py-3">
                        <MapPinIcon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{place.label}</span>
                          <span className="block truncate text-xs text-muted">{place.secondary}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setPlace(null)}
                          className="text-xs font-semibold text-ink underline-offset-2 hover:underline">
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
                  <label className="text-sm font-semibold text-ink">
                    Tipo de evento / predio
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { id: 'event', label: 'Festival / Evento', icon: MusicIcon },
                      { id: 'realEstate', label: 'Inmobiliario', icon: LayersIcon },
                      { id: 'logistics', label: 'Logística / Docks', icon: CarIcon },
                      { id: 'industrial', label: 'Planta Industrial', icon: StoreIcon }
                    ].map((item) => {
                      const Icon = item.icon;
                      const selected = template === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTemplate(item.id as TemplateId)}
                          className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors ${
                            selected ? 'border-ink bg-subtle text-ink font-semibold' : 'border-line text-muted hover:border-ink/40'
                          }`}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Capacities & Needs */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <UsersIcon className="h-4 w-4 text-accent" />
                      <span>{t('aiExpectedCrowd')}</span>
                    </label>
                    <span className="text-sm font-bold text-ink">
                      {attendees.toLocaleString()} personas
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="30000"
                    step="200"
                    value={attendees}
                    onChange={(e) => setAttendees(Number(e.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-subtle accent-ink"
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-muted">
                    <span>500</span>
                    <span>2.500</span>
                    <span>5.000</span>
                    <span>15.000</span>
                    <span>30.000+</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <StoreIcon className="h-4 w-4 text-amber-500" />
                      <span>{t('aiBoothsCount')}</span>
                    </label>
                    <span className="text-sm font-bold text-ink">
                      {booths} stands
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="5"
                    value={booths}
                    onChange={(e) => setBooths(Number(e.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-subtle accent-ink"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-ink">
                    Zonas clave a generar en el terreno
                  </label>
                  <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      { state: hasParking, set: setHasParking, label: t('aiZoneParking'), icon: CarIcon },
                      { state: hasFood, set: setHasFood, label: t('aiZoneFood'), icon: UtensilsIcon },
                      { state: hasStage, set: setHasStage, label: t('aiZoneStage'), icon: MusicIcon },
                      { state: hasVip, set: setHasVip, label: t('aiZoneVip'), icon: SparklesIcon },
                      { state: hasSafety, set: setHasSafety, label: t('aiZoneSafety'), icon: ShieldCheckIcon }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors ${
                            item.state ? 'border-ink/80 bg-subtle/80 text-ink' : 'border-line text-muted hover:border-ink/30'
                          }`}>
                          <input
                            type="checkbox"
                            checked={item.state}
                            onChange={(e) => item.set(e.target.checked)}
                            className="rounded border-line text-ink focus:ring-ink"
                          />
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-semibold">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="ai-custom-prompt" className="text-sm font-semibold text-ink">
                    {t('aiCustomPromptLabel')}
                  </label>
                  <textarea
                    id="ai-custom-prompt"
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={t('aiCustomPromptPlaceholder')}
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: Radar Scanning & AI Result */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    {/* Radar Pulse Effect */}
                    <div className="relative flex items-center justify-center">
                      <div className="h-24 w-24 rounded-full bg-amber-500/10 animate-ping absolute" />
                      <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 grid place-items-center shadow-lg text-white">
                        <RotateCwIcon className="h-8 w-8 animate-spin" />
                      </div>
                    </div>

                    <h3 className="mt-6 text-lg font-bold text-ink">
                      Escaneando terreno satelital...
                    </h3>
                    <p className="mt-1 text-xs text-muted max-w-sm">
                      {place?.label}
                    </p>

                    <div className="mt-8 w-full max-w-md space-y-3 text-left">
                      {stepsLabels.map((lbl, idx) => {
                        const isDone = genStepIndex > idx;
                        const isCurrent = genStepIndex === idx;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all ${
                              isDone
                                ? 'border-emerald-500/30 bg-emerald-500/5 text-ink'
                                : isCurrent
                                ? 'border-ink bg-subtle text-ink font-semibold'
                                : 'border-line/40 text-muted/60'
                            }`}>
                            {isDone ? (
                              <CheckCircle2Icon className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <span className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-amber-500 animate-pulse' : 'bg-muted/40'}`} />
                            )}
                            <span className="text-xs">{lbl}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                      <CheckCircle2Icon className="mx-auto h-8 w-8 text-emerald-500" />
                      <h3 className="mt-2 text-base font-bold text-ink">
                        {t('aiSuccessTitle')}
                      </h3>
                      <p className="mt-1 text-xs text-muted">
                        {result.summary}
                      </p>
                    </div>

                    {/* Detected Terrain Callout */}
                    <div className="rounded-xl border border-line bg-subtle p-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                        <MapPinIcon className="h-4 w-4 text-accent" />
                        <span>Diagnóstico del Terreno Satelital:</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {result.detection.summary}
                      </p>
                    </div>

                    {/* Generated Zones List */}
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Zonas calculadas ({result.features.length})
                      </span>
                      <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {result.features.map((feat) => (
                          <div
                            key={feat.id}
                            className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-xs">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: feat.color || '#E8590C' }}
                              />
                              <span className="font-semibold text-ink">{feat.name}</span>
                            </div>
                            <span className="text-[11px] text-muted capitalize">{feat.kind}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-line px-5 py-4">
          {step > 1 && !isGenerating && !result ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="h-10 rounded-xl px-4 text-sm font-semibold text-ink hover:bg-subtle">
              Atrás
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {!result ? (
              step === 1 ? (
                <button
                  type="button"
                  disabled={!place}
                  onClick={() => setStep(2)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-on-ink shadow-sm transition-all hover:bg-ink/90 disabled:opacity-30 disabled:cursor-not-allowed">
                  <span>Siguiente</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : step === 2 ? (
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95">
                  <SparklesIcon className="h-4 w-4" />
                  <span>{t('aiGenerateAction')}</span>
                </button>
              ) : null
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-on-ink shadow-md transition-all hover:bg-ink/90 active:scale-95">
                <span>{t('aiOpenInEditor')}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
