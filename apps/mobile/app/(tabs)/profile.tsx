import React, { useState, useMemo } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/use-auth';
import { useUserProfile } from '../../src/hooks/use-user-profile';
import { useCalendarMoments, useHistoryMoments } from '../../src/hooks/use-moments';
import { useFriends, usePendingFriendRequests } from '../../src/hooks/use-friends';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { ProfileHeaderCard } from '../../src/components/profile/ProfileHeaderCard';
import { MonthlyMoodChart } from '../../src/components/profile/MonthlyMoodChart';
import { SettingsSection } from '../../src/components/profile/SettingsSection';
import { EditProfileModal } from '../../src/components/profile/EditProfileModal';
import { FriendsManagerModal } from '../../src/components/profile/FriendsManagerModal';
import { Spacing } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { data: user, refetch: refetchUser } = useUserProfile();

  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthName = `Tháng ${currentMonth}, ${currentYear}`;

  // Queries
  const {
    data: calendarMoments = [],
    refetch: refetchCalendar,
    isRefetching: isRefetchingCalendar,
  } = useCalendarMoments(currentMonth, currentYear);

  const {
    data: historyData,
    refetch: refetchHistory,
    isRefetching: isRefetchingHistory,
  } = useHistoryMoments(100);

  const {
    data: friends = [],
    refetch: refetchFriends,
    isRefetching: isRefetchingFriends,
  } = useFriends();

  const {
    data: pendingRequests = [],
    refetch: refetchPending,
  } = usePendingFriendRequests();

  // Modals state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isFriendsModalVisible, setIsFriendsModalVisible] = useState(false);

  // Stats calculation
  const momentsCount = historyData?.items?.length || 0;
  const friendsCount = friends.length;
  const closeFriendsCount = friends.filter((f) => f.isCloseFriend).length;

  const isRefreshing =
    isRefetchingCalendar || isRefetchingHistory || isRefetchingFriends;

  const handleRefresh = async () => {
    await Promise.all([
      refetchUser(),
      refetchCalendar(),
      refetchHistory(),
      refetchFriends(),
      refetchPending(),
    ]);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/splash');
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top']}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* 1. Profile Header Card */}
      <ProfileHeaderCard
        user={user}
        momentsCount={momentsCount}
        friendsCount={friendsCount}
        closeFriendsCount={closeFriendsCount}
        onEditPress={() => setIsEditModalVisible(true)}
      />

      {/* 2. Monthly Mood Summary Chart */}
      <MonthlyMoodChart
        moments={calendarMoments}
        monthName={monthName}
      />

      {/* 3. Settings & Actions (Friends, Theme, Language, Notifications, Logout) */}
      <SettingsSection
        friendsCount={friendsCount}
        pendingRequestsCount={pendingRequests.length}
        onOpenFriends={() => setIsFriendsModalVisible(true)}
        onLogout={handleLogout}
      />

      {/* 4. Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        user={user}
        onClose={() => setIsEditModalVisible(false)}
      />

      {/* 5. Friends Manager Modal */}
      <FriendsManagerModal
        visible={isFriendsModalVisible}
        onClose={() => setIsFriendsModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm + 4,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl * 2,
  },
});
