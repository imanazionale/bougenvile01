import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Clock, Check, Sparkles } from 'lucide-react';
import { useTheme, ThemePreference } from '../lib/themeContext';

export const ThemeModeSelector: React.FC = () => {
  const {
    themePreference,
    setThemePreference,
    isDark,
    formattedTime,
    timePhase,
    isDaytime,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (pref: ThemePreference) => {
    setThemePreference(pref);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
          isDark
            ? 'bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border-neutral-700 hover:border-neutral-600'
            : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300 hover:border-neutral-400 shadow-xs'
        }`}
        title={`Tema saat ini: ${
          themePreference === 'auto'
            ? `Otomatis (${isDaytime ? 'Pagi-Sore: Terang' : 'Malam: Gelap'})`
            : themePreference === 'light'
            ? 'Terang (Light)'
            : 'Gelap (Dark)'
        }`}
      >
        {/* Dynamic Icon */}
        {themePreference === 'auto' ? (
          <div className="flex items-center gap-1">
            <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            {isDark ? (
              <Moon className="w-3 h-3 text-sky-400 hidden sm:inline" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500 hidden sm:inline" />
            )}
          </div>
        ) : themePreference === 'light' ? (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-sky-400" />
        )}

        {/* Label */}
        <span className="hidden md:inline">
          {themePreference === 'auto' ? (
            <span>
              Auto ({formattedTime} • {isDark ? 'Gelap' : 'Terang'})
            </span>
          ) : themePreference === 'light' ? (
            <span>Terang</span>
          ) : (
            <span>Gelap</span>
          )}
        </span>

        {/* Mobile short label */}
        <span className="inline md:hidden text-[11px]">
          {isDark ? '🌙' : '☀️'} {formattedTime}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 border ${
            isDark
              ? 'bg-[#181A20] border-neutral-700 text-neutral-200'
              : 'bg-white border-neutral-200 text-neutral-800 shadow-neutral-300/40'
          }`}
        >
          {/* Header Info Banner */}
          <div
            className={`p-3 rounded-xl mb-2 text-xs border ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
                : 'bg-amber-50/80 border-amber-200/80 text-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pengaturan Tampilan Jam</span>
              </span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                {formattedTime} WIB
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isDaytime ? (
                <span>
                  ☀️ Saat ini fase <strong>{timePhase.toUpperCase()}</strong> (06:00 – 18:00).
                  Warna otomatis <strong>Terang</strong> untuk kenyamanan membaca di siang hari.
                </span>
              ) : (
                <span>
                  🌙 Saat ini fase <strong>MALAM</strong> (18:00 – 06:00).
                  Warna otomatis <strong>Gelap</strong> agar ramah dan teduh di mata.
                </span>
              )}
            </p>
          </div>

          {/* Option 1: Auto (Berdasarkan Jam) */}
          <button
            type="button"
            onClick={() => handleSelect('auto')}
            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition cursor-pointer mb-1 ${
              themePreference === 'auto'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100/70 text-amber-900 border border-amber-300'
                : isDark
                ? 'hover:bg-neutral-800/80 text-neutral-300'
                : 'hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                themePreference === 'auto'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : isDark
                  ? 'bg-neutral-800 text-amber-400'
                  : 'bg-neutral-200 text-amber-600'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Otomatis Sesuai Jam (Rekomendasi)</span>
                {themePreference === 'auto' && (
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                Pagi–Sore (06:00–18:00) Terang • Malam (18:00–06:00) Gelap
              </p>
            </div>
          </button>

          {/* Option 2: Always Light (Terang) */}
          <button
            type="button"
            onClick={() => handleSelect('light')}
            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition cursor-pointer mb-1 ${
              themePreference === 'light'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100/70 text-amber-900 border border-amber-300'
                : isDark
                ? 'hover:bg-neutral-800/80 text-neutral-300'
                : 'hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                themePreference === 'light'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : isDark
                  ? 'bg-neutral-800 text-amber-400'
                  : 'bg-neutral-200 text-amber-600'
              }`}
            >
              <Sun className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Selalu Terang (Light Mode)</span>
                {themePreference === 'light' && (
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                Latar cerah bersih & kontras tinggi setiap saat
              </p>
            </div>
          </button>

          {/* Option 3: Always Dark (Gelap) */}
          <button
            type="button"
            onClick={() => handleSelect('dark')}
            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
              themePreference === 'dark'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100/70 text-amber-900 border border-amber-300'
                : isDark
                ? 'hover:bg-neutral-800/80 text-neutral-300'
                : 'hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                themePreference === 'dark'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : isDark
                  ? 'bg-neutral-800 text-sky-400'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              <Moon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Selalu Gelap (Dark Mode)</span>
                {themePreference === 'dark' && (
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                Latar gelap elegan & ramah mata tanpa menyilaukan
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
