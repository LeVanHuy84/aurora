import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  LayoutChangeEvent,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../src/hooks/use-theme';
import { useAuth } from '../../src/hooks/use-auth';
import { useHomeFeed } from '../../src/hooks/use-moments';
import { useFriends } from '../../src/hooks/use-friends';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { HomeHeroSlide } from '../../src/components/moments/HomeHeroSlide';
import { HomeHeroSkeleton } from '../../src/components/moments/HomeHeroSkeleton';
import { MomentSlide } from '../../src/components/moments/MomentSlide';
import { EmptyTodayState } from '../../src/components/moments/EmptyTodayState';
import { FloatingMomentFilter } from '../../src/components/moments/FloatingMomentFilter';
import { FriendFilterModal, FilterOption } from '../../src/components/moments/FriendFilterModal';
import { Body } from '../../src/components/ui/Typography';
import { Spacing } from '../../src/constants/theme';
import { MomentItem, Visibility } from '@aurora/types';

type FeedItem =
  | { type: 'HERO'; id: string }
  | { type: 'MOMENT'; data: MomentItem; id: string }
  | { type: 'EMPTY'; id: string };

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const {
    moments,
    todayStats,
    isLoading,
    refetch,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHomeFeed();
  const { data: friendships } = useFriends();

  const flatListRef = useRef<FlatList<FeedItem>>(null);
  const [containerHeight, setContainerHeight] = useState<number>(windowHeight - 80);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>({ type: 'ALL' });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCreateMoment = () => {
    router.push('/(tabs)/create');
  };

  const handleScrollToFirstMoment = () => {
    flatListRef.current?.scrollToIndex({
      index: 1,
      animated: true,
    });
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0 && Math.abs(layoutHeight - containerHeight) > 1) {
      setContainerHeight(layoutHeight);
    }
  };

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const topItem = viewableItems[0];
      if (topItem.index !== undefined && topItem.index !== null) {
        setActiveSlideIndex(topItem.index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Filter moments according to selected filter
  const filteredMoments = (moments || []).filter((m: MomentItem) => {
    if (selectedFilter.type === 'ALL') return true;
    if (selectedFilter.type === 'CLOSE_FRIENDS') {
      return m.visibility === Visibility.CLOSE_FRIENDS;
    }
    if (selectedFilter.type === 'FRIEND') {
      return m.userId === selectedFilter.friendId;
    }
    return true;
  });

  // Get active filter label
  const getFilterLabel = () => {
    if (selectedFilter.type === 'CLOSE_FRIENDS') {
      return t('moments.closeFriends', 'Bạn thân');
    }
    if (selectedFilter.type === 'FRIEND') {
      return selectedFilter.displayName;
    }
    return t('moments.everyone', 'Tất cả mọi người');
  };

  // Build the list of full-screen snap items
  const feedItems: FeedItem[] = [
    { type: 'HERO', id: 'hero-header' },
    ...(filteredMoments.length > 0
      ? filteredMoments.map((m: MomentItem) => ({ type: 'MOMENT' as const, data: m, id: m.id }))
      : !isLoading
      ? [{ type: 'EMPTY' as const, id: 'empty-feed' }]
      : []),
  ];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      if (item.type === 'HERO') {
        return (
          <HomeHeroSlide
            height={containerHeight}
            displayName={user?.displayName || user?.username}
            momentsCount={todayStats.todayMomentsCount}
            myMomentsCount={todayStats.myMomentsTodayCount}
            myEmotionsCount={todayStats.myEmotionsCount}
            activeFriendIds={todayStats.activeFriendIdsToday}
            onCheckInPress={handleCreateMoment}
            onCreatePress={handleCreateMoment}
            onFriendPress={(friendId) => {
              const matchedFriend = friendships?.find((f: any) => f.friend.id === friendId);
              if (matchedFriend) {
                setSelectedFilter({
                  type: 'FRIEND',
                  friendId: matchedFriend.friend.id,
                  displayName: matchedFriend.friend.displayName || matchedFriend.friend.username,
                  avatarUrl: matchedFriend.friend.avatarUrl,
                });
                handleScrollToFirstMoment();
              }
            }}
            onScrollDownPress={handleScrollToFirstMoment}
          />
        );
      }

      if (item.type === 'MOMENT') {
        return (
          <MomentSlide
            height={containerHeight}
            moment={item.data}
            onUserPress={(userId) => {
              const matchedFriend = friendships?.find((f: any) => f.friend.id === userId);
              if (matchedFriend) {
                setSelectedFilter({
                  type: 'FRIEND',
                  friendId: matchedFriend.friend.id,
                  displayName: matchedFriend.friend.displayName || matchedFriend.friend.username,
                  avatarUrl: matchedFriend.friend.avatarUrl,
                });
              }
            }}
          />
        );
      }

      if (item.type === 'EMPTY') {
        const isFiltered = selectedFilter.type !== 'ALL';
        return (
          <View style={[styles.emptySlide, { height: containerHeight }]}>
            <EmptyTodayState
              title={isFiltered ? `Chưa có bài viết từ ${getFilterLabel()}` : undefined}
              subtitle={
                isFiltered
                  ? 'Không tìm thấy khoảnh khắc nào phù hợp với bộ lọc hiện tại. Hãy thử đổi bộ lọc hoặc xem tất cả khoảnh khắc!'
                  : undefined
              }
              onResetFilterPress={isFiltered ? () => setSelectedFilter({ type: 'ALL' }) : undefined}
              onCreatePress={handleCreateMoment}
            />
          </View>
        );
      }

      return null;
    },
    [
      containerHeight,
      user,
      todayStats,
      friendships,
      selectedFilter,
      getFilterLabel,
    ],
  );

  return (
    <ScreenContainer style={styles.container} edges={['top']}>
      <View style={styles.feedWrapper} onLayout={handleContainerLayout}>
        {/* Single persistent Floating Filter Capsule: Displayed when viewing any moment or empty state (slide > 0) */}
        {activeSlideIndex > 0 && (
          <FloatingMomentFilter
            selectedFilter={selectedFilter}
            onPress={() => setFilterModalVisible(true)}
          />
        )}

        {isLoading && !moments ? (
          <HomeHeroSkeleton />
        ) : (
          <FlatList
            ref={flatListRef}
            data={feedItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            pagingEnabled
            snapToInterval={containerHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews={Platform.OS === 'android'}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            getItemLayout={(_, index) => ({
              length: containerHeight,
              offset: containerHeight * index,
              index,
            })}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accentDark}
                colors={[colors.accentDark]}
              />
            }
          />
        )}
      </View>

      {/* Friend / Audience Filter Modal Sheet */}
      <FriendFilterModal
        visible={filterModalVisible}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        onClose={() => setFilterModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  feedWrapper: {
    flex: 1,
  },
  emptySlide: {
    width: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
  },
});
