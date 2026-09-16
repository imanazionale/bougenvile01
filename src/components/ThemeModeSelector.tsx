import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/themeContext';

export const ThemeModeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/90 p-0.5 sm:p-1 rounded-xl border border-neutral-200 dark:border-neutral-700/80 shadow-xs">
      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-amber-950 font-bold shadow-xs border border-amber-200/60'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
        }`}
        title="Aktifkan Light Mode (Mode Terang)"
      >
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-neutral-400'}`} />
        <span className="hidden sm:inline">Light</span>
      </button>

      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-neutral-900 text-amber-300 font-bold shadow-xs border border-neutral-700'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
        }`}
        title="Aktifkan Dark Mode (Mode Gelap)"
      >
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-amber-400' : 'text-neutral-400'}`} />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
};
