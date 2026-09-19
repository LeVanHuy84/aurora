import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
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
        {/* Official Aurora Logo Emblem */}
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
            source={require('../../assets/icon.png')}
            style={styles.emblemLogoImage}
            contentFit="cover"
            transition={300}
          />
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
    width: 104,
    height: 104,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  emblemLogoImage: {
    width: '100%',
    height: '100%',
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
