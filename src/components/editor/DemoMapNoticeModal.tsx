import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircleIcon, CheckIcon, CompassIcon, FootprintsIcon, SparklesIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useProjects } from '../../contexts/ProjectsContext';
import type { Project } from '../../types/plan';

interface DemoMapNoticeModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function DemoMapNoticeModal({ project, isOpen, onClose }: DemoMapNoticeModalProps) {
  const { projects, demoProjectId, setDemoProjectId } = useProjects();
  const [isChangingDemo, setIsChangingDemo] = useState(false);
  const [selectedNewDemoId, setSelectedNewDemoId] = useState<string>(demoProjectId);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const activeProjects = projects.filter((p) => !p.isDeleted);

  const handleSaveNewDemo = async () => {
    if (selectedNewDemoId === demoProjectId) {
      setIsChangingDemo(false);
      return;
    }
    setIsSaving(true);
    try {
      await setDemoProjectId(selectedNewDemoId);
      const chosen = projects.find((p) => p.id === selectedNewDemoId);
      toast.success(`“${chosen?.name || 'Mapa seleccionado'}” es ahora el nuevo mapa de la demo.`);
      setIsChangingDemo(false);
      onClose();
    } catch {
      toast.error('Error al actualizar el mapa de la demo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/30 bg-surface p-6 shadow-float"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
              <SparklesIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <FootprintsIcon className="h-3 w-3" />
                <span>Demo Pública MapFlex</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-ink">
                Este mapa es el de la demo
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink active:scale-95 transition-all"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted">
          <p>
            Estás editando <strong className="text-ink">“{project.name}”</strong>, que está asignado como el mapa principal de la demo pública en la página de inicio (botón <em>Probar demo de Recorrido Virtual</em>).
          </p>
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-amber-700 dark:text-amber-300">
            <AlertCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Cualquier cambio, nuevo trazado o foto que guardes aquí se reflejará directamente en la experiencia de los visitantes que prueben la plataforma.
            </span>
          </div>
        </div>

        {/* Selector to change demo project (Admin only) */}
        {isChangingDemo ? (
          <div className="mt-5 rounded-xl border border-line bg-subtle/50 p-4">
            <label className="block text-xs font-semibold text-ink">
              Seleccionar otro mapa para la demo pública:
            </label>
            <select
              value={selectedNewDemoId}
              onChange={(e) => setSelectedNewDemoId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink shadow-2xs focus:border-ink focus:outline-hidden"
            >
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location || 'Sin ubicación'}) {p.id === demoProjectId ? '★ (Demo actual)' : ''}
                </option>
              ))}
            </select>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsChangingDemo(false)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-subtle transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNewDemo}
                disabled={isSaving || selectedNewDemoId === demoProjectId}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black shadow-sm hover:bg-amber-400 active:scale-95 disabled:opacity-40 transition-all"
              >
                <CheckIcon className="h-3.5 w-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Asignar como nueva demo'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setIsChangingDemo(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline transition-all"
            >
              <CompassIcon className="h-3.5 w-3.5" />
              <span>Cambiar mapa de la demo...</span>
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-ink px-4 text-xs font-semibold text-on-ink shadow-sm hover:bg-ink/90 active:scale-95 transition-all"
          >
            Continuar editando
          </button>
        </div>
      </motion.div>
    </div>
  );
}
