import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { MomentItem, MomentType, ReactionType, Visibility } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';
import { getEmotionLabel } from '../../utils/emotion';
import { useAuth } from '../../hooks/use-auth';
import { useMomentInteractions, useReactMoment } from '../../hooks/use-interactions';
import { chatService } from '../../services/modules/chat.service';
import { MomentInteractionsSheet } from '../moments/MomentInteractionsSheet';

export interface MomentDetailModalProps {
  visible: boolean;
  moment: MomentItem | null;
  onClose: () => void;
}

const QUICK_REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: ReactionType.LOVE, emoji: '❤️', label: 'Yêu thích' },
  { type: ReactionType.PROUD, emoji: '🔥', label: 'Ấn tượng' },
  { type: ReactionType.CARE, emoji: '🥰', label: 'Ấm áp' },
  { type: ReactionType.RELATABLE, emoji: '💛', label: 'Đồng cảm' },
  { type: ReactionType.FUNNY, emoji: '✨', label: 'Tỏa sáng' },
];

export function MomentDetailModal({
  visible,
  moment,
  onClose,
}: MomentDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [interactionsSheetVisible, setInteractionsSheetVisible] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  const reactMomentMutation = useReactMoment();
  const { data: interactionsData } = useMomentInteractions(
    moment?.id,
    visible && !!moment?.id,
  );

  if (!moment) return null;

  const isOwner = currentUser?.id === moment.userId;
  const reactionsCount = moment.reactionsCount ?? moment._count?.reactions ?? 0;
  const messagesCount = moment.messagesCount ?? moment._count?.messages ?? 0;
  const hasReacted = moment.hasReacted ?? false;
  const userReactionType = moment.userReactionType;

  const reactions = interactionsData?.reactions || [];
  const threads = interactionsData?.threads || [];
  const latestThread = threads[0] || null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} lúc ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '';
    }
  };

  const getVisibilityLabel = (visibility?: Visibility) => {
    switch (visibility) {
      case Visibility.CLOSE_FRIENDS:
        return t('moments.closeFriends', 'Bạn thân');
      case Visibility.FRIENDS:
        return t('moments.friends', 'Bạn bè');
      default:
        return t('moments.onlyMe', 'Chỉ mình tôi');
    }
  };

  const baseEmotionColor = moment.emotion?.color || colors.accent;

  const getReactionEmoji = (type?: string) => {
    switch (type) {
      case 'LOVE':
        return '❤️';
      case 'PROUD':
        return '🔥';
      case 'CARE':
        return '🥰';
      case 'RELATABLE':
        return '💛';
      case 'FUNNY':
        return '✨';
      default:
        return '✨';
    }
  };

  const handleQuickReaction = (targetType: ReactionType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }

    const isAlreadyThisReaction = hasReacted && userReactionType === targetType;

    if (isAlreadyThisReaction) {
      reactMomentMutation.mutate({
        momentId: moment.id,
        remove: true,
      });
    } else {
      reactMomentMutation.mutate({
        momentId: moment.id,
        type: targetType,
        remove: false,
      });
    }
  };

  const handleOpenDirectChat = async () => {
    if (!moment.userId || isOpeningChat) return;

    try {
      setIsOpeningChat(true);
      const conversation = await chatService.getOrCreateDirectConversation(moment.userId);
      onClose();
      router.push({
        pathname: '/chat/[id]',
        params: {
          id: conversation.id,
          friendName: moment.user?.displayName || moment.user?.username,
          friendAvatar: moment.user?.avatarUrl || '',
          quotedMomentId: moment.id,
          quotedMomentType: moment.type,
          quotedMomentImage: moment.imageUrl || '',
          quotedMomentContent: moment.content || '',
        },
      });
    } catch (error) {
      console.error('Failed to open chat:', error);
    } finally {
      setIsOpeningChat(false);
    }
  };

  const handleOpenThreadChat = (conversationId: string, friend: any) => {
    onClose();
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: conversationId,
        friendName: friend?.displayName || friend?.username,
        friendAvatar: friend?.avatarUrl || '',
        quotedMomentId: moment.id,
        quotedMomentType: moment.type,
        quotedMomentImage: moment.imageUrl || '',
        quotedMomentContent: moment.content || '',
      },
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header Bar */}
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
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Title level={3} style={styles.headerTitle}>
              {t('memories.momentDetail', 'Chi tiết khoảnh khắc')}
            </Title>
            {moment.user && !isOwner && (
              <Caption color="muted" numberOfLines={1}>
                {moment.user.displayName || moment.user.username}
              </Caption>
            )}
          </View>

          <View style={styles.placeholderBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xl * 2 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Metadata Bar */}
          <View style={styles.metaHeader}>
            <View style={styles.dateGroup}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Caption color="secondary" style={styles.dateText}>
                {formatDate(moment.createdAt)}
              </Caption>
            </View>

            <View
              style={[
                styles.visibilityBadge,
                {
                  backgroundColor:
                    moment.visibility === Visibility.CLOSE_FRIENDS
                      ? isDark
                        ? '#172B25'
                        : '#E8F5F1'
                      : colors.surfaceSoft,
                },
              ]}
            >
              <Ionicons
                name={
                  moment.visibility === Visibility.CLOSE_FRIENDS
                    ? 'star'
                    : moment.visibility === Visibility.FRIENDS
                    ? 'people'
                    : 'lock-closed'
                }
                size={12}
                color={
                  moment.visibility === Visibility.CLOSE_FRIENDS
                    ? colors.closeFriends
                    : colors.textSecondary
                }
              />
              <Caption
                weight="bold"
                style={{
                  fontSize: 11,
                  color:
                    moment.visibility === Visibility.CLOSE_FRIENDS
                      ? colors.closeFriends
                      : colors.textSecondary,
                }}
              >
                {getVisibilityLabel(moment.visibility)}
              </Caption>
            </View>
          </View>

          {/* Main Visual Content */}
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {moment.type === MomentType.PHOTO && moment.imageUrl ? (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: moment.imageUrl }}
                  style={styles.fullPhoto}
                  contentFit="cover"
                />
              </View>
            ) : moment.type === MomentType.MOOD ? (
              <View
                style={[
                  styles.moodContainer,
                  {
                    backgroundColor: isDark ? '#2E2721' : '#FFF6EB',
                    borderColor: baseEmotionColor,
                  },
                ]}
              >
                <Caption style={styles.moodLargeEmoji}>
                  {moment.emotion?.icon || '✨'}
                </Caption>
                <Title level={1} style={[styles.moodLargeTitle, { color: colors.textPrimary }]}>
                  {getEmotionLabel(moment.emotion, t) || t('moments.mood', 'Cảm xúc')}
                </Title>
              </View>
            ) : (
              <View
                style={[
                  styles.noteContainer,
                  {
                    backgroundColor: isDark ? '#2B2621' : '#FBF7EF',
                  },
                ]}
              >
                <Ionicons
                  name="document-text"
                  size={24}
                  color={colors.accentDark}
                  style={{ marginBottom: Spacing.sm }}
                />
                <Body style={styles.noteLargeText}>
                  "{moment.content}"
                </Body>
              </View>
            )}

            {/* Emotion & Content Details */}
            <View style={styles.cardBody}>
              {moment.emotion && (
                <View
                  style={[
                    styles.emotionDetailPill,
                    {
                      backgroundColor: isDark ? '#332B24' : '#FFF3E5',
                      borderColor: baseEmotionColor,
                    },
                  ]}
                >
                  <Caption style={{ fontSize: 16, lineHeight: 20 }}>{moment.emotion.icon}</Caption>
                  <Body
                    weight="bold"
                    style={{
                      fontSize: 14,
                      color: baseEmotionColor,
                    }}
                  >
                    {getEmotionLabel(moment.emotion, t)}
                  </Body>
                </View>
              )}

              {moment.content && moment.type !== MomentType.NOTE && (
                <Body color="primary" style={styles.captionText}>
                  {moment.content}
                </Body>
              )}

              {/* Interactions counter (Reactions & Direct Messages) */}
              <View style={[styles.interactionsBar, { borderTopColor: colors.divider }]}>
                <View style={styles.counterItem}>
                  <Caption style={{ fontSize: 16, lineHeight: 20 }}>❤️</Caption>
                  <Caption weight="bold" color="primary">
                    {reactionsCount} {t('chat.reactionsCount', 'cảm xúc')}
                  </Caption>
                </View>
                <View style={styles.counterItem}>
                  <Caption style={{ fontSize: 16, lineHeight: 20 }}>💬</Caption>
                  <Caption weight="bold" color="primary">
                    {messagesCount} {t('chat.repliesCount', 'tin nhắn')}
                  </Caption>
                </View>
              </View>
            </View>
          </View>

          {/* Section: Interactive Actions (Author vs Viewer) */}
          <View style={styles.interactiveSection}>
            {isOwner ? (
              /* Author View: Detailed Breakdown & Open Interactions Sheet */
              <View
                style={[
                  styles.authorInteractionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.interactionSectionHeader}>
                  <Title level={3} style={{ fontSize: 15 }}>
                    {t('memories.interactionsOverview', 'Tương tác & Phản hồi')}
                  </Title>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setInteractionsSheetVisible(true)}
                  >
                    <Caption weight="bold" style={{ color: colors.accentDark }}>
                      {t('memories.viewAllInteractions', 'Xem tất cả')} →
                    </Caption>
                  </TouchableOpacity>
                </View>

                {/* 1. Reactions Avatar Stack */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setInteractionsSheetVisible(true)}
                  style={[
                    styles.authorRowItem,
                    { backgroundColor: isDark ? '#26221E' : '#F8F4EC' },
                  ]}
                >
                  <View style={styles.authorRowLeft}>
                    {reactions.length > 0 ? (
                      <View style={styles.avatarStack}>
                        {reactions.slice(0, 4).map((reaction, index) => (
                          <View
                            key={reaction.id}
                            style={[
                              styles.miniAvatarWrapper,
                              { marginLeft: index > 0 ? -10 : 0, zIndex: 10 - index },
                            ]}
                          >
                            {reaction.user?.avatarUrl ? (
                              <Image
                                source={{ uri: reaction.user.avatarUrl }}
                                style={styles.miniAvatar}
                                contentFit="cover"
                              />
                            ) : (
                              <View
                                style={[
                                  styles.miniAvatarFallback,
                                  { backgroundColor: colors.accent },
                                ]}
                              >
                                <Caption color="white" weight="bold" style={{ fontSize: 9 }}>
                                  {(reaction.user?.displayName || 'U')[0].toUpperCase()}
                                </Caption>
                              </View>
                            )}
                            <View style={styles.miniEmojiBadge}>
                              <Caption style={{ fontSize: 8 }}>
                                {getReactionEmoji(reaction.type)}
                              </Caption>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Ionicons name="heart-outline" size={18} color={colors.accentDark} />
                    )}

                    <Body weight="medium" color="primary" style={{ fontSize: 13.5 }}>
                      {reactionsCount > 0
                        ? `${reactionsCount} bạn bè đã gửi cảm xúc`
                        : t('chat.noReactionsYet', 'Chưa có cảm xúc nào')}
                    </Body>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* 2. Direct Messages / Threads Row */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (latestThread) {
                      handleOpenThreadChat(latestThread.conversationId, latestThread.friend);
                    } else {
                      setInteractionsSheetVisible(true);
                    }
                  }}
                  style={[
                    styles.authorRowItem,
                    { backgroundColor: isDark ? '#26221E' : '#F8F4EC' },
                  ]}
                >
                  <View style={styles.authorRowLeft}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={18}
                      color={colors.accentDark}
                    />
                    {latestThread ? (
                      <View style={{ flex: 1 }}>
                        <Body
                          weight="semibold"
                          color="primary"
                          numberOfLines={1}
                          style={{ fontSize: 13 }}
                        >
                          {latestThread.friend?.displayName || latestThread.friend?.username}
                        </Body>
                        <Caption
                          color="secondary"
                          numberOfLines={1}
                          style={{ fontSize: 12 }}
                        >
                          {latestThread.lastMessage?.content || t('chat.sentMomentReply', 'Đã phản hồi')}
                        </Caption>
                      </View>
                    ) : (
                      <Caption color="secondary" style={{ fontSize: 13 }}>
                        {t('chat.noRepliesYet', 'Chưa có tin nhắn riêng nào')}
                      </Caption>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              /* Viewer View: Quick Reaction Picker & 1-1 Chat Reply Action */
              <View
                style={[
                  styles.viewerInteractionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Title level={3} style={styles.viewerTitle}>
                  {t('moments.reactTitle', 'Bày tỏ cảm xúc')}
                </Title>

                {/* Quick Emojis Bar */}
                <View style={styles.quickReactionsRow}>
                  {QUICK_REACTIONS.map((item) => {
                    const isSelected = hasReacted && userReactionType === item.type;
                    return (
                      <TouchableOpacity
                        key={item.type}
                        activeOpacity={0.7}
                        onPress={() => handleQuickReaction(item.type)}
                        style={[
                          styles.reactionButton,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? '#3D2F24'
                                : '#FFEBD8'
                              : colors.surfaceSoft,
                            borderColor: isSelected ? colors.accent : colors.cardBorder,
                          },
                        ]}
                      >
                        <Caption style={styles.reactionEmoji}>{item.emoji}</Caption>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 1-1 Reply Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isOpeningChat}
                  onPress={handleOpenDirectChat}
                  style={[
                    styles.replyDirectBtn,
                    { backgroundColor: colors.accentDark },
                  ]}
                >
                  {isOpeningChat ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                      <Body weight="bold" color="white" style={{ fontSize: 14 }}>
                        {t('memories.replyViaChat', 'Nhắn tin phản hồi riêng')}
                      </Body>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Sheet for Moment Interactions (Author) */}
        <MomentInteractionsSheet
          visible={interactionsSheetVisible}
          momentId={moment.id}
          onClose={() => setInteractionsSheetVisible(false)}
        />
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  placeholderBtn: {
    width: 36,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  cardContainer: {
    borderRadius: 24,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  moodContainer: {
    paddingVertical: Spacing.xl * 1.5,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  moodLargeEmoji: {
    fontSize: 64,
    lineHeight: 74,
    marginBottom: Spacing.xs,
  },
  moodLargeTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  noteContainer: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    minHeight: 180,
    justifyContent: 'center',
  },
  noteLargeText: {
    fontSize: 17,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  cardBody: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emotionDetailPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.2,
  },
  captionText: {
    fontSize: 15.5,
    lineHeight: 23,
  },
  interactionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interactiveSection: {
    marginTop: Spacing.lg,
  },
  authorInteractionCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  interactionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  authorRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 14,
  },
  authorRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatarWrapper: {
    position: 'relative',
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  miniAvatarFallback: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  miniEmojiBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerInteractionCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  viewerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  quickReactionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm + 2,
    width: '100%',
  },
  reactionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  replyDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
});
