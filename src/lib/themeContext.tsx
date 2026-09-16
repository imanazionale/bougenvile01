import React, { createContext, useContext, useEffect, useState } from 'react';

export type GlobalTheme = 'light' | 'dark';
export type ThemePreference = GlobalTheme; // Backwards compatibility

interface ThemeContextType {
  theme: GlobalTheme;
  setTheme: (theme: GlobalTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  themePreference: GlobalTheme;
  setThemePreference: (theme: GlobalTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'property_theme_choice';
const LEGACY_STORAGE_KEY = 'property_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read stored preference, defaulting to 'light' (Light Mode)
  const [theme, setThemeState] = useState<GlobalTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored === 'dark') {
        return 'dark';
      }
      if (stored === 'light') {
        return 'light';
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'light'; // Default theme: Light Mode
  });

  const isDark = theme === 'dark';

  const setTheme = (newTheme: GlobalTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      localStorage.setItem(LEGACY_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Synchronize 'dark' class, data-theme attribute, and colorScheme on HTML document root
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
    setTheme,
    toggleTheme,
    isDark,
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
