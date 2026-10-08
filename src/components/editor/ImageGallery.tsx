import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  LinkIcon,
  Maximize2Icon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  XIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { isValidImageUrl, processImageFiles } from '../../utils/imageUpload';

interface ImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  elementName: string;
}

export function ImageGallery({ images, onChange, elementName }: ImageGalleryProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    try {
      const compressedUrls = await processImageFiles(files);
      if (compressedUrls.length > 0) {
        onChange([...images, ...compressedUrls]);
        toast.success(
          compressedUrls.length === 1
            ? 'Imagen adjuntada correctamente'
            : `${compressedUrls.length} imágenes adjuntadas`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar las imágenes');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    if (!isValidImageUrl(trimmed)) {
      toast.error('Enlace de imagen inválido', {
        description: 'Debe comenzar con http:// o https://'
      });
      return;
    }
    onChange([...images, trimmed]);
    setUrlValue('');
    setShowUrlInput(false);
    toast.success('Imagen adjuntada por URL');
  };

  const handleDeleteImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (lightboxIndex !== null) {
      if (updated.length === 0) {
        setLightboxIndex(null);
      } else if (lightboxIndex >= updated.length) {
        setLightboxIndex(updated.length - 1);
      }
    }
    toast.success('Imagen eliminada');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="mt-6 border-t border-line pt-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-ink" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-ink">Imágenes adjuntas</h4>
          {images.length > 0 && (
            <span className="rounded-full bg-subtle px-2 py-0.5 text-xs font-semibold tabular-nums text-muted">
              {images.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            title="Subir fotos desde tu computadora o celular"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors duration-150 hover:bg-subtle hover:border-ink/40">
            <UploadIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Subir</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput((v) => !v)}
            title="Añadir imagen mediante enlace URL"
            className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors duration-150 ${
              showUrlInput
                ? 'border-ink bg-ink text-on-ink'
                : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
            }`}>
            <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* URL Input Bar */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddUrl}
            className="mt-3 flex gap-2 overflow-hidden">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              autoFocus
              className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-xs text-ink placeholder:text-muted focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              disabled={!urlValue.trim()}
              className="h-9 whitespace-nowrap rounded-lg bg-ink px-3 text-xs font-semibold text-on-ink transition-opacity disabled:opacity-40">
              Añadir
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Drag & drop upload area / Gallery */}
      {images.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors duration-150 ${
            isDraggingOver
              ? 'border-accent bg-accent/5 text-ink'
              : 'border-line hover:border-ink/40 hover:bg-subtle/50 text-muted'
          }`}>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-subtle text-muted">
            <UploadIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xs font-medium text-ink">
            {isProcessing ? 'Procesando fotos...' : 'Haz clic o arrastra fotos aquí'}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">PNG, JPG, WEBP soportados</p>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`mt-3 grid grid-cols-3 gap-2 rounded-xl p-1 transition-colors ${
            isDraggingOver ? 'bg-accent/10 ring-2 ring-accent' : ''
          }`}>
          {images.map((src, idx) => (
            <div
              key={`${src.slice(0, 32)}-${idx}`}
              onClick={() => setLightboxIndex(idx)}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-line bg-surface shadow-xs transition-transform hover:scale-[1.02]">
              <img
                src={src}
                alt={`${elementName} foto ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />

              {/* Hover actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-150 group-hover:opacity-100">
                <button
                  type="button"
                  title="Ver en pantalla completa"
                  className="grid h-7 w-7 place-items-center rounded-full bg-surface text-ink shadow-sm hover:scale-110">
                  <Maximize2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="Eliminar imagen"
                  onClick={(e) => handleDeleteImage(idx, e)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700 hover:scale-110">
                  <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}

          {/* Quick upload cell */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Subir más imágenes"
            className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-line text-muted transition-colors hover:border-ink hover:bg-subtle hover:text-ink">
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            <span className="mt-1 text-[10px] font-medium">Añadir</span>
          </button>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[92vh] max-w-[92vw] flex-col items-center justify-center">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Cerrar imagen"
                className="absolute -top-11 right-0 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur-xs transition-colors hover:bg-white/20">
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Title & Counter */}
              <div className="absolute -top-10 left-0 flex items-center gap-2 text-white">
                <span className="font-semibold text-sm">{elementName}</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {lightboxIndex + 1} / {images.length}
                </span>
              </div>

              {/* Image */}
              <img
                src={images[lightboxIndex]}
                alt={`${elementName} vista completa`}
                className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
                    }}
                    aria-label="Imagen anterior"
                    className="absolute -left-12 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-xs transition-colors hover:bg-white/25">
                    <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
                    }}
                    aria-label="Siguiente imagen"
                    className="absolute -right-12 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-xs transition-colors hover:bg-white/25">
                    <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
