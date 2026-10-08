import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, Trash2Icon, XIcon } from 'lucide-react';

interface ClearAllModalProps {
  isOpen: boolean;
  elementCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export function ClearAllModal({
  isOpen,
  elementCount,
  onConfirm,
  onClose
}: ClearAllModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-all-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink">
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <AlertTriangleIcon className="h-6 w-6" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 id="clear-all-title" className="text-base font-semibold text-ink">
                  ¿Borrar todos los elementos del mapa?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Se eliminarán los{' '}
                  <span className="font-semibold text-ink">
                    {elementCount} {elementCount === 1 ? 'elemento' : 'elementos'}
                  </span>{' '}
                  (áreas, caminos, parcelas y marcadores con sus fotos) de este plano.
                </p>
                <p className="mt-1 text-xs text-muted/80">
                  Podrás deshacer esta acción inmediatamente desde el aviso que aparecerá en pantalla.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-xl border border-line px-4 text-sm font-medium text-ink transition-colors hover:bg-subtle">
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 active:bg-red-800">
                <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                Sí, borrar todo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
