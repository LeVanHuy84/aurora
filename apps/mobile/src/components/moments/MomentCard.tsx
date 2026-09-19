import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { useToggleReaction } from '../../hooks/use-moments';
import { Body, Caption, Label, Title } from '../ui/Typography';
import { MomentItem, Visibility, MomentType } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';
import { QuickCommentModal } from './QuickCommentModal';

export interface MomentCardProps {
  moment: MomentItem;
  onPress?: () => void;
  onUserPress?: (userId: string) => void;
}

export function MomentCard({
  moment,
  onPress,
  onUserPress,
}: MomentCardProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const toggleReaction = useToggleReaction();

  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const user = moment.user;
  const emotion = moment.emotion;
  const reactionsCount = moment.reactionsCount ?? moment._count?.reactions ?? 0;
  const hasReacted = moment.hasReacted ?? false;

  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) {
        return t('moments.justNow', 'Vừa xong');
      }
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
      }
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h`;
      }
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    } catch {
      return '';
    }
  };

  const handleQuickReaction = (emoji: string) => {
    toggleReaction.mutate({
      momentId: moment.id,
      hasReacted: false,
    });
  };

  const handleHeartPress = () => {
    toggleReaction.mutate({
      momentId: moment.id,
      hasReacted,
    });
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? '#1F1D1B' : '#FFFFFF',
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* 1. MOMENT CANVAS (Hình vuông chuẩn 1:1) */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress}
        style={styles.momentCanvas}
      >
        {moment.type === MomentType.PHOTO && moment.imageUrl ? (
          <View style={styles.photoSquareWrapper}>
            <Image
              source={{ uri: moment.imageUrl }}
              style={styles.momentImage}
              contentFit="cover"
              transition={300}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />

            {moment.content ? (
              <View style={styles.floatingCaption}>
                <Caption color="white" weight="semibold" style={styles.captionText}>
                  {moment.content}
                </Caption>
              </View>
            ) : null}
          </View>
        ) : null}

        {moment.type === MomentType.NOTE ? (
          <View
            style={[
              styles.noteSquareWrapper,
              {
                backgroundColor: isDark ? '#282522' : '#FDF7EE',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.noteHeaderBadge}>
              <Ionicons name="document-text" size={18} color={colors.accentDark} />
              <Body weight="bold" color="primary" style={{ fontSize: 16 }}>
                {t('moments.note', 'Ghi chú')}
              </Body>
            </View>
            <Body color="primary" style={styles.noteBodyText}>
              "{moment.content}"
            </Body>
          </View>
        ) : null}

        {moment.type === MomentType.MOOD ? (
          <View
            style={[
              styles.moodSquareWrapper,
              {
                backgroundColor: isDark ? '#282522' : '#FFF9F2',
                borderColor: emotion?.color || colors.accent,
              },
            ]}
          >
            <Label style={styles.moodEmoji}>{emotion?.icon || '✨'}</Label>
            <Title level={2} style={{ color: colors.textPrimary, marginTop: Spacing.xs }}>
              {emotion?.label || t('moments.mood', 'Cảm xúc')}
            </Title>
            {moment.content ? (
              <Body color="secondary" style={styles.moodDescText}>
                {moment.content}
              </Body>
            ) : null}
          </View>
        ) : null}
      </TouchableOpacity>

      {/* 2. POST META (Nằm sát ngay dưới Image với margin-y thông thoáng) */}
      <View style={styles.postMetaCenteredRow}>
        <TouchableOpacity
          style={styles.metaUserCentered}
          activeOpacity={0.8}
          onPress={() => user?.id && onUserPress?.(user.id)}
        >
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.metaAvatarLarge}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.metaAvatarFallbackLarge,
                { backgroundColor: colors.accent },
              ]}
            >
              <Caption color="white" weight="bold" style={{ fontSize: 14 }}>
                {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
              </Caption>
            </View>
          )}

          <Body weight="bold" color="primary" style={styles.metaUsernameLarge}>
            {user?.displayName || user?.username || 'User'}
          </Body>

          <Caption color="muted" style={styles.metaTime}>
            · {formatTimeAgo(moment.createdAt)}
          </Caption>
        </TouchableOpacity>

        {emotion && moment.type !== MomentType.MOOD && (
          <View
            style={[
              styles.metaEmotionPill,
              {
                backgroundColor: isDark ? '#2C2926' : '#FFF5EB',
                borderColor: emotion.color || colors.accent,
              },
            ]}
          >
            <Caption style={styles.metaEmotionIcon}>{emotion.icon || '✨'}</Caption>
            <Caption color={emotion.color || colors.accentDark} weight="semibold" style={{ fontSize: 11 }}>
              {emotion.label}
            </Caption>
          </View>
        )}
      </View>

      {/* 3. COMMENT & REACTION BAR */}
      <View
        style={[
          styles.commentBar,
          {
            backgroundColor: isDark ? '#2A2724' : '#F5F2EB',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.commentPlaceholderBtn}
          activeOpacity={0.7}
          onPress={() => setCommentModalVisible(true)}
        >
          <Caption color="secondary" style={styles.placeholderText}>
            {t('moments.sendMessagePlaceholder', 'Gửi tin nhắn...')}
          </Caption>
        </TouchableOpacity>

        <View style={styles.reactionsGroup}>
          {['🔥', '💛', '🥰', '✨'].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionBtn}
              activeOpacity={0.6}
              onPress={() => handleQuickReaction(emoji)}
            >
              <Body style={styles.reactionEmoji}>{emoji}</Body>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.heartBtn}
            activeOpacity={0.6}
            onPress={handleHeartPress}
          >
            <Ionicons
              name={hasReacted ? 'heart' : 'heart-outline'}
              size={22}
              color={hasReacted ? colors.danger : colors.textSecondary}
            />
            {reactionsCount > 0 && (
              <Caption
                weight="bold"
                color={hasReacted ? colors.danger : 'secondary'}
                style={styles.reactionCountText}
              >
                {reactionsCount}
              </Caption>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <QuickCommentModal
        visible={commentModalVisible}
        momentId={moment.id}
        recipientName={user?.displayName || user?.username}
        onClose={() => setCommentModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 28,
    borderWidth: 1,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  momentCanvas: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    overflow: 'hidden',
  },
  photoSquareWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EAE6DF',
  },
  momentImage: {
    width: '100%',
    height: '100%',
  },
  floatingCaption: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    alignSelf: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  noteSquareWrapper: {
    width: '100%',
    aspectRatio: 1,
    padding: Spacing.lg,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
  },
  noteHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  noteBodyText: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  moodSquareWrapper: {
    width: '100%',
    aspectRatio: 1,
    padding: Spacing.xl,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 64,
    lineHeight: 74,
  },
  moodDescText: {
    marginTop: Spacing.xs + 2,
    textAlign: 'center',
    fontSize: 15,
  },
  postMetaCenteredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: 4,
  },
  metaUserCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  metaAvatarLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  metaAvatarFallbackLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaUsernameLarge: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaTime: {
    fontSize: 13,
  },
  metaEmotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 3,
  },
  metaEmotionIcon: {
    fontSize: 11,
  },
  commentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    height: 52,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  commentPlaceholderBtn: {
    flex: 1,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
  },
  reactionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reactionBtn: {
    padding: 2,
  },
  reactionEmoji: {
    fontSize: 21,
    lineHeight: 25,
  },
  heartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  reactionCountText: {
    fontSize: 13,
  },
});
