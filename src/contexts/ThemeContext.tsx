import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { applyTheme, type Theme } from '../theme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    applyTheme('dark');
  }, []);

  const toggleTheme = useCallback(() => {
    // Hardcoded to dark mode for now
    applyTheme('dark');
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
