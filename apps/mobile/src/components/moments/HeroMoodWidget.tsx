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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        text: t('moments.greetingMorning', { name: displayName || 'you' }),
        icon: 'sunny-outline',
        iconColor: '#F4A261',
      };
    }
    if (hour < 18) {
      return {
        text: t('moments.greetingAfternoon', { name: displayName || 'you' }),
        icon: 'partly-sunny-outline',
        iconColor: '#E76F51',
      };
    }
    return {
      text: t('moments.greetingEvening', { name: displayName || 'you' }),
      icon: 'moon-outline',
      iconColor: '#8E7DBE',
    };
  };

  const greeting = getGreeting();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#242220' : '#FFF9F2',
          borderColor: colors.cardBorder,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.greetingInfo}>
          <View style={styles.greetingTitleRow}>
            <Title level={2} style={styles.greetingTitle}>
              {greeting.text}
            </Title>
          </View>
          <Body color="secondary" style={styles.greetingSubtitle}>
            {t('moments.heroMoodPrompt')}
          </Body>
        </View>

        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isDark ? '#2C2926' : '#FDF4EB' },
          ]}
        >
          <Ionicons name={greeting.icon} size={26} color={greeting.iconColor} />
        </View>
      </View>

      {/* Quick Mood Check-In Prompt Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onCheckInPress}
        style={[
          styles.checkInBtn,
          {
            backgroundColor: colors.surfaceSoft,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.checkInContent}>
          <Ionicons name="sparkles" size={16} color={colors.accentDark} />
          <Caption color="primary" weight="semibold">
            {t('moments.checkInMoodAction')}
          </Caption>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm + 4,
  },
  greetingInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  greetingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingTitle: {
    fontSize: 21,
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  checkInContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
});
