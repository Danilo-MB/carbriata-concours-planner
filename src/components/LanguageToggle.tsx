import React from 'react';
import { LanguagesIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      className={`flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle active:scale-95 ${className}`}>
      <LanguagesIcon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
      <span className="uppercase tracking-wider">{language}</span>
    </button>
  );
}
