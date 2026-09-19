import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { useAuth } from '../../src/hooks/use-auth';
import { useTodayMoments } from '../../src/hooks/use-moments';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { HeroMoodWidget } from '../../src/components/moments/HeroMoodWidget';
import { CloseFriendsWidget } from '../../src/components/moments/CloseFriendsWidget';
import { PolaroidCard } from '../../src/components/moments/PolaroidCard';
import { EmptyTodayState } from '../../src/components/moments/EmptyTodayState';
import { Title, Body, Caption } from '../../src/components/ui/Typography';
import { Spacing } from '../../src/constants/theme';

export default function TodayScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const { data: moments, isLoading, refetch, isRefetching } = useTodayMoments();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCreateMoment = () => {
    router.push('/(tabs)/create');
  };

  const handleMomentPress = (momentId: string) => {
    // Dynamic moment detail / 1-1 comment route for Task 3.7
    router.push(`/(tabs)/index`);
  };

  return (
    <ScreenContainer
      style={styles.container}
      header={
        <View style={[styles.topNav, { borderBottomColor: colors.divider }]}>
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
              {t('common.appName')}
            </Title>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCreateMoment}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
              ]}
            >
              <Ionicons name="add" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.accentDark}
            colors={[colors.accentDark]}
          />
        }
      >
        {/* 1. Hero Mood & Greeting Widget */}
        <HeroMoodWidget
          displayName={user?.displayName || user?.username}
          onCheckInPress={handleCreateMoment}
        />

        {/* 2. Close Friends Horizontal Widget */}
        <CloseFriendsWidget
          onAddFriendPress={() => {
            // Future friend search / invite modal
          }}
          onFriendPress={(friendId) => {
            // Filter moments or view friend timeline
          }}
        />

        {/* 3. Today Timeline Section Header */}
        <View style={styles.sectionHeader}>
          <Title level={3} style={styles.sectionTitle}>
            {t('moments.todayTimelineTitle')}
          </Title>
          {moments && moments.length > 0 && (
            <Caption color="muted">
              {moments.length} {moments.length === 1 ? 'moment' : 'moments'}
            </Caption>
          )}
        </View>

        {/* 4. Timeline Moments List / Loading / Empty */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accentDark} />
            <Body color="secondary" style={styles.loadingText}>
              {t('common.loading')}
            </Body>
          </View>
        ) : moments && moments.length > 0 ? (
          moments.map((item) => (
            <PolaroidCard
              key={item.id}
              moment={item}
              onPress={() => handleMomentPress(item.id)}
              onCommentPress={() => handleMomentPress(item.id)}
            />
          ))
        ) : (
          <EmptyTodayState onCreatePress={handleCreateMoment} />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
  },
});
