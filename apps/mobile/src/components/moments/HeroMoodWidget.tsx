import React from 'react';
import { StyleSheet, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface HeroMoodWidgetProps {
  displayName?: string;
  onCheckInPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function HeroMoodWidget({ displayName, onCheckInPress, style }: HeroMoodWidgetProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const getGreetingData = () => {
    const now = new Date();
    const hour = now.getHours();

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    };
    const dateFormatted = now.toLocaleDateString('vi-VN', dateOptions);

    if (hour < 12) {
      return {
        greeting: t('moments.greetingMorning', { name: displayName || 'bạn' }),
        icon: 'sunny' as const,
        iconColor: '#F4A261',
        iconBg: isDark ? 'rgba(244, 162, 97, 0.15)' : '#FFF3E6',
        tagline: t('moments.heroMoodPrompt', 'Hôm nay của bạn đang thế nào?'),
        date: dateFormatted,
      };
    }
    if (hour < 18) {
      return {
        greeting: t('moments.greetingAfternoon', { name: displayName || 'bạn' }),
        icon: 'partly-sunny' as const,
        iconColor: '#E76F51',
        iconBg: isDark ? 'rgba(231, 111, 81, 0.15)' : '#FFEEDB',
        tagline: t('moments.heroMoodPrompt', 'Hôm nay của bạn đang thế nào?'),
        date: dateFormatted,
      };
    }
    return {
      greeting: t('moments.greetingEvening', { name: displayName || 'bạn' }),
      icon: 'moon' as const,
      iconColor: '#9D8DF1',
      iconBg: isDark ? 'rgba(157, 141, 241, 0.15)' : '#F2EEFF',
      tagline: t('moments.heroMoodPrompt', 'Hôm nay của bạn đang thế nào?'),
      date: dateFormatted,
    };
  };

  const data = getGreetingData();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#23201D' : '#FFFDF9',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.cardBorder,
        },
        style,
      ]}
    >
      {/* Top Meta Header: Date & Time Icon */}
      <View style={styles.headerRow}>
        <View style={styles.dateTag}>
          <Caption color="muted" weight="medium" style={styles.dateText}>
            {data.date.toUpperCase()}
          </Caption>
        </View>

        <View style={[styles.timeBadge, { backgroundColor: data.iconBg }]}>
          <Ionicons name={data.icon} size={18} color={data.iconColor} />
        </View>
      </View>

      {/* Greeting Title & Subtitle */}
      <View style={styles.greetingContent}>
        <Title level={2} style={styles.greetingTitle}>
          {data.greeting}
        </Title>
        <Body color="secondary" style={styles.greetingSubtitle}>
          {data.tagline}
        </Body>
      </View>

      {/* Prominent Check-In CTA Button */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onCheckInPress}
        style={[
          styles.actionBtn,
          { backgroundColor: colors.accentDark },
        ]}
      >
        <View style={styles.actionBtnInner}>
          <Ionicons name="sparkles" size={17} color="#FFFFFF" />
          <Body color="white" weight="bold" style={styles.actionBtnText}>
            {t('moments.checkInMoodAction', 'Ghi lại khoảnh khắc hôm nay')}
          </Body>
        </View>
        <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card + 4,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateTag: {
    paddingHorizontal: 2,
  },
  dateText: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  timeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContent: {
    marginBottom: Spacing.sm + 2,
  },
  greetingTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 19,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: Spacing.md + 2,
    borderRadius: BorderRadius.full,
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 14.5,
  },
});
