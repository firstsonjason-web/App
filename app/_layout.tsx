import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { DarkModeContext, useDarkModeState } from '@/hooks/useDarkMode';
import { AuthProvider, useAuth } from '@/hooks/useFirebaseAuth';
import { LanguageProvider } from '@/hooks/LanguageContext';

// Configure linking for deeplink handling
export const unstable_settings = {
  initialRouteName: 'landing',
};

// Define linking configuration for profile sharing
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      landing: 'landing',
      login: 'login',
      '(tabs)': {
        screens: {
          index: '',
          profile: 'profile',
          friends: 'friends',
          communities: 'communities',
          activities: 'activities',
          progress: 'progress',
          rankings: 'rankings',
        },
      },
      // Profile sharing deeplink route
      'profile/:userId': 'profile/:userId',
      '+not-found': '*',
    },
  },
};

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="landing" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile/:userId" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const { isDarkMode, toggleDarkMode } = useDarkModeState();

  return (
    <AuthProvider>
      <LanguageProvider>
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
          <AppNavigator />
          <StatusBar style={isDarkMode ? "light" : "auto"} />
        </DarkModeContext.Provider>
      </LanguageProvider>
    </AuthProvider>
  );
}
