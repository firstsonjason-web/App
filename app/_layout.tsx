import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { DarkModeContext, useDarkModeState } from '@/hooks/useDarkMode';

export default function RootLayout() {
  useFrameworkReady();
  const { isDarkMode, toggleDarkMode } = useDarkModeState();


  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDarkMode ? "light" : "auto"} />
    </DarkModeContext.Provider>
  );
}
