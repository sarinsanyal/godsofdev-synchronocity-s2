import React, { useState, useEffect, createContext, useContext } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider, useTheme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native'; 
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// === CLERK IMPORTS ===
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '../utils/tokenCache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

// 1. Expand standard React Navigation themes
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

// 2. Create Context
type GlobalThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};
const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export const unstable_settings = {
  anchor: '(tabs)',
};

// ==========================================
// INNER LAYOUT: Handles Theme + Auth Routing
// ==========================================
function InnerLayout() {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');

  // --- CLERK ROUTING LOGIC ---
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (isSignedIn && !inTabsGroup) {
      // User is signed in but not in the main app, send them to the feed
      router.replace('/(tabs)');
    } else if (!isSignedIn && inTabsGroup) {
      // User is NOT signed in but trying to access the main app, kick them out
      router.replace('/login');
    }
  }, [isSignedIn, isLoaded, segments]);
  // ---------------------------

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
            {/* Added login to your stack so the router can find it */}
            <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </GlobalThemeContext.Provider>
    </GestureHandlerRootView>
  );
}

// ==========================================
// ROOT LAYOUT: Pure Provider Wrapper
// ==========================================
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <InnerLayout />
    </ClerkProvider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================
export function useAppTheme() {
  const context = useContext(GlobalThemeContext);
  const currentNavTheme = useTheme(); // Cleaner import than inline require

  if (!context) {
    throw new Error('useAppTheme must be used under a RootLayout Provider.');
  }

  return {
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    colors: currentNavTheme.colors as typeof CustomLightTheme.colors,
  };
}