import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../src/components/common/Icon';
import { useAuth } from '../src/hooks/use-auth';
import { useAppTheme } from '../src/hooks/use-theme';
import { ScreenContainer } from '../src/components/common/ScreenContainer';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Title, Body, Label } from '../src/components/ui/Typography';
import { Spacing } from '../src/constants/theme';

export default function EntryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { user, isAuthenticated, isInitialized, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/(auth)/splash');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || (isLoading && !user)) {
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
          <Ionicons name="sparkles" size={32} color={colors.accentDark} />
        </View>
        <ActivityIndicator size="large" color={colors.accentDark} style={styles.spinner} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScreenContainer
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      header={
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View>
              <Label color="secondary" style={styles.greetingText}>
                {t('tabs.today')}
              </Label>
              <Title level={2} style={styles.userName}>
                {user?.displayName || user?.username} 👋
              </Title>
            </View>

            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.accent, borderColor: colors.cardBorder },
              ]}
            >
              <Title level={3} color="white">
                {(user?.displayName || user?.username || 'A')[0].toUpperCase()}
              </Title>
            </View>
          </View>
        </View>
      }
      footer={
        <View style={styles.footer}>
          <Button
            title={t('auth.logout')}
            variant="secondary"
            size="md"
            leftIcon={<Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />}
            onPress={async () => {
              await logout();
              router.replace('/(auth)/splash');
            }}
          />
        </View>
      }
    >
      <View style={styles.content}>
        <Card style={styles.welcomeCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color={colors.closeFriends} />
            <Title level={3}>{t('auth.authSuccessTitle')}</Title>
          </View>
          <Body color="secondary" style={styles.cardBody}>
            {t('auth.authSuccessDesc', {
              username: user?.username,
              email: user?.email,
            })}
          </Body>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  contentContainer: {
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  spinner: {
    marginTop: Spacing.sm,
  },
  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userName: {
    marginTop: 2,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeCard: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardBody: {
    lineHeight: 21,
  },
  footer: {
    marginBottom: Spacing.md,
  },
});
