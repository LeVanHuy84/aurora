import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { BorderRadius } from '../../constants/theme';
import { triggerHapticFeedback } from '../../utils/haptics';

export interface AuroraDailyBannerProps {
  momentsCount?: number;
  emotionsCount?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AuroraDailyBanner({
  momentsCount = 0,
  emotionsCount = 0,
  onPress,
  style,
}: AuroraDailyBannerProps) {
  const { isDark } = useAppTheme();
  const router = useRouter();

  // Subtle breathing animation for sparkles
  const sparkleScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleScale, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleScale, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [sparkleScale]);

  const handlePress = () => {
    triggerHapticFeedback();
    if (onPress) {
      onPress();
    } else {
      if (momentsCount > 0) {
        router.push('/(tabs)/memories');
      } else {
        router.push('/(tabs)/create');
      }
    }
  };

  const gradientColors = isDark
    ? (['#16252E', '#251D33', '#332024'] as const)
    : (['#EAF5F8', '#EDE7F6', '#FFEBE5'] as const);

  const headline =
    momentsCount > 0
      ? `${momentsCount} khoảnh khắc · ${
          emotionsCount > 0 ? `${emotionsCount} cảm xúc` : 'hôm nay'
        }`
      : 'Bắt đầu câu chuyện hôm nay...';

  const subtitle =
    momentsCount > 0
      ? 'Khám phá dòng thời gian & những cảm xúc bạn đã lưu lại hôm nay.'
      : 'Mỗi khoảnh khắc nhỏ bé đều là một mảnh ghép ý nghĩa trong ngày.';

  const actionText = momentsCount > 0 ? 'Xem hành trình' : 'Bắt đầu ghi lại';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientCard,
          {
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.8)',
          },
        ]}
      >
        {/* Decorative Aura Glow Elements */}
        <View
          style={[
            styles.auraGlowTeal,
            {
              backgroundColor: isDark
                ? 'rgba(42, 157, 143, 0.22)'
                : 'rgba(78, 205, 196, 0.3)',
            },
          ]}
        />
        <View
          style={[
            styles.auraGlowLavender,
            {
              backgroundColor: isDark
                ? 'rgba(157, 141, 241, 0.22)'
                : 'rgba(184, 169, 230, 0.32)',
            },
          ]}
        />
        <View
          style={[
            styles.auraGlowPeach,
            {
              backgroundColor: isDark
                ? 'rgba(231, 111, 81, 0.2)'
                : 'rgba(255, 178, 153, 0.3)',
            },
          ]}
        />

        {/* 1. Header: Tag & Animated Sparkle */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: isDark
                  ? 'rgba(216, 199, 255, 0.14)'
                  : 'rgba(255, 255, 255, 0.65)',
                borderColor: isDark
                  ? 'rgba(216, 199, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.8)',
              },
            ]}
          >
            <Ionicons
              name="book-outline"
              size={12}
              color={isDark ? '#D8C7FF' : '#6F569B'}
            />
            <Caption
              weight="bold"
              style={[
                styles.tagText,
                { color: isDark ? '#D8C7FF' : '#6F569B' },
              ]}
            >
              CÂU CHUYỆN CỦA BẠN
            </Caption>
          </View>

          <Animated.View style={{ transform: [{ scale: sparkleScale }] }}>
            <Ionicons
              name="sparkles"
              size={16}
              color={isDark ? '#F4A261' : '#E76F51'}
            />
          </Animated.View>
        </View>

        {/* 2. Main Title & Description */}
        <View style={styles.bodyContent}>
          <Title
            level={3}
            style={[
              styles.headlineText,
              { color: isDark ? '#F5F3EF' : '#2D2338' },
            ]}
            numberOfLines={1}
          >
            {headline}
          </Title>
          <Body
            color="secondary"
            style={[
              styles.subtitleText,
              { color: isDark ? '#A8A49D' : '#685D75' },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Body>
        </View>

        {/* 3. Bottom Action CTA Bar */}
        <View style={styles.bottomRow}>
          <View
            style={[
              styles.actionPill,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(255, 255, 255, 0.75)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.18)'
                  : 'rgba(255, 255, 255, 0.95)',
              },
            ]}
          >
            <Caption
              weight="bold"
              style={[
                styles.actionPillText,
                { color: isDark ? '#F5F3EF' : '#3E2E54' },
              ]}
            >
              {actionText}
            </Caption>
            <Ionicons
              name="arrow-forward"
              size={13}
              color={isDark ? '#F4A261' : '#E76F51'}
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    shadowColor: '#8E7DBE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  gradientCard: {
    height: 155,
    borderRadius: 26,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  auraGlowTeal: {
    position: 'absolute',
    top: -30,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  auraGlowLavender: {
    position: 'absolute',
    top: -15,
    right: 30,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  auraGlowPeach: {
    position: 'absolute',
    bottom: -35,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 5,
  },
  tagText: {
    fontSize: 10.5,
    letterSpacing: 0.7,
  },
  bodyContent: {
    zIndex: 2,
  },
  headlineText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12.5,
    lineHeight: 17.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 2,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  actionPillText: {
    fontSize: 12,
  },
});
