import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { useToggleReaction } from '../../hooks/use-moments';
import { Body, Caption, Label, Title } from '../ui/Typography';
import { MomentItem, MomentType } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';
import { QuickCommentModal } from './QuickCommentModal';

export interface MomentSlideProps {
  height: number;
  moment: MomentItem;
  onUserPress?: (userId: string) => void;
}

export function MomentSlide({
  height,
  moment,
  onUserPress,
}: MomentSlideProps) {
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
      const diffInMinutes = Math.floor(
        (now.getTime() - past.getTime()) / (1000 * 60),
      );

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
    <View style={[styles.slideContainer, { height }]}>
      <View style={styles.cardWrapper}>
        {/* 2. MAIN SQUARE MOMENT CANVAS (1:1 Ratio) */}
        <View style={styles.momentCanvasWrapper}>
          {moment.type === MomentType.PHOTO && moment.imageUrl ? (
            <View style={styles.photoSquareContainer}>
              <Image
                source={{ uri: moment.imageUrl }}
                style={styles.photo}
                contentFit="cover"
                transition={300}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              />

              {/* Floating Caption on photo (Locket style) */}
              {moment.content ? (
                <View style={styles.floatingCaption}>
                  <Caption
                    color="white"
                    weight="semibold"
                    style={styles.captionText}
                  >
                    {moment.content}
                  </Caption>
                </View>
              ) : null}
            </View>
          ) : null}

          {moment.type === MomentType.NOTE ? (
            <View
              style={[
                styles.noteSquareContainer,
                {
                  backgroundColor: isDark ? '#262320' : '#FDF7EE',
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.noteHeader}>
                <Ionicons
                  name="document-text"
                  size={20}
                  color={colors.accentDark}
                />
                <Body weight="bold" color="primary" style={{ fontSize: 16 }}>
                  {t('moments.note', 'Ghi chú')}
                </Body>
              </View>
              <Body color="primary" style={styles.noteText}>
                "{moment.content}"
              </Body>
            </View>
          ) : null}

          {moment.type === MomentType.MOOD ? (
            <View
              style={[
                styles.moodSquareContainer,
                {
                  backgroundColor: isDark ? '#262320' : '#FFF9F2',
                  borderColor: emotion?.color || colors.accent,
                },
              ]}
            >
              <Label style={styles.moodEmoji}>{emotion?.icon || '✨'}</Label>
              <Title level={2} style={styles.moodTitle}>
                {emotion?.label || t('moments.mood', 'Cảm xúc')}
              </Title>
              {moment.content ? (
                <Body color="secondary" style={styles.moodContentText}>
                  {moment.content}
                </Body>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* 3. POST META (Avatar + Tên tác giả + Thời gian sát dưới ảnh, to & căn giữa) */}
        <View style={styles.postMetaRow}>
          <TouchableOpacity
            style={styles.metaUserGroup}
            activeOpacity={0.8}
            onPress={() => user?.id && onUserPress?.(user.id)}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.metaAvatar}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.metaAvatarFallback,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Caption color="white" weight="bold" style={{ fontSize: 15 }}>
                  {(user?.displayName ||
                    user?.username ||
                    'U')[0].toUpperCase()}
                </Caption>
              </View>
            )}

            <Body weight="bold" color="primary" style={styles.metaUsername}>
              {user?.displayName || user?.username || 'User'}
            </Body>

            <Caption color="muted" style={styles.metaTime}>
              · {formatTimeAgo(moment.createdAt)}
            </Caption>

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
                <Caption style={styles.metaEmotionIcon}>
                  {emotion.icon || '✨'}
                </Caption>
                <Caption
                  color={emotion.color || colors.accentDark}
                  weight="semibold"
                  style={{ fontSize: 13 }}
                >
                  {emotion.label}
                </Caption>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 4. BOTTOM COMMENT & REACTION BAR (Tăng chiều cao, giao diện tối giản tinh tế) */}
        <View
          style={[
            styles.commentBar,
            {
              backgroundColor: isDark ? '#242220' : '#F5F2EB',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.commentPlaceholderBtn}
            activeOpacity={0.7}
            onPress={() => setCommentModalVisible(true)}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Body color="secondary" style={styles.placeholderText}>
              {t('moments.sendMessagePlaceholder', 'Gửi tin nhắn...')}
            </Body>
          </TouchableOpacity>

          <View style={styles.reactionsGroup}>
            {['🔥', '💛', '🥰', '❤️', '✨'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionBtn}
                activeOpacity={0.6}
                onPress={() => handleQuickReaction(emoji)}
              >
                <Body style={styles.reactionEmoji}>{emoji}</Body>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Quick Comment Modal Dialog */}
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
  slideContainer: {
    width: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    justifyContent: 'center',
  },
  momentCanvasWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSquareContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EAE6DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  photo: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  captionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  noteSquareContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: Spacing.xl,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  noteText: {
    fontSize: 19,
    lineHeight: 29,
    fontStyle: 'italic',
  },
  moodSquareContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 28,
    borderWidth: 2,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  moodEmoji: {
    fontSize: 68,
    lineHeight: 78,
  },
  moodTitle: {
    marginTop: Spacing.sm,
    fontSize: 24,
  },
  moodContentText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  metaUserGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  metaAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  metaAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaUsername: {
    fontSize: 17.5,
    fontWeight: '700',
  },
  metaTime: {
    fontSize: 14.5,
  },
  metaEmotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  metaEmotionIcon: {
    fontSize: 13,
  },
  commentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    height: 56,
  },
  commentPlaceholderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14.5,
  },
  reactionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionBtn: {
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  reactionEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
});
