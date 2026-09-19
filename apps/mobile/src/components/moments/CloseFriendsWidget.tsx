import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { useFriends } from '../../hooks/use-friends';
import { Title, Body, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface CloseFriendsWidgetProps {
  onFriendPress?: (friendId: string) => void;
  onAddFriendPress?: () => void;
}

export function CloseFriendsWidget({
  onFriendPress,
  onAddFriendPress,
}: CloseFriendsWidgetProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { data: friendships, isLoading } = useFriends();

  const friends = friendships?.map((f) => ({
    ...f.friend,
    isCloseFriend: f.isCloseFriend,
  })) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title level={3} style={styles.title}>
          {t('moments.closeFriendsWidgetTitle')}
        </Title>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Add / Invite Friend Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAddFriendPress}
          style={styles.itemWrapper}
        >
          <View
            style={[
              styles.addAvatar,
              {
                backgroundColor: colors.surfaceSoft,
                borderColor: colors.accentDark,
              },
            ]}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.accentDark} />
          </View>
          <Caption color="accent" weight="medium" style={styles.nameText} numberOfLines={1}>
            {t('common.add')}
          </Caption>
        </TouchableOpacity>

        {/* 2. Friends Avatars List */}
        {friends.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => onFriendPress?.(item.id)}
            style={styles.itemWrapper}
          >
            <View
              style={[
                styles.avatarRing,
                {
                  borderColor: item.isCloseFriend
                    ? colors.closeFriends
                    : colors.cardBorder,
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
                    { backgroundColor: item.isCloseFriend ? colors.closeFriends : colors.accent },
                  ]}
                >
                  <Body weight="bold" color="white">
                    {(item.displayName || item.username || 'F')[0].toUpperCase()}
                  </Body>
                </View>
              )}

              {/* Close Friend Indicator Star */}
              {item.isCloseFriend && (
                <View style={[styles.closeFriendDot, { backgroundColor: colors.closeFriends }]}>
                  <Ionicons name="star" size={8} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Caption color="primary" weight="medium" style={styles.nameText} numberOfLines={1}>
              {item.displayName || item.username}
            </Caption>
          </TouchableOpacity>
        ))}

        {/* Empty placeholder when user has 0 friends yet */}
        {friends.length === 0 && !isLoading && (
          <View style={styles.emptyPrompt}>
            <Caption color="muted">{t('moments.noFriendsYetPrompt')}</Caption>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    gap: Spacing.md,
  },
  itemWrapper: {
    alignItems: 'center',
    width: 60,
  },
  addAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFriendDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  nameText: {
    textAlign: 'center',
    fontSize: 12,
  },
  emptyPrompt: {
    justifyContent: 'center',
    paddingLeft: Spacing.sm,
  },
});
