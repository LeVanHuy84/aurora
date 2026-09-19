import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Button } from '../ui/Button';
import { Title, Body } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface EmptyTodayStateProps {
  title?: string;
  subtitle?: string;
  actionText?: string;
  onCreatePress?: () => void;
  onResetFilterPress?: () => void;
  resetFilterText?: string;
}

export function EmptyTodayState({
  title,
  subtitle,
  actionText,
  onCreatePress,
  onResetFilterPress,
  resetFilterText,
}: EmptyTodayStateProps) {
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
        {title || t('moments.noMomentsTodayTitle', 'Hôm nay thật yên ả')}
      </Title>

      <Body color="secondary" align="center" style={styles.subtitle}>
        {subtitle || t('moments.noMomentsToday', 'Hôm nay chưa có khoảnh khắc nào. Chụp một bức ảnh, chọn cảm xúc hoặc viết một dòng nhật ký nhé!')}
      </Body>

      <View style={styles.actionGroup}>
        {onResetFilterPress && (
          <Button
            title={resetFilterText || t('moments.showAllMoments', 'Xem tất cả khoảnh khắc')}
            size="md"
            variant="secondary"
            leftIcon={<Ionicons name="globe-outline" size={17} color={colors.textPrimary} />}
            onPress={onResetFilterPress}
            style={styles.actionBtn}
          />
        )}

        {onCreatePress && (
          <Button
            title={actionText || t('moments.shareFirstMomentBtn', 'Lưu khoảnh khắc')}
            size="md"
            variant="primary"
            leftIcon={<Ionicons name="add" size={18} color="#FFFFFF" />}
            onPress={onCreatePress}
            style={styles.actionBtn}
          />
        )}
      </View>
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
  actionGroup: {
    flexDirection: 'column',
    gap: Spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  actionBtn: {
    width: 'auto',
    minWidth: 200,
    paddingHorizontal: Spacing.lg,
  },
});
