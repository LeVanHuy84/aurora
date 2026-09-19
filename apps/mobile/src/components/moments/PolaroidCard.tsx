import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { useToggleReaction } from '../../hooks/use-moments';
import { Title, Body, Caption, Label } from '../ui/Typography';
import { MomentItem, Visibility, MomentType } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface PolaroidCardProps {
  moment: MomentItem;
  onPress?: () => void;
  onCommentPress?: () => void;
}

export function PolaroidCard({ moment, onPress, onCommentPress }: PolaroidCardProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const toggleReaction = useToggleReaction();

  const user = moment.user;
  const emotion = moment.emotion;
  const reactionsCount = moment.reactionsCount ?? moment._count?.reactions ?? 0;
  const commentsCount = moment.commentsCount ?? moment._count?.comments ?? 0;
  const hasReacted = moment.hasReacted ?? false;

  // Format time (e.g., "12:30 PM" or "14:20")
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleReactionPress = () => {
    toggleReaction.mutate({
      momentId: moment.id,
      hasReacted,
    });
  };

  const renderVisibilityBadge = () => {
    switch (moment.visibility) {
      case Visibility.CLOSE_FRIENDS:
        return (
          <View style={[styles.badge, { backgroundColor: isDark ? '#1C382F' : '#E8F5E9' }]}>
            <Ionicons name="lock-closed" size={11} color={colors.closeFriends} />
            <Caption color={colors.closeFriends} weight="semibold" style={styles.badgeText}>
              {t('moments.closeFriends')}
            </Caption>
          </View>
        );
      case Visibility.FRIENDS:
        return (
          <View style={[styles.badge, { backgroundColor: colors.surfaceSoft }]}>
            <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
            <Caption color="secondary" weight="medium" style={styles.badgeText}>
              {t('moments.friends')}
            </Caption>
          </View>
        );
      case Visibility.ONLY_ME:
        return (
          <View style={[styles.badge, { backgroundColor: colors.surfaceSoft }]}>
            <Ionicons name="lock-closed-outline" size={11} color={colors.textMuted} />
            <Caption color="muted" weight="medium" style={styles.badgeText}>
              {t('moments.onlyMe')}
            </Caption>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* 1. Header: Avatar, Display Name, Time, Mood Pill */}
      <View style={styles.headerRow}>
        <View style={styles.userInfo}>
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: colors.accent, borderColor: colors.cardBorder },
              ]}
            >
              <Title level={3} color="white" style={styles.avatarLetter}>
                {(user?.displayName || user?.username || 'A')[0].toUpperCase()}
              </Title>
            </View>
          )}

          <View style={styles.userText}>
            <Body weight="bold" color="primary" numberOfLines={1}>
              {user?.displayName || user?.username || 'User'}
            </Body>
            <Caption color="muted">{formatTime(moment.createdAt)}</Caption>
          </View>
        </View>

        {/* Mood Pill */}
        {emotion && (
          <View
            style={[
              styles.moodPill,
              {
                backgroundColor: isDark ? '#2C2926' : '#FFF5EB',
                borderColor: emotion.color || colors.accent,
              },
            ]}
          >
            <Label style={styles.moodIcon}>{emotion.icon || '✨'}</Label>
            <Caption color={emotion.color || colors.accentDark} weight="semibold">
              {emotion.label}
            </Caption>
          </View>
        )}
      </View>

      {/* 2. Photo Section (1:1 Ratio Polaroid Style) */}
      {moment.type === MomentType.PHOTO && moment.imageUrl && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: moment.imageUrl }}
            style={styles.photo}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        </View>
      )}

      {/* 3. Note / Caption Content */}
      {moment.content ? (
        <View style={styles.contentSection}>
          <Body
            color="primary"
            style={[
              styles.contentText,
              moment.type === MomentType.NOTE ? styles.noteSpecialText : undefined,
            ]}
          >
            {moment.content}
          </Body>
        </View>
      ) : null}

      {/* 4. Bottom Actions: Reaction, Comment, Visibility */}
      <View style={[styles.bottomBar, { borderTopColor: colors.divider }]}>
        <View style={styles.actionsLeft}>
          {/* Reaction Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleReactionPress}
            style={styles.actionBtn}
          >
            <Ionicons
              name={hasReacted ? 'heart' : 'heart-outline'}
              size={20}
              color={hasReacted ? colors.danger : colors.textSecondary}
            />
            {reactionsCount > 0 && (
              <Caption
                weight="semibold"
                color={hasReacted ? colors.danger : 'secondary'}
                style={styles.actionCount}
              >
                {reactionsCount}
              </Caption>
            )}
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onCommentPress || onPress}
            style={styles.actionBtn}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            {commentsCount > 0 && (
              <Caption weight="semibold" color="secondary" style={styles.actionCount}>
                {commentsCount}
              </Caption>
            )}
          </TouchableOpacity>
        </View>

        {/* Visibility Badge */}
        {renderVisibilityBadge()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm + 2,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  avatarLetter: {
    fontSize: 16,
  },
  userText: {
    flex: 1,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  moodIcon: {
    fontSize: 13,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: '#F0ECE4',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    marginBottom: Spacing.md,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  noteSpecialText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm + 2,
    borderTopWidth: 1,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md + 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
  },
});
