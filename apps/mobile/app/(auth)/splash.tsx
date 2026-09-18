import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Button } from '../../src/components/ui/Button';
import { Title, Subtitle, Body, Caption } from '../../src/components/ui/Typography';
import { Spacing, BorderRadius } from '../../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();

  return (
    <ScreenContainer
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.topSection}>
        {/* Warm Organic Decorative Sun / Aurora Emblem */}
        <View
          style={[
            styles.emblemContainer,
            {
              backgroundColor: isDark ? '#2C2926' : '#FDF4EB',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.emblemInner,
              {
                backgroundColor: colors.accent,
              },
            ]}
          >
            <Ionicons name="sparkles" size={40} color="#FFFFFF" />
          </View>
        </View>

        <Title level={1} style={styles.appName}>
          {t('common.appName')}
        </Title>

        <Subtitle color="accent" weight="semibold" style={styles.tagline}>
          {t('common.tagline')}
        </Subtitle>

        <Body color="secondary" align="center" style={styles.subtitle}>
          {t('auth.welcomeSubtitle')}
        </Body>

        {/* Feature Highlights */}
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightItem}>
            <View style={[styles.bulletIcon, { backgroundColor: colors.surfaceSoft }]}>
              <Ionicons name="camera-outline" size={18} color={colors.accentDark} />
            </View>
            <Body weight="medium" style={styles.highlightText}>
              {t('auth.highlights.polaroidMoments')}
            </Body>
          </View>

          <View style={styles.highlightItem}>
            <View style={[styles.bulletIcon, { backgroundColor: colors.surfaceSoft }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.closeFriends} />
            </View>
            <Body weight="medium" style={styles.highlightText}>
              {t('auth.highlights.privateSharing')}
            </Body>
          </View>

          <View style={styles.highlightItem}>
            <View style={[styles.bulletIcon, { backgroundColor: colors.surfaceSoft }]}>
              <Ionicons name="happy-outline" size={18} color={colors.accent} />
            </View>
            <Body weight="medium" style={styles.highlightText}>
              {t('auth.highlights.moodTracking')}
            </Body>
          </View>
        </View>
      </View>

      {/* Bottom Action Area */}
      <View style={styles.bottomSection}>
        <Button
          title={t('auth.getStarted')}
          size="lg"
          variant="primary"
          onPress={() => router.push('/(auth)/register')}
          style={styles.primaryBtn}
        />

        <Button
          title={t('auth.login')}
          size="md"
          variant="secondary"
          onPress={() => router.push('/(auth)/login')}
        />

        <Caption align="center" style={styles.termsText}>
          {t('auth.termsNotice')}
        </Caption>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  contentContainer: {
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  emblemContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emblemInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  tagline: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  highlightsContainer: {
    width: '100%',
    paddingHorizontal: Spacing.xs,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm + 4,
  },
  bulletIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  highlightText: {
    flex: 1,
  },
  bottomSection: {
    width: '100%',
    paddingBottom: Spacing.sm,
  },
  primaryBtn: {
    marginBottom: Spacing.sm + 2,
  },
  termsText: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
});
