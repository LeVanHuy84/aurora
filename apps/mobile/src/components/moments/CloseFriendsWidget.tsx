import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { useFriends } from '../../hooks/use-friends';
import { Body, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { triggerHapticFeedback } from '../../utils/haptics';

export interface CloseFriendsWidgetProps {
  activeFriendIds?: string[];
  onFriendPress?: (friendId: string) => void;
  onAddFriendPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CloseFriendsWidget({
  activeFriendIds = [],
  onFriendPress,
  onAddFriendPress,
  style,
}: CloseFriendsWidgetProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { data: friendships, isLoading } = useFriends();

  const activeFriendSet = new Set(activeFriendIds);

  const friends = friendships?.map((f) => ({
    ...f.friend,
    isCloseFriend: f.isCloseFriend,
    hasPostedToday: activeFriendSet.has(f.friend.id),
  })) || [];

  const handleFriendPress = (id: string) => {
    triggerHapticFeedback();
    onFriendPress?.(id);
  };

  const handleAddPress = () => {
    triggerHapticFeedback();
    onAddFriendPress?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="people" size={16} color={colors.accentDark} />
          <Body weight="bold" color="primary" style={styles.title}>
            {t('moments.closeFriendsWidgetTitle', 'Bạn bè')}
          </Body>
          {friends.length > 0 && (
            <View
              style={[
                styles.countBadge,
                { backgroundColor: isDark ? '#2C2926' : '#F5F2EB' },
              ]}
            >
              <Caption color="muted" weight="bold" style={styles.countText}>
                {friends.length}
              </Caption>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Add / Invite Friend Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleAddPress}
          style={styles.itemWrapper}
        >
          <View
            style={[
              styles.addAvatar,
              {
                backgroundColor: isDark ? '#23201D' : '#FFFDF9',
                borderColor: colors.accentDark,
              },
            ]}
          >
            <Ionicons name="person-add-outline" size={19} color={colors.accentDark} />
          </View>
          <Caption color="accent" weight="semibold" style={styles.nameText} numberOfLines={1}>
            {t('common.add', 'Thêm')}
          </Caption>
        </TouchableOpacity>

        {/* 2. Friends Avatars List */}
        {friends.map((item) => {
          const hasPosted = item.hasPostedToday;
          const isClose = item.isCloseFriend;

          // Border styling based on status
          const borderColor = hasPosted
            ? isClose ? '#38A169' : colors.accentDark
            : isClose ? 'rgba(56, 161, 105, 0.4)' : isDark ? 'rgba(255,255,255,0.12)' : colors.cardBorder;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleFriendPress(item.id)}
              style={styles.itemWrapper}
            >
              <View
                style={[
                  styles.avatarRing,
                  {
                    borderColor,
                    borderWidth: hasPosted ? 2.5 : 1.5,
                    backgroundColor: colors.surfaceSoft,
                  },
                ]}
              >
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarFallback,
                      { backgroundColor: isClose ? '#38A169' : colors.accent },
                    ]}
                  >
                    <Body weight="bold" color="white" style={{ fontSize: 15 }}>
                      {(item.displayName || item.username || 'F')[0].toUpperCase()}
                    </Body>
                  </View>
                )}

                {/* Close Friend Star Indicator */}
                {isClose && (
                  <View style={[styles.closeFriendDot, { backgroundColor: '#38A169' }]}>
                    <Ionicons name="star" size={8} color="#FFFFFF" />
                  </View>
                )}

                {/* Active Story Sparkle Dot when has posted today & not close friend */}
                {hasPosted && !isClose && (
                  <View style={[styles.activeDot, { backgroundColor: colors.accentDark }]}>
                    <Ionicons name="sparkles" size={7} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <Caption
                color={hasPosted ? 'primary' : 'muted'}
                weight={hasPosted ? 'bold' : 'medium'}
                style={styles.nameText}
                numberOfLines={1}
              >
                {item.displayName || item.username}
              </Caption>
            </TouchableOpacity>
          );
        })}

        {/* Empty placeholder when user has 0 friends yet */}
        {friends.length === 0 && !isLoading && (
          <View style={styles.emptyPrompt}>
            <Caption color="muted" style={{ fontSize: 13 }}>
              {t('moments.noFriendsYetPrompt', 'Kết nối bạn thân để xem khoảnh khắc mỗi ngày của nhau')}
            </Caption>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: 11,
  },
  scrollContent: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 2,
  },
  itemWrapper: {
    alignItems: 'center',
    width: 58,
  },
  addAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFriendDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  nameText: {
    textAlign: 'center',
    fontSize: 11.5,
  },
  emptyPrompt: {
    justifyContent: 'center',
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.md,
  },
});
