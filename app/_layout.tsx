import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { DarkModeContext, useDarkModeState } from '@/hooks/useDarkMode';
import { AuthProvider, useAuth } from '@/hooks/useFirebaseAuth';
import { LanguageProvider } from '@/hooks/LanguageContext';

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
