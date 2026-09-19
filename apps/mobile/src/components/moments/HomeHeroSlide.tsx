import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { useConversations } from '../../hooks/use-chat';
import { HeroMoodWidget } from './HeroMoodWidget';
import { CloseFriendsWidget } from './CloseFriendsWidget';
import { AuroraDailyBanner } from './AuroraDailyBanner';
import { Title, Body, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { triggerHapticFeedback } from '../../utils/haptics';

export interface HomeHeroSlideProps {
  height: number;
  displayName?: string;
  onCheckInPress: () => void;
  onCreatePress?: () => void;
  onFriendPress?: (friendId: string) => void;
  onAddFriendPress?: () => void;
  onScrollDownPress: () => void;
  momentsCount?: number;
  myMomentsCount?: number;
  myEmotionsCount?: number;
  activeFriendIds?: string[];
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
  myMomentsCount = 0,
  myEmotionsCount = 0,
  activeFriendIds = [],
}: HomeHeroSlideProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { data: conversations } = useConversations();
  const totalUnreadCount = (conversations || []).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  // Smooth pulsing & bouncing animation for discovery prompt
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 5,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    bounceAnimation.start();
    return () => bounceAnimation.stop();
  }, [translateY]);

  return (
    <View style={[styles.slideContainer, { height }]}>
      {/* 1. TOP BRAND HEADER */}
      <View style={styles.topBrandNav}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.brandLogo}
            contentFit="cover"
          />
          <Title level={2} style={styles.brandTitle}>
            {t('common.appName', 'Aurora')}
          </Title>
        </View>

        <View style={styles.topActionsRow}>
          {/* Inbox Button with Unread Badge */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/inbox')}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? '#23201D' : '#FFFDF9',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={19}
              color={colors.textPrimary}
            />
            {totalUnreadCount > 0 && (
              <View
                style={[
                  styles.inboxUnreadDot,
                  { backgroundColor: colors.accentDark },
                ]}
              >
                {totalUnreadCount > 1 ? (
                  <Caption color="white" weight="bold" style={styles.unreadDotText}>
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                  </Caption>
                ) : null}
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. MAIN HUB SECTION (Grouped cleanly) */}
      <View style={styles.mainHubSection}>
        {/* Top: Greeting & Check-in */}
        <HeroMoodWidget
          displayName={displayName}
          onCheckInPress={onCheckInPress}
          style={styles.greetingCard}
        />

        {/* Middle: Close Friends Carousel with Active Story Rings */}
        <CloseFriendsWidget
          activeFriendIds={activeFriendIds}
          onAddFriendPress={onAddFriendPress}
          onFriendPress={onFriendPress}
          style={styles.friendsWidget}
        />

        {/* Bottom of Hub: Aurora Concept Dreamy Daily Banner (~155px) */}
        <AuroraDailyBanner
          momentsCount={myMomentsCount}
          emotionsCount={myEmotionsCount}
          style={styles.dailyBanner}
        />
      </View>

      {/* 3. STREAMLINED DISCOVERY SCROLL BAR */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => {
            triggerHapticFeedback();
            onScrollDownPress();
          }}
          style={[
            styles.discoveryBar,
            {
              backgroundColor: isDark ? '#23201D' : '#FFFDF9',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.cardBorder,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.arrowCircle,
              {
                backgroundColor: isDark ? 'rgba(231, 111, 81, 0.18)' : '#FFEEDB',
                transform: [{ translateY }],
              },
            ]}
          >
            <Ionicons name="arrow-down" size={17} color={colors.accentDark} />
          </Animated.View>

          <View style={styles.discoveryTextGroup}>
            <Body weight="bold" color="primary" style={styles.discoveryTitle}>
              {t('moments.scrollDownPrompt', 'Lướt xuống để xem khoảnh khắc')}
            </Body>
            <Caption color="secondary" style={styles.discoverySubtitle}>
              {momentsCount > 0
                ? `${momentsCount} khoảnh khắc hôm nay ✨`
                : t('moments.scrollDownSubtitle', 'Khám phá các khoảnh khắc trong ngày của bạn bè')}
            </Caption>
          </View>

          <Ionicons name="chevron-down" size={19} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    width: '100%',
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: Spacing.xs + 2,
    justifyContent: 'flex-start',
  },
  topBrandNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    paddingBottom: 6,
    paddingHorizontal: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inboxUnreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadDotText: {
    fontSize: 9.5,
    lineHeight: 12,
  },
  mainHubSection: {
    gap: 10,
    marginTop: 2,
  },
  greetingCard: {
    width: '100%',
  },
  friendsWidget: {
    width: '100%',
  },
  dailyBanner: {
    width: '100%',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 8,
    paddingBottom: 2,
  },
  discoveryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 11,
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryTextGroup: {
    flex: 1,
  },
  discoveryTitle: {
    fontSize: 13.5,
    letterSpacing: -0.1,
  },
  discoverySubtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
});
