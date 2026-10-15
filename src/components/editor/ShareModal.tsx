import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, Code2Icon, CopyIcon, ExternalLinkIcon, Link2Icon, SmartphoneIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { getShareUrls } from '../../utils/shareUrl';
import { api } from '../../utils/api';
import type { Project } from '../../types/plan';

interface ShareModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ project, isOpen, onClose }: ShareModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedHeight, setEmbedHeight] = useState('600');
  const [useShortLink, setUseShortLink] = useState(true);
  const syncedRef = useRef<string | null>(null);

  // Sync to cloud backend once when opened
  useEffect(() => {
    if (isOpen && project && syncedRef.current !== project.id) {
      syncedRef.current = project.id;
      api.projects.create(project).catch(() => undefined);
    }
  }, [isOpen, project]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mapflex.app';
  const { visitorUrl, embedUrl, bareVisitorUrl } = useMemo(() => getShareUrls(project, origin), [project, origin]);

  const currentVisitorUrl = useShortLink ? bareVisitorUrl : visitorUrl;
  const currentEmbedUrl = embedUrl;
  const iframeSnippet = `<iframe src="${currentEmbedUrl}" width="100%" height="${embedHeight}" style="border:0; border-radius:12px; overflow:hidden;" allowfullscreen loading="lazy" title="${project.name}"></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentVisitorUrl);
      setCopiedLink(true);
      toast.success(t('linkCopied'));
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopiedEmbed(true);
      toast.success(t('embedCopied'));
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="min-w-0 pr-2">
                <h2 className="truncate text-base font-semibold text-ink sm:text-lg">
                  {t('shareTitle')}
                </h2>
                <p className="truncate text-xs text-muted">{project.name}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                aria-label={t('cancel')}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink cursor-pointer"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Tab switchers */}
            <div className="border-b border-line bg-subtle/50 px-5 pt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className={`flex items-center gap-2 border-b-2 px-3 pb-2.5 text-xs font-semibold transition-colors ${
                    activeTab === 'link'
                      ? 'border-ink text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <Link2Icon className="h-4 w-4" aria-hidden="true" />
                  {t('tabVisitorLink')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('embed')}
                  className={`flex items-center gap-2 border-b-2 px-3 pb-2.5 text-xs font-semibold transition-colors ${
                    activeTab === 'embed'
                      ? 'border-ink text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <Code2Icon className="h-4 w-4" aria-hidden="true" />
                  {t('tabEmbedCode')}
                </button>
              </div>
            </div>

            {/* Content body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
              {activeTab === 'link' ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted leading-relaxed">
                    {t('visitorLinkDesc')}
                  </p>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-ink flex items-center gap-1.5">
                        <SmartphoneIcon className="h-3.5 w-3.5 text-accent" />
                        <span>Enlace público para celulares y visitantes</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseShortLink(!useShortLink)}
                        className="text-[11px] text-muted hover:text-ink underline cursor-pointer"
                      >
                        {useShortLink ? 'Usar enlace portable (offline)' : 'Usar enlace corto (recomendado)'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentVisitorUrl}
                        onFocus={(e) => e.target.select()}
                        className="h-10 flex-1 rounded-lg border border-line bg-subtle px-3 font-mono text-xs text-ink focus:border-ink focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-ink px-4 text-xs font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink/90 active:scale-95 cursor-pointer"
                      >
                        {copiedLink ? (
                          <>
                            <CheckIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <CopyIcon className="h-4 w-4" aria-hidden="true" />
                            {t('copyLink')}
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted">
                      {useShortLink
                        ? '✓ Enlace corto y limpio para WhatsApp, redes y celulares.'
                        : '⚠ Enlace portable con todos los datos comprimidos en la URL.'}
                    </p>
                  </div>

                  <div className="pt-1">
                    <a
                      href={currentVisitorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                    >
                      <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('openInNewTab')}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted leading-relaxed">
                    {t('embedDesc')}
                  </p>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-ink">
                        Código HTML iFrame
                      </label>
                      <div className="flex items-center gap-1 text-[11px] text-muted">
                        <span>Alto:</span>
                        <select
                          value={embedHeight}
                          onChange={(e) => setEmbedHeight(e.target.value)}
                          className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-ink focus:outline-none cursor-pointer"
                        >
                          <option value="450">450 px</option>
                          <option value="600">600 px</option>
                          <option value="750">750 px</option>
                          <option value="100%">100%</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      readOnly
                      rows={3}
                      value={iframeSnippet}
                      onFocus={(e) => e.target.select()}
                      className="w-full rounded-lg border border-line bg-subtle p-2.5 font-mono text-xs text-ink focus:border-ink focus:outline-none"
                    />

                    <div className="mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleCopyEmbed}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 text-xs font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink/90 active:scale-95 cursor-pointer"
                      >
                        {copiedEmbed ? (
                          <>
                            <CheckIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <CopyIcon className="h-4 w-4" aria-hidden="true" />
                            {t('copyEmbed')}
                          </>
                        )}
                      </button>

                      <a
                        href={embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Probar vista embebida
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-line bg-subtle/30 px-5 py-3">
              <span className="text-xs text-muted hidden sm:inline">
                {t('pressEscToClose')}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="h-9 rounded-lg border border-line bg-surface px-3 text-xs font-medium text-muted transition-colors hover:bg-subtle hover:text-ink cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-ink px-4 text-xs font-semibold text-on-ink shadow-sm transition-all hover:bg-ink/90 active:scale-95 cursor-pointer"
                >
                  {t('closeAndReturnToMap')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
