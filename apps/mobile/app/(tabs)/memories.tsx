import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Card } from '../../src/components/ui/Card';
import { Title, Body } from '../../src/components/ui/Typography';
import { Spacing } from '../../src/constants/theme';

export default function MemoriesScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();

  return (
    <ScreenContainer
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Title level={1}>{t('tabs.memories')}</Title>
        <Body color="secondary">{t('moments.onThisDay')}</Body>
      </View>

      <Card style={styles.card}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isDark ? '#2C2926' : '#FDF4EB' },
          ]}
        >
          <Ionicons name="calendar-outline" size={32} color={colors.accentDark} />
        </View>
        <Title level={3} align="center" style={styles.cardTitle}>
          Memories & Calendar View
        </Title>
        <Body color="secondary" align="center">
          Monthly Mood Calendar & "On This Day" feature will be available in Task 3.5.
        </Body>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  contentContainer: {
    paddingVertical: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
});
