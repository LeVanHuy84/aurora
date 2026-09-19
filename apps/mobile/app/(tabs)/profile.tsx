import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { useAuth } from '../../src/hooks/use-auth';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Title, Body, Caption } from '../../src/components/ui/Typography';
import { Spacing, BorderRadius } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/splash');
  };

  return (
    <ScreenContainer
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Title level={1}>{t('tabs.me')}</Title>
      </View>

      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.accent, borderColor: colors.cardBorder },
          ]}
        >
          <Title level={2} color="white">
            {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
          </Title>
        </View>

        <Title level={2} align="center" style={styles.userName}>
          {user?.displayName || user?.username}
        </Title>
        <Caption color="muted" align="center" style={styles.userHandle}>
          @{user?.username} • {user?.email}
        </Caption>

        {user?.bio && (
          <Body color="secondary" align="center" style={styles.bio}>
            {user.bio}
          </Body>
        )}
      </Card>

      {/* Logout Action */}
      <View style={styles.actions}>
        <Button
          title={t('auth.logout')}
          variant="secondary"
          size="md"
          leftIcon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />}
          textStyle={{ color: colors.danger }}
          onPress={handleLogout}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  contentContainer: {
    paddingVertical: Spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: Spacing.md,
  },
  userCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    marginBottom: 2,
  },
  userHandle: {
    marginBottom: Spacing.sm,
  },
  bio: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  actions: {
    marginTop: Spacing.lg,
  },
});
