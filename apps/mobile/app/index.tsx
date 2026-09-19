import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '../src/components/common/Icon';
import { useAuth } from '../src/hooks/use-auth';
import { useAppTheme } from '../src/hooks/use-theme';
import { Spacing } from '../src/constants/theme';

export default function EntryScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/splash');
      }
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.logoContainer,
          {
            backgroundColor: isDark ? '#2C2926' : '#FDF4EB',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Ionicons name="sparkles" size={36} color={colors.accentDark} />
      </View>
      <ActivityIndicator size="large" color={colors.accentDark} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  spinner: {
    marginTop: Spacing.sm,
  },
});
