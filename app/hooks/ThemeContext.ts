// context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof Colors.light;
}

// Master Color Palettes
export const Colors = {
  light: {
    background: '#ffffff',
    textPrimary: '#18181b',
    textSecondary: '#4b5563',
    textMuted: '#71717a',
    cardBg: '#ffffff',
    cardBorder: '#f4f4f5',
    categoryBg: '#fef08a',
    categoryText: '#854d0e',
    btnBg: '#ffffff',
    btnBorder: '#f4f4f5',
  },
  dark: {
    background: '#09090b',
    textPrimary: '#f4f4f5',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    cardBg: '#18181b',
    cardBorder: '#27272a',
    categoryBg: '#451a03',
    categoryText: '#fef08a',
    btnBg: '#18181b',
    btnBorder: '#27272a',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  // Sync with system theme changes initially
  useEffect(() => {
    if (systemScheme) {
      setTheme(systemScheme);
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    colors: Colors[theme],
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
}

// Custom hook for easy consumption anywhere in your app
export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}