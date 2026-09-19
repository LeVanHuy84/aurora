import React, { useEffect, useRef } from 'react';
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
import { Title, Body, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface ScrollDownIndicatorProps {
  onPress?: () => void;
}

export function ScrollDownIndicator({ onPress }: ScrollDownIndicatorProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  // Gentle bouncing animation for the arrow
  const translateY = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 8,
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
      ])
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1200,
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
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#242220' : '#FFFFFF',
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Animated Big Circular Down Arrow Icon */}
        <Animated.View
          style={[
            styles.iconOuterRing,
            {
              backgroundColor: isDark ? '#2E2A27' : '#FDF4EB',
              borderColor: colors.accent,
              transform: [{ translateY }, { scale: pulseScale }],
            },
          ]}
        >
          <View
            style={[
              styles.iconInnerCore,
              { backgroundColor: colors.accentDark },
            ]}
          >
            <Ionicons name="arrow-down" size={26} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Text Prompt */}
        <View style={styles.textContainer}>
          <Title level={3} color="primary" style={styles.title}>
            {t('moments.scrollDownPrompt')}
          </Title>
          <Caption color="secondary" style={styles.subtitle}>
            {t('moments.scrollDownSubtitle')}
          </Caption>
        </View>

        {/* Secondary chevron indicator */}
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card,
    borderWidth: 1.5,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconOuterRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  iconInnerCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});
