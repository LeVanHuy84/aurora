import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { HeroMoodWidget } from './HeroMoodWidget';
import { CloseFriendsWidget } from './CloseFriendsWidget';
import { Title, Body, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface HomeHeroSlideProps {
  height: number;
  displayName?: string;
  onCheckInPress: () => void;
  onCreatePress?: () => void;
  onFriendPress?: (friendId: string) => void;
  onAddFriendPress?: () => void;
  onScrollDownPress: () => void;
  momentsCount?: number;
}

export function HomeHeroSlide({
  height,
  displayName,
  onCheckInPress,
  onCreatePress,
  onFriendPress,
  onAddFriendPress,
  onScrollDownPress,
  momentsCount = 0,
}: HomeHeroSlideProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  // Animations for scroll down prompt
  const translateY = React.useRef(new Animated.Value(0)).current;
  const pulseScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 10,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnimation.start();
    pulseAnimation.start();

    return () => {
      bounceAnimation.stop();
      pulseAnimation.stop();
    };
  }, [translateY, pulseScale]);

  return (
    <View style={[styles.slideContainer, { height }]}>
      {/* 1. TOP BRAND HEADER */}
      <View style={styles.topBrandNav}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.brandLogo,
              { backgroundColor: isDark ? '#2C2926' : '#FDF4EB' },
            ]}
          >
            <Ionicons name="sparkles" size={16} color={colors.accentDark} />
          </View>
          <Title level={2} style={styles.brandTitle}>
            {t('common.appName', 'Aurora')}
          </Title>
        </View>

        {onCreatePress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onCreatePress}
            style={[
              styles.iconBtn,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons name="add" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. GREETING & MOOD CHECK-IN */}
      <View style={styles.middleGroup}>
        <HeroMoodWidget
          displayName={displayName}
          onCheckInPress={onCheckInPress}
          style={styles.greetingWidget}
        />

        {/* 3. CLOSE FRIENDS STRIP */}
        <CloseFriendsWidget
          onAddFriendPress={onAddFriendPress}
          onFriendPress={onFriendPress}
          style={styles.friendsWidget}
        />
      </View>

      {/* 4. SPECIAL PROMINENT SCROLL DOWN INDICATOR WIDGET */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onScrollDownPress}
          style={[
            styles.scrollPromptCard,
            {
              backgroundColor: isDark ? '#242220' : '#FFFFFF',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Big Bouncing Arrow Ring */}
          <Animated.View
            style={[
              styles.bigArrowRing,
              {
                backgroundColor: isDark ? '#2F2B27' : '#FFF3E6',
                borderColor: colors.accent,
                transform: [{ translateY }, { scale: pulseScale }],
              },
            ]}
          >
            <View
              style={[
                styles.arrowInnerCircle,
                { backgroundColor: colors.accentDark },
              ]}
            >
              <Ionicons name="arrow-down" size={28} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Text Prompt */}
          <View style={styles.textWrapper}>
            <Title level={3} color="primary" style={styles.promptTitle}>
              {t('moments.scrollDownPrompt', 'Lướt xuống để xem khoảnh khắc')}
            </Title>
            <Caption color="secondary" style={styles.promptSubtitle}>
              {momentsCount > 0
                ? `${momentsCount} khoảnh khắc hôm nay đang chờ bạn ✨`
                : t('moments.scrollDownSubtitle', 'Khám phá các khoảnh khắc trong ngày của bạn bè')}
            </Caption>
          </View>

          <Ionicons name="chevron-down" size={24} color={colors.accentDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    justifyContent: 'space-between',
  },
  topBrandNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  brandLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleGroup: {
    marginVertical: Spacing.sm,
  },
  greetingWidget: {
    marginBottom: Spacing.md + 4,
  },
  friendsWidget: {
    marginBottom: Spacing.xs,
  },
  bottomSection: {
    paddingBottom: Spacing.xs,
  },
  scrollPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.md + 2,
    borderRadius: BorderRadius.card + 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: Spacing.md,
  },
  bigArrowRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  arrowInnerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  promptSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});
