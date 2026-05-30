import React, { useState, useEffect, createContext, useContext } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native'; // Native hook to monitor system changes
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 1. Expand standard React Navigation themes with your custom design tokens
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#eab308',
    background: '#ffffff',
    card: '#ffffff',       
    text: '#18181b',       
    border: '#f4f4f5',
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
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#eab308',
    background: '#09090b',
    card: '#18181b',       
    text: '#f4f4f5',
    border: '#27272a',
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

// 2. Create a small Context bridge to dispatch the manual toggle event
type GlobalThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};
const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');

  // Sync theme changes if the system preference changes at OS level
  useEffect(() => {
    if (systemScheme) setTheme(systemScheme);
  }, [systemScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeNavTheme = theme === 'dark' ? CustomDarkTheme : CustomLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalThemeContext.Provider value={{ theme, toggleTheme }}>
        <ThemeProvider value={activeNavTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          {/* Force status bar elements to dynamically contrast against layout spaces */}
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </GlobalThemeContext.Provider>
    </GestureHandlerRootView>
  );
}

// 3. Simple hook exported from root so child components can pull these custom styles
export function useAppTheme() {
  const context = useContext(GlobalThemeContext);
  const navTheme = useColorScheme() === 'dark' ? CustomDarkTheme : CustomLightTheme; 
  // Pulls contextual color bindings safely from the active React Navigation instance
  const { useTheme } = require('@react-navigation/native');
  const currentNavTheme = useTheme();

  if (!context) {
    throw new Error('useAppTheme must be used under a RootLayout Provider.');
  }

  return {
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    colors: currentNavTheme.colors as typeof CustomLightTheme.colors,
  };
}