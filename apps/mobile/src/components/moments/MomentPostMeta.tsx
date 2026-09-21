import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { EmotionItem, FriendUser, MomentType, UserProfile, Visibility } from '@aurora/types';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { MomentVisibilityBadge } from './MomentVisibilityBadge';
import { getEmotionLabel } from '../../utils/emotion';
import { formatTimeAgo } from '../../utils/date';
import { Ionicons } from '../common/Icon';

export interface MomentPostMetaProps {
  user?: UserProfile | FriendUser;
  createdAt: string;
  visibility: Visibility;
  emotion?: EmotionItem | null;
  momentType: MomentType;
  isOwner?: boolean;
  onUserPress?: (userId: string) => void;
  onDeletePress?: () => void;
}

export function MomentPostMeta({
  user,
  createdAt,
  visibility,
  emotion,
  momentType,
  isOwner = false,
  onUserPress,
  onDeletePress,
}: MomentPostMetaProps) {
  const { colors, isDark } = useAppTheme();
  const { t, i18n } = useTranslation();

  const isVi = (i18n.language || 'vi').startsWith('vi');
  const timeAgoText = formatTimeAgo(createdAt, isVi);

  return (
    <View style={styles.container}>
      {/* Left: User Avatar & Name & Time */}
      <TouchableOpacity
        style={styles.userGroup}
        activeOpacity={0.8}
        onPress={() => user?.id && onUserPress?.(user.id)}
      >
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
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
            <Caption color="white" weight="bold" style={{ fontSize: 14 }}>
              {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
            </Caption>
          </View>
        )}

        <View style={styles.nameTimeRow}>
          <Body weight="bold" color="primary" style={styles.username}>
            {user?.displayName || user?.username || 'User'}
          </Body>
          <Caption color="muted" style={styles.timeText}>
            · {timeAgoText}
          </Caption>
        </View>
      </TouchableOpacity>

      {/* Right: Badges (Visibility + Emotion + Options Menu) */}
      <View style={styles.badgesGroup}>
        <MomentVisibilityBadge visibility={visibility} />

        {emotion && momentType !== MomentType.MOOD && (
          <View
            style={[
              styles.emotionPill,
              {
                backgroundColor: isDark ? '#2C2926' : '#FFF5EB',
                borderColor: emotion.color || colors.accent,
              },
            ]}
          >
            <Caption style={styles.emotionIcon}>
              {emotion.icon || '✨'}
            </Caption>
            <Caption
              color={emotion.color || colors.accentDark}
              weight="semibold"
              style={{ fontSize: 11.5 }}
            >
              {getEmotionLabel(emotion, t)}
            </Caption>
          </View>
        )}

        {isOwner && onDeletePress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDeletePress}
            style={[
              styles.deleteBtn,
              { backgroundColor: isDark ? '#3D2424' : '#FDE8E8' },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={14} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm + 2,
    marginBottom: Spacing.xs,
    paddingHorizontal: 2,
  },
  userGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
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
  nameTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  username: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 3,
  },
  emotionIcon: {
    fontSize: 11.5,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
