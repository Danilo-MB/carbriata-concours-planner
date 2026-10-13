import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, type Language, type TranslationKey } from '../locales/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'event-planner-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === 'es' || saved === 'en') return saved;
      // Default to Spanish (or browser language)
      if (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) {
        return 'en';
      }
      return 'es';
    } catch {
      return 'es';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage failure
    }
  };

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.es;
    let str: string = (langDict as Record<string, string>)[key] || (translations.es as Record<string, string>)[key] || key;
    if (vars) {
      for (const [varKey, varVal] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varVal));
      }
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
