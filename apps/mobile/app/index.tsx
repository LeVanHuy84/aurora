import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../src/hooks/use-auth';
import { useAppTheme } from '../src/hooks/use-theme';
import { Title, Subtitle } from '../src/components/ui/Typography';
import { Spacing, BorderRadius } from '../src/constants/theme';

export default function EntryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { isAuthenticated, isInitialized } = useAuth();

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
      {/* App Favicon / Official Emblem */}
      <View
        style={[
          styles.emblemContainer,
          {
            backgroundColor: isDark ? '#25221F' : '#FFFDF9',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.cardBorder,
          },
        ]}
      >
        <Image
          source={require('../assets/icon.png')}
          style={styles.emblemImage}
          contentFit="cover"
          transition={300}
        />
      </View>

      <Title level={2} style={styles.brandTitle}>
        {t('common.appName')}
      </Title>
      <Subtitle color="accent" style={styles.brandTagline}>
        {t('common.tagline')}
      </Subtitle>

      <ActivityIndicator
        size="small"
        color={colors.accentDark}
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emblemContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  emblemImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    marginBottom: Spacing.lg,
  },
  spinner: {
    marginTop: Spacing.sm,
  },
});
