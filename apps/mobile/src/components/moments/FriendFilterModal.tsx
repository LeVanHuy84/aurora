import React from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Caption, Title } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useFriends } from '../../hooks/use-friends';

export type FilterOption =
  | { type: 'ALL' }
  | { type: 'CLOSE_FRIENDS' }
  | { type: 'FRIEND'; friendId: string; displayName: string; avatarUrl?: string | null };

export interface FriendFilterModalProps {
  visible: boolean;
  selectedFilter: FilterOption;
  onSelectFilter: (filter: FilterOption) => void;
  onClose: () => void;
}

export function FriendFilterModal({
  visible,
  selectedFilter,
  onSelectFilter,
  onClose,
}: FriendFilterModalProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { data: friendships } = useFriends();

  const friends = friendships?.map((f) => ({
    ...f.friend,
    isCloseFriend: f.isCloseFriend,
  })) || [];

  const handleSelect = (filter: FilterOption) => {
    onSelectFilter(filter);
    onClose();
  };

  const isSelected = (filter: FilterOption) => {
    if (filter.type === 'ALL' && selectedFilter.type === 'ALL') return true;
    if (filter.type === 'CLOSE_FRIENDS' && selectedFilter.type === 'CLOSE_FRIENDS') return true;
    if (
      filter.type === 'FRIEND' &&
      selectedFilter.type === 'FRIEND' &&
      filter.friendId === selectedFilter.friendId
    ) {
      return true;
    }
    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: isDark ? '#242220' : '#FFFFFF',
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Title level={3} color="primary">
                  {t('moments.filterBy', 'Lọc khoảnh khắc')}
                </Title>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. All Moments */}
                <TouchableOpacity
                  style={[
                    styles.filterItem,
                    isSelected({ type: 'ALL' }) && {
                      backgroundColor: isDark ? '#2E2A27' : '#FDF4EB',
                      borderColor: colors.accent,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect({ type: 'ALL' })}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.itemIconCircle, { backgroundColor: '#FDF4EB' }]}>
                      <Ionicons name="globe-outline" size={20} color={colors.accentDark} />
                    </View>
                    <Body weight="bold" color="primary" style={styles.itemText}>
                      {t('moments.everyone', 'Tất cả mọi người')}
                    </Body>
                  </View>
                  {isSelected({ type: 'ALL' }) && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accentDark} />
                  )}
                </TouchableOpacity>

                {/* 2. Close Friends Only */}
                <TouchableOpacity
                  style={[
                    styles.filterItem,
                    isSelected({ type: 'CLOSE_FRIENDS' }) && {
                      backgroundColor: isDark ? '#1C382F' : '#E8F5E9',
                      borderColor: colors.closeFriends,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect({ type: 'CLOSE_FRIENDS' })}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.itemIconCircle, { backgroundColor: '#E8F5E9' }]}>
                      <Ionicons name="star" size={18} color={colors.closeFriends} />
                    </View>
                    <Body weight="bold" color="primary" style={styles.itemText}>
                      {t('moments.closeFriends', 'Bạn thân')}
                    </Body>
                  </View>
                  {isSelected({ type: 'CLOSE_FRIENDS' }) && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.closeFriends} />
                  )}
                </TouchableOpacity>

                {/* Divider if friends exist */}
                {friends.length > 0 && (
                  <View style={styles.sectionHeader}>
                    <Caption color="muted" weight="bold">
                      {t('moments.friends', 'BẠN BÈ').toUpperCase()}
                    </Caption>
                  </View>
                )}

                {/* 3. Individual Friends */}
                {friends.map((friend) => {
                  const filterOpt: FilterOption = {
                    type: 'FRIEND',
                    friendId: friend.id,
                    displayName: friend.displayName || friend.username,
                    avatarUrl: friend.avatarUrl,
                  };
                  const active = isSelected(filterOpt);

                  return (
                    <TouchableOpacity
                      key={friend.id}
                      style={[
                        styles.filterItem,
                        active && {
                          backgroundColor: isDark ? '#2E2A27' : '#FDF4EB',
                          borderColor: colors.accent,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(filterOpt)}
                    >
                      <View style={styles.itemLeft}>
                        {friend.avatarUrl ? (
                          <Image
                            source={{ uri: friend.avatarUrl }}
                            style={styles.avatarImage}
                            contentFit="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.avatarFallback,
                              { backgroundColor: colors.accent },
                            ]}
                          >
                            <Caption color="white" weight="bold">
                              {(friend.displayName || friend.username || 'F')[0].toUpperCase()}
                            </Caption>
                          </View>
                        )}
                        <Body weight="bold" color="primary" style={styles.itemText}>
                          {friend.displayName || friend.username}
                        </Body>
                      </View>
                      {active && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.accentDark} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl * 1.5,
    maxHeight: '65%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  optionsList: {
    width: '100%',
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: Spacing.xs + 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 15,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
});
