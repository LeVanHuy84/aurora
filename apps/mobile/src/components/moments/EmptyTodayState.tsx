import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Button } from '../ui/Button';
import { Title, Body } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface EmptyTodayStateProps {
  onCreatePress?: () => void;
}

export function EmptyTodayState({ onCreatePress }: EmptyTodayStateProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark ? '#2C2926' : '#FDF4EB',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Ionicons name="images-outline" size={36} color={colors.accentDark} />
      </View>

      <Title level={3} align="center" style={styles.title}>
        {t('moments.noMomentsTodayTitle')}
      </Title>

      <Body color="secondary" align="center" style={styles.subtitle}>
        {t('moments.noMomentsToday')}
      </Body>

      {onCreatePress && (
        <Button
          title={t('moments.shareFirstMomentBtn')}
          size="md"
          variant="primary"
          leftIcon={<Ionicons name="add" size={18} color="#FFFFFF" />}
          onPress={onCreatePress}
          style={styles.actionBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    paddingHorizontal: Spacing.md,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    width: 'auto',
    paddingHorizontal: Spacing.xl,
  },
});
