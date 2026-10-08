import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle({ className = '' }: {className?: string;}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`grid place-items-center rounded-lg text-ink transition-colors duration-150 hover:bg-subtle ${className}`}>
      
      {isDark ? <SunIcon className="h-5 w-5" aria-hidden /> : <MoonIcon className="h-5 w-5" aria-hidden />}
    </button>);

}
