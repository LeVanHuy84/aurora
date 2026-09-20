import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '../src/services/query-client';
import '../src/i18n';
import { useAppTheme } from '../src/hooks/use-theme';
import { useAuthStore } from '../src/stores/auth.store';
import { usePushNotifications } from '../src/hooks/use-push-notifications';

function AppNavigation() {
  const { colors, isDark } = useAppTheme();
  const initAuth = useAuthStore((state) => state.initAuth);

  // Khởi tạo và lắng nghe Push Notifications
  usePushNotifications();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="inbox" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppNavigation />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
