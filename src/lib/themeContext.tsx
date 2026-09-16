import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type ThemePreference = 'auto' | 'light' | 'dark';
export type TimePhase = 'pagi' | 'siang' | 'sore' | 'malam';

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  isDark: boolean;
  timePhase: TimePhase;
  timePhaseLabel: string;
  formattedTime: string;
  isDaytime: boolean;
  autoModeSummary: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'property_theme_preference';

/**
 * Checks if current time is within Pagi - Sore (06:00 - 18:00)
 * Pagi - Sore: Terang (Light mode)
 * Malam: Gelap (Dark mode)
 */
export function isDaytimeHour(hour: number): boolean {
  return hour >= 6 && hour < 18;
}

export function getTimePhase(hour: number): TimePhase {
  if (hour >= 6 && hour < 11) return 'pagi';
  if (hour >= 11 && hour < 15) return 'siang';
  if (hour >= 15 && hour < 18) return 'sore';
  return 'malam';
}

export function getTimePhaseLabel(phase: TimePhase): string {
  switch (phase) {
    case 'pagi':
      return 'Pagi (06:00 - 11:00)';
    case 'siang':
      return 'Siang (11:00 - 15:00)';
    case 'sore':
      return 'Sore (15:00 - 18:00)';
    case 'malam':
      return 'Malam (18:00 - 06:00)';
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read stored preference or default to 'auto' (Sesuai Jam)
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'auto';
  });

  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Periodically update time every 15 seconds to ensure live auto-switch across hour boundaries
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const formattedTime = useMemo(() => {
    const h = String(hour).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m}`;
  }, [hour, minutes]);

  const isDaytime = isDaytimeHour(hour);
  const timePhase = getTimePhase(hour);
  const timePhaseLabel = getTimePhaseLabel(timePhase);

  // Resolved isDark
  const isDark = useMemo(() => {
    if (themePreference === 'light') return false;
    if (themePreference === 'dark') return true;
    // Auto: Daytime (Pagi - Sore) is Light (isDark = false), Night (Malam) is Dark (isDark = true)
    return !isDaytime;
  }, [themePreference, isDaytime]);

  const autoModeSummary = useMemo(() => {
    if (isDaytime) {
      return `Pagi–Sore (${formattedTime}) → Terang`;
    }
    return `Malam (${formattedTime}) → Gelap`;
  }, [isDaytime, formattedTime]);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // Ignore storage errors
    }
  };

  // Synchronize 'dark' class on HTML document root for CSS & Tailwind
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDark]);

  const value = {
    themePreference,
    setThemePreference,
    isDark,
    timePhase,
    timePhaseLabel,
    formattedTime,
    isDaytime,
    autoModeSummary,
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
