import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body } from '../ui/Typography';
import { Visibility } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface VisibilitySelectorProps {
  visibility: Visibility;
  onSelectVisibility: (visibility: Visibility) => void;
}

export function VisibilitySelector({
  visibility,
  onSelectVisibility,
}: VisibilitySelectorProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const options: {
    value: Visibility;
    icon: any;
    labelKey: string;
    fallback: string;
    activeColor: string;
    activeBg: string;
  }[] = [
    {
      value: Visibility.CLOSE_FRIENDS,
      icon: 'lock-closed',
      labelKey: 'moments.closeFriends',
      fallback: 'Bạn thân',
      activeColor: colors.closeFriends,
      activeBg: isDark ? '#1C382F' : '#E8F5E9',
    },
    {
      value: Visibility.FRIENDS,
      icon: 'people',
      labelKey: 'moments.friends',
      fallback: 'Bạn bè',
      activeColor: colors.accentDark,
      activeBg: isDark ? '#2C2926' : '#FFF4EB',
    },
    {
      value: Visibility.ONLY_ME,
      icon: 'person',
      labelKey: 'moments.onlyMe',
      fallback: 'Chỉ mình tôi',
      activeColor: colors.textPrimary,
      activeBg: isDark ? '#242220' : '#F5F3EF',
    },
  ];

  return (
    <View style={styles.container}>
      <Body color="secondary" weight="semibold" style={styles.sectionLabel}>
        {t('moments.visibility', 'Ai có thể xem')}
      </Body>

      <View style={styles.row}>
        {options.map((opt) => {
          const isSelected = visibility === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.8}
              onPress={() => onSelectVisibility(opt.value)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? opt.activeBg : colors.surfaceSoft,
                  borderColor: isSelected ? opt.activeColor : colors.cardBorder,
                },
              ]}
            >
              <Ionicons
                name={opt.icon}
                size={15}
                color={isSelected ? opt.activeColor : colors.textSecondary}
              />
              <Body
                weight={isSelected ? 'bold' : 'medium'}
                style={{
                  color: isSelected ? opt.activeColor : colors.textPrimary,
                  fontSize: 13,
                }}
              >
                {t(opt.labelKey, opt.fallback)}
              </Body>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 13.5,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.2,
    gap: 6,
    minHeight: 42,
  },
});
