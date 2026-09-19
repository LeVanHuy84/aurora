import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Visibility } from '@aurora/types';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Caption } from '../ui/Typography';
import { BorderRadius } from '../../constants/theme';

export interface MomentVisibilityBadgeProps {
  visibility: Visibility;
}

export function MomentVisibilityBadge({ visibility }: MomentVisibilityBadgeProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const getConfig = () => {
    switch (visibility) {
      case Visibility.CLOSE_FRIENDS:
        return {
          label: t('moments.closeFriends', 'Bạn thân'),
          icon: 'star' as const,
          iconColor: '#38A169',
          textColor: isDark ? '#68D391' : '#276749',
          bgColor: isDark ? 'rgba(56, 161, 105, 0.2)' : '#E6F4EA',
          borderColor: isDark ? '#2F855A' : '#C6F6D5',
        };
      case Visibility.ONLY_ME:
        return {
          label: t('moments.onlyMe', 'Chỉ mình tôi'),
          icon: 'lock-closed' as const,
          iconColor: isDark ? '#A0AEC0' : '#718096',
          textColor: isDark ? '#CBD5E0' : '#4A5568',
          bgColor: isDark ? 'rgba(160, 174, 192, 0.15)' : '#EDF2F7',
          borderColor: isDark ? '#4A5568' : '#E2E8F0',
        };
      case Visibility.FRIENDS:
      default:
        return {
          label: t('moments.friends', 'Bạn bè'),
          icon: 'people' as const,
          iconColor: colors.accentDark,
          textColor: colors.accentDark,
          bgColor: isDark ? 'rgba(231, 111, 81, 0.15)' : '#FDF4EB',
          borderColor: colors.cardBorder,
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <Ionicons name={config.icon} size={11} color={config.iconColor} />
      <Caption
        weight="semibold"
        style={[styles.label, { color: config.textColor }]}
      >
        {config.label}
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  label: {
    fontSize: 11.5,
    lineHeight: 14,
  },
});
