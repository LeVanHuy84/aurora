import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import {
  useFriends,
  usePendingFriendRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeleteFriend,
  useToggleCloseFriend,
} from '../../hooks/use-friends';
import { useSearchUsers } from '../../hooks/use-user-profile';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface FriendsManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

type FriendsTab = 'FRIENDS' | 'REQUESTS' | 'ADD';

export function FriendsManagerModal({
  visible,
  onClose,
}: FriendsManagerModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<FriendsTab>('FRIENDS');
  
  // Search states: searchInput (typing) vs searchQuery (submitted)
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Queries & Mutations
  const { data: friends = [], isLoading: isLoadingFriends } = useFriends();
  const { data: pendingRequests = [], isLoading: isLoadingPending } =
    usePendingFriendRequests();
  const { data: searchResults = [], isLoading: isLoadingSearch, isFetching: isFetchingSearch } =
    useSearchUsers(searchQuery);

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const deleteFriend = useDeleteFriend();
  const toggleCloseFriend = useToggleCloseFriend();

  const handleToggleClose = async (friendshipId: string, currentStatus: boolean) => {
    try {
      await toggleCloseFriend.mutateAsync({
        friendshipId,
        isCloseFriend: !currentStatus,
      });
    } catch (err: any) {
      Alert.alert(t('common.error', 'Có lỗi xảy ra'), err?.message);
    }
  };

  const handleRemoveFriend = (friendshipId: string, name: string) => {
    Alert.alert(
      t('profile.removeFriendBtn', 'Hủy kết bạn'),
      `Bạn có chắc muốn hủy kết bạn với ${name}?`,
      [
        { text: t('common.cancel', 'Hủy'), style: 'cancel' },
        {
          text: t('common.delete', 'Xóa'),
          style: 'destructive',
          onPress: () => deleteFriend.mutate(friendshipId),
        },
      ],
    );
  };

  const handleTriggerSearch = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      setSearchQuery('');
      return;
    }
    setSearchQuery(trimmed);
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      await sendRequest.mutateAsync(receiverId);
      Alert.alert(
        t('common.appName', 'Aurora'),
        t('profile.requestSent', 'Đã gửi lời mời'),
      );
    } catch (err: any) {
      Alert.alert(t('common.error', 'Có lỗi xảy ra'), err?.message);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.divider,
              paddingTop: Math.max(insets.top, 24) + Spacing.sm,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceSoft }]}
          >
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Title level={3} style={styles.headerTitle}>
            {t('profile.friendsManagerTitle', 'Quản lý Bạn bè')}
          </Title>

          <View style={styles.placeholderBtn} />
        </View>

        {/* 3-Tab Segment Selector */}
        <View
          style={[
            styles.tabBar,
            { backgroundColor: isDark ? '#262320' : '#EFECE6', borderColor: colors.cardBorder },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('FRIENDS')}
            style={[
              styles.tabBtn,
              activeTab === 'FRIENDS' && [
                styles.tabBtnActive,
                { backgroundColor: colors.card },
              ],
            ]}
          >
            <Caption
              weight={activeTab === 'FRIENDS' ? 'bold' : 'medium'}
              style={{
                fontSize: 12.5,
                color: activeTab === 'FRIENDS' ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {t('profile.friendsTab', 'Bạn bè')} ({friends.length})
            </Caption>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('REQUESTS')}
            style={[
              styles.tabBtn,
              activeTab === 'REQUESTS' && [
                styles.tabBtnActive,
                { backgroundColor: colors.card },
              ],
            ]}
          >
            <Caption
              weight={activeTab === 'REQUESTS' ? 'bold' : 'medium'}
              style={{
                fontSize: 12.5,
                color: activeTab === 'REQUESTS' ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {t('profile.requestsTab', 'Lời mời')}{' '}
              {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}
            </Caption>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('ADD')}
            style={[
              styles.tabBtn,
              activeTab === 'ADD' && [
                styles.tabBtnActive,
                { backgroundColor: colors.card },
              ],
            ]}
          >
            <Caption
              weight={activeTab === 'ADD' ? 'bold' : 'medium'}
              style={{
                fontSize: 12.5,
                color: activeTab === 'ADD' ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {t('profile.addFriendTab', 'Tìm bạn mới')}
            </Caption>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Friends List */}
        {activeTab === 'FRIENDS' ? (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoadingFriends ? (
              <ActivityIndicator
                size="small"
                color={colors.accent}
                style={{ marginTop: Spacing.xl }}
              />
            ) : friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Caption style={{ fontSize: 32, lineHeight: 40 }}>👥</Caption>
                <Body color="secondary" align="center" style={styles.emptyDesc}>
                  {t(
                    'profile.noFriendsYet',
                    'Bạn chưa có bạn bè nào. Tìm kiếm và kết nối ngay nhé!',
                  )}
                </Body>
              </View>
            ) : (
              friends.map((item) => {
                const friend = item.friend || (item as any).user || (item as any).requester;
                const displayName = friend?.displayName || friend?.username || 'Bạn bè';
                const username = friend?.username || '';
                const avatarUrl = friend?.avatarUrl;
                const initial = (displayName || username || 'F')[0]?.toUpperCase() || 'F';

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.friendCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarFallback,
                          { backgroundColor: colors.accent },
                        ]}
                      >
                        <Body weight="bold" color="white">
                          {initial}
                        </Body>
                      </View>
                    )}

                    <View style={styles.infoCol}>
                      <Body weight="bold" color="primary" numberOfLines={1} style={styles.name}>
                        {displayName}
                      </Body>
                      <Caption color="muted" numberOfLines={1}>@{username}</Caption>
                    </View>

                    {/* Close Friend Star Toggle */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleClose(item.id, item.isCloseFriend)}
                      style={[
                        styles.actionPill,
                        item.isCloseFriend
                          ? { backgroundColor: isDark ? '#182C26' : '#E8F6F2', borderColor: colors.closeFriends }
                          : { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
                      ]}
                    >
                      <Caption
                        weight="bold"
                        style={{
                          fontSize: 11.5,
                          color: item.isCloseFriend ? colors.closeFriends : colors.textSecondary,
                        }}
                      >
                        {item.isCloseFriend ? '⭐ Bạn thân' : '☆ Thường'}
                      </Caption>
                    </TouchableOpacity>

                    {/* Delete friend icon */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        handleRemoveFriend(item.id, displayName)
                      }
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        ) : null}

        {/* Tab 2: Pending Requests */}
        {activeTab === 'REQUESTS' ? (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoadingPending ? (
              <ActivityIndicator
                size="small"
                color={colors.accent}
                style={{ marginTop: Spacing.xl }}
              />
            ) : pendingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Caption style={{ fontSize: 32, lineHeight: 40 }}>💌</Caption>
                <Body color="secondary" align="center" style={styles.emptyDesc}>
                  {t(
                    'profile.noPendingRequests',
                    'Không có lời mời kết bạn nào đang chờ.',
                  )}
                </Body>
              </View>
            ) : (
              pendingRequests.map((item) => {
                const requester = item.friend || (item as any).requester || (item as any).user;
                const displayName = requester?.displayName || requester?.username || 'Người dùng';
                const username = requester?.username || '';
                const avatarUrl = requester?.avatarUrl;
                const initial = (displayName || username || 'R')[0]?.toUpperCase() || 'R';

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.friendCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarFallback,
                          { backgroundColor: colors.accent },
                        ]}
                      >
                        <Body weight="bold" color="white">
                          {initial}
                        </Body>
                      </View>
                    )}

                    <View style={styles.infoCol}>
                      <Body weight="bold" color="primary" numberOfLines={1} style={styles.name}>
                        {displayName}
                      </Body>
                      <Caption color="muted" numberOfLines={1}>@{username}</Caption>
                    </View>

                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => acceptRequest.mutate(item.id)}
                        style={[styles.acceptBtn, { backgroundColor: colors.accentDark }]}
                      >
                        <Caption weight="bold" color="white" style={{ fontSize: 12 }}>
                          {t('profile.acceptBtn', 'Đồng ý')}
                        </Caption>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => deleteFriend.mutate(item.id)}
                        style={[styles.declineBtn, { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder }]}
                      >
                        <Caption color="primary" style={{ fontSize: 12 }}>
                          {t('profile.declineBtn', 'Từ chối')}
                        </Caption>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        ) : null}

        {/* Tab 3: Search & Add Friend */}
        {activeTab === 'ADD' ? (
          <ScrollView
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search Input Bar + Submit Button */}
            <View style={styles.searchRow}>
              <View
                style={[
                  styles.searchBar,
                  {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Ionicons name="search" size={17} color={colors.textMuted} />
                <TextInput
                  value={searchInput}
                  onChangeText={(text) => {
                    setSearchInput(text);
                    if (!text.trim()) setSearchQuery('');
                  }}
                  onSubmitEditing={handleTriggerSearch}
                  returnKeyType="search"
                  placeholder={t(
                    'profile.searchPlaceholder',
                    'Tìm theo username hoặc tên...',
                  )}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                />
                {searchInput ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                  >
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Explicit Search Action Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTriggerSearch}
                style={[
                  styles.searchSubmitBtn,
                  { backgroundColor: colors.accentDark },
                ]}
              >
                <Caption weight="bold" color="white" style={{ fontSize: 13 }}>
                  Tìm
                </Caption>
              </TouchableOpacity>
            </View>

            {isLoadingSearch || isFetchingSearch ? (
              <ActivityIndicator
                size="small"
                color={colors.accent}
                style={{ marginTop: Spacing.md }}
              />
            ) : searchResults.length > 0 ? (
              searchResults.map((userItem) => {
                const initial = (userItem.displayName || userItem.username || 'U')[0].toUpperCase();
                const isAlreadyFriend = friends.some((f) => f.friend.id === userItem.id);

                return (
                  <View
                    key={userItem.id}
                    style={[
                      styles.friendCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    {userItem.avatarUrl ? (
                      <Image
                        source={{ uri: userItem.avatarUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarFallback,
                          { backgroundColor: colors.accent },
                        ]}
                      >
                        <Body weight="bold" color="white">
                          {initial}
                        </Body>
                      </View>
                    )}

                    <View style={styles.infoCol}>
                      <Body weight="bold" color="primary" numberOfLines={1} style={styles.name}>
                        {userItem.displayName}
                      </Body>
                      <Caption color="muted" numberOfLines={1}>@{userItem.username}</Caption>
                    </View>

                    {isAlreadyFriend ? (
                      <View style={[styles.statusPill, { backgroundColor: colors.surfaceSoft }]}>
                        <Caption color="muted" style={{ fontSize: 11.5 }}>
                          ✓ Bạn bè
                        </Caption>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleSendRequest(userItem.id)}
                        style={[
                          styles.addBtn,
                          { backgroundColor: colors.accentDark },
                        ]}
                      >
                        <Ionicons name="person-add" size={13} color="#FFF" />
                        <Caption weight="bold" color="white" style={{ fontSize: 12 }}>
                          {t('profile.sendRequestBtn', 'Kết bạn')}
                        </Caption>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            ) : searchQuery.trim().length >= 2 ? (
              <View style={styles.emptyState}>
                <Caption style={{ fontSize: 26, lineHeight: 32 }}>🔍</Caption>
                <Body color="secondary" align="center" style={styles.emptyDesc}>
                  Không tìm thấy người dùng nào phù hợp với "{searchQuery}".
                </Body>
              </View>
            ) : null}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
  },
  placeholderBtn: {
    width: 34,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  emptyState: {
    paddingVertical: Spacing.xl * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  emptyDesc: {
    fontSize: 13,
    maxWidth: 260,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 13.5,
  },
  actionPill: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  declineBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.xs + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  searchSubmitBtn: {
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
});
