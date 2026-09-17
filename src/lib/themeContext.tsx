import React, { createContext, useContext, useEffect, useState } from 'react';

export type GlobalTheme = 'light' | 'dark';
export type ThemeMode = 'auto' | 'light' | 'dark';
export type ThemePreference = GlobalTheme; // Backwards compatibility

export interface TimePeriodInfo {
  isDaytime: boolean;
  hour: number;
  periodText: string;
  theme: GlobalTheme;
}

/**
 * Menentukan tema berdasarkan jam lokal:
 * - Pagi sampai Sore (06:00 - 17:59): Light mode (warna terang)
 * - Malam (18:00 - 05:59): Dark mode (warna gelap)
 */
export function getTimePeriodInfo(): TimePeriodInfo {
  const now = new Date();
  const hour = now.getHours();
  // 06:00 - 17:59: Pagi s/d Sore (Terang)
  // 18:00 - 05:59: Malam (Gelap)
  const isDaytime = hour >= 6 && hour < 18;
  return {
    isDaytime,
    hour,
    periodText: isDaytime ? 'Pagi - Sore (06:00 - 18:00)' : 'Malam (18:00 - 06:00)',
    theme: isDaytime ? 'light' : 'dark',
  };
}

interface ThemeContextType {
  theme: GlobalTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  setTheme: (theme: GlobalTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isAuto: boolean;
  timeInfo: TimePeriodInfo;
  themePreference: GlobalTheme;
  setThemePreference: (theme: GlobalTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = 'property_theme_mode';
const STORAGE_KEY = 'property_theme_choice';
const LEGACY_STORAGE_KEY = 'property_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeInfo, setTimeInfo] = useState<TimePeriodInfo>(() => getTimePeriodInfo());

  // Mode: 'auto' (menyesuaikan jam), 'light', atau 'dark'
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
      if (storedMode === 'auto' || storedMode === 'light' || storedMode === 'dark') {
        return storedMode;
      }
      // Check legacy setting if explicitly chosen
      const legacyChoice = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyChoice === 'dark' || legacyChoice === 'light') {
        return legacyChoice;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    // Default: 'auto' (menyesuaikan jam pagi-sore terang, malam gelap)
    return 'auto';
  });

  // Periksa dan perbarui jam lokal secara berkala (setiap 30 detik)
  useEffect(() => {
    const checkTime = () => {
      setTimeInfo(getTimePeriodInfo());
    };
    const timer = setInterval(checkTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Hitung tema aktif: jika mode 'auto', ikuti jam lokal; jika tidak, ikuti mode manual
  const theme: GlobalTheme = mode === 'auto' ? timeInfo.theme : mode;
  const isDark = theme === 'dark';
  const isAuto = mode === 'auto';

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
      if (newMode !== 'auto') {
        localStorage.setItem(STORAGE_KEY, newMode);
        localStorage.setItem(LEGACY_STORAGE_KEY, newMode);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const setTheme = (newTheme: GlobalTheme) => {
    setMode(newTheme);
  };

  const toggleTheme = () => {
    if (mode === 'auto') {
      // If currently auto, switch to manual opposite
      setMode(theme === 'light' ? 'dark' : 'light');
    } else {
      setMode(mode === 'light' ? 'dark' : 'light');
    }
  };

  // Sinkronisasi class 'dark', atribut data-theme, dan colorScheme pada root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    mode,
    setMode,
    setTheme,
    toggleTheme,
    isDark,
    isAuto,
    timeInfo,
    themePreference: theme,
    setThemePreference: setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

