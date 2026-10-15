export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'terreno-theme';

export function readTheme(): Theme {
  return 'dark';
}

export function applyTheme(_theme?: Theme): void {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
}

export function saveTheme(_theme: Theme): void {
  // Hardcoded to dark mode
  applyTheme('dark');
}

export function hasSavedTheme(): boolean {
  return true;
}
