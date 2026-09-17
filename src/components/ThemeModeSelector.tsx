import React from 'react';
import { Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from '../lib/themeContext';

export const ThemeModeSelector: React.FC = () => {
  const { theme, mode, setMode, isAuto, timeInfo } = useTheme();

  return (
    <div
      className="flex items-center bg-neutral-100 dark:bg-neutral-800/90 p-0.5 sm:p-1 rounded-xl border border-neutral-200 dark:border-neutral-700/80 shadow-xs"
      role="group"
      aria-label="Pilihan Mode Tampilan"
    >
      {/* Auto (Menyesuaikan Jam: Pagi-Sore Terang, Malam Gelap) */}
      <button
        type="button"
        onClick={() => setMode('auto')}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          isAuto
            ? theme === 'light'
              ? 'bg-white text-amber-950 font-bold shadow-xs border border-amber-300/80'
              : 'bg-neutral-900 text-amber-300 font-bold shadow-xs border border-amber-500/40'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
        }`}
        title={`Otomatis Sesuai Jam: Pagi-Sore (06:00-18:00) Terang, Malam Gelap. Saat ini: ${timeInfo.periodText} [${theme === 'light' ? 'Terang' : 'Gelap'}]`}
      >
        <Clock
          className={`w-3.5 h-3.5 ${
            isAuto
              ? theme === 'light'
                ? 'text-amber-600'
                : 'text-amber-400'
              : 'text-neutral-400'
          }`}
        />
        <span>Auto</span>
        {isAuto && (
          <span
            className={`text-[9px] px-1 py-0.2 rounded font-medium leading-none hidden lg:inline ${
              theme === 'light'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-neutral-800 text-amber-300'
            }`}
          >
            {timeInfo.isDaytime ? 'Siang' : 'Malam'}
          </span>
        )}
      </button>

      {/* Light Mode Button (Terang) */}
      <button
        type="button"
        onClick={() => setMode('light')}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          mode === 'light'
            ? 'bg-white text-amber-950 font-bold shadow-xs border border-amber-300/80'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
        }`}
        title="Paksa Mode Terang (Light Mode)"
      >
        <Sun className={`w-3.5 h-3.5 ${mode === 'light' ? 'text-amber-500' : 'text-neutral-400'}`} />
        <span className="hidden sm:inline">Terang</span>
      </button>

      {/* Dark Mode Button (Gelap) */}
      <button
        type="button"
        onClick={() => setMode('dark')}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          mode === 'dark'
            ? 'bg-neutral-900 text-amber-300 font-bold shadow-xs border border-neutral-700'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
        }`}
        title="Paksa Mode Gelap (Dark Mode)"
      >
        <Moon className={`w-3.5 h-3.5 ${mode === 'dark' ? 'text-amber-400' : 'text-neutral-400'}`} />
        <span className="hidden sm:inline">Gelap</span>
      </button>
    </div>
  );
};

