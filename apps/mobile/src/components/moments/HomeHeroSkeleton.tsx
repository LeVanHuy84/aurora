import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { useAppTheme } from '../../hooks/use-theme';
import { Spacing, BorderRadius } from '../../constants/theme';

export function HomeHeroSkeleton() {
  const { colors, isDark } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const blockColor = isDark ? '#2D2A26' : '#EFEAE1';

  return (
    <View style={styles.container}>
      {/* Top Header Skeleton */}
      <View style={styles.topHeader}>
        <Animated.View
          style={[
            styles.brandSkeleton,
            { backgroundColor: blockColor, opacity },
          ]}
        />
        <Animated.View
          style={[styles.iconSkeleton, { backgroundColor: blockColor, opacity }]}
        />
      </View>

      {/* Main Card Skeleton */}
      <View
        style={[
          styles.mainCardSkeleton,
          {
            backgroundColor: isDark ? '#23201D' : '#FFFDF9',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Animated.View
            style={[
              styles.dateSkeleton,
              { backgroundColor: blockColor, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.circleSkeleton,
              { backgroundColor: blockColor, opacity },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.titleSkeleton,
            { backgroundColor: blockColor, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.subtitleSkeleton,
            { backgroundColor: blockColor, opacity },
          ]}
        />
        <Animated.View
          style={[styles.btnSkeleton, { backgroundColor: blockColor, opacity }]}
        />
      </View>

      {/* Friends Row Skeleton */}
      <View style={styles.friendsSection}>
        <Animated.View
          style={[
            styles.sectionTitleSkeleton,
            { backgroundColor: blockColor, opacity },
          ]}
        />
        <View style={styles.friendsAvatarsRow}>
          {[1, 2, 3, 4].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.avatarSkeleton,
                { backgroundColor: blockColor, opacity },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Banner Skeleton */}
      <View
        style={[
          styles.bannerSkeleton,
          {
            backgroundColor: isDark ? '#23201D' : '#FFFDF9',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Animated.View
          style={[styles.tagSkeleton, { backgroundColor: blockColor, opacity }]}
        />
        <Animated.View
          style={[
            styles.bannerTextSkeleton,
            { backgroundColor: blockColor, opacity },
          ]}
        />
      </View>

      {/* Discovery Bottom Skeleton */}
      <View
        style={[
          styles.discoverySkeleton,
          {
            backgroundColor: isDark ? '#23201D' : '#FFFDF9',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.circleSkeleton,
            { backgroundColor: blockColor, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.discoveryTextSkeleton,
            { backgroundColor: blockColor, opacity },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: Spacing.xs + 2,
    paddingBottom: Spacing.sm + 2,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  brandSkeleton: {
    width: 110,
    height: 28,
    borderRadius: 8,
  },
  iconSkeleton: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  mainCardSkeleton: {
    borderRadius: BorderRadius.card + 4,
    borderWidth: 1.5,
    padding: Spacing.md + 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateSkeleton: {
    width: 90,
    height: 14,
    borderRadius: 6,
  },
  circleSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  titleSkeleton: {
    width: '75%',
    height: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  subtitleSkeleton: {
    width: '50%',
    height: 16,
    borderRadius: 6,
    marginBottom: Spacing.md + 2,
  },
  btnSkeleton: {
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.full,
  },
  friendsSection: {
    marginVertical: 2,
  },
  sectionTitleSkeleton: {
    width: 80,
    height: 16,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  friendsAvatarsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  avatarSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  bannerSkeleton: {
    height: 155,
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 20,
    justifyContent: 'space-between',
  },
  tagSkeleton: {
    width: 140,
    height: 20,
    borderRadius: BorderRadius.full,
  },
  bannerTextSkeleton: {
    width: '80%',
    height: 22,
    borderRadius: 6,
  },
  discoverySkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: 11,
  },
  discoveryTextSkeleton: {
    flex: 1,
    height: 18,
    borderRadius: 6,
  },
});
