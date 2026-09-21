import React from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Caption, Title } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useMomentInteractions } from '../../hooks/use-interactions';
import { MomentInteractionThread, ReactionItem } from '@aurora/types';

export interface MomentInteractionsSheetProps {
  visible: boolean;
  momentId?: string;
  onClose: () => void;
}

export function MomentInteractionsSheet({
  visible,
  momentId,
  onClose,
}: MomentInteractionsSheetProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useMomentInteractions(momentId, visible);

  const handleOpenChat = (conversationId: string) => {
    onClose();
    router.push({
      pathname: '/chat/[id]',
      params: { id: conversationId },
    });
  };

  const getEmojiIcon = (type: string) => {
    if (!type) return '❤️';
    switch (type) {
      case 'LOVE':
        return '❤️';
      case 'FUNNY':
        return '😂';
      case 'CARE':
        return '🥰';
      case 'PROUD':
      case 'FIRE':
        return '🔥';
      case 'RELATABLE':
        return '💛';
      default:
        return type;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
              {/* Drag Handle Indicator */}
              <View style={styles.handleIndicator} />

              {/* Header */}
              <View style={styles.header}>
                <Title level={3} color="primary" weight="bold">
                  {t('chat.interactionsTitle', 'Tương tác khoảnh khắc')}
                </Title>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.accentDark} />
                </View>
              ) : (
                <ScrollView
                  style={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* 1. REACTIONS SECTION */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="heart" size={16} color={colors.accentDark} />
                      <Caption weight="bold" color="secondary">
                        {t('chat.reactions', 'Cảm xúc')} ({data?.reactions?.length || 0})
                      </Caption>
                    </View>

                    {data?.reactions && data.reactions.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.reactionsRow}
                      >
                        {data.reactions.map((reaction: ReactionItem) => (
                          <View key={reaction.id} style={styles.reactionUserItem}>
                            <View style={styles.avatarWrapper}>
                              {reaction.user?.avatarUrl ? (
                                <Image
                                  source={{ uri: reaction.user.avatarUrl }}
                                  style={styles.reactionAvatar}
                                  contentFit="cover"
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.reactionAvatarFallback,
                                    { backgroundColor: colors.accent },
                                  ]}
                                >
                                  <Caption color="white" weight="bold">
                                    {(
                                      reaction.user?.displayName ||
                                      reaction.user?.username ||
                                      'U'
                                    )[0].toUpperCase()}
                                  </Caption>
                                </View>
                              )}
                              <View style={styles.emojiBadge}>
                                <Caption style={styles.emojiBadgeText}>
                                  {getEmojiIcon(reaction.type)}
                                </Caption>
                              </View>
                            </View>
                            <Caption
                              numberOfLines={1}
                              color="primary"
                              style={styles.reactionUsername}
                            >
                              {reaction.user?.displayName || reaction.user?.username}
                            </Caption>
                          </View>
                        ))}
                      </ScrollView>
                    ) : (
                      <View
                        style={[
                          styles.emptyBox,
                          { backgroundColor: colors.surfaceSoft },
                        ]}
                      >
                        <Caption color="muted">
                          {t('chat.noReactionsYet', 'Chưa có cảm xúc nào')}
                        </Caption>
                      </View>
                    )}
                  </View>

                  {/* 2. DIRECT REPLIES THREADS SECTION */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={16}
                        color={colors.accentDark}
                      />
                      <Caption weight="bold" color="secondary">
                        {t('chat.privateMessages', 'Tin nhắn & phản hồi riêng')} ({data?.threads?.length || 0})
                      </Caption>
                    </View>

                    {data?.threads && data.threads.length > 0 ? (
                      <View style={styles.threadsList}>
                        {data.threads.map((thread: MomentInteractionThread) => (
                          <TouchableOpacity
                            key={thread.conversationId}
                            style={[
                              styles.threadCard,
                              {
                                backgroundColor: colors.surfaceSoft,
                                borderColor: colors.cardBorder,
                              },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handleOpenChat(thread.conversationId)}
                          >
                            <View style={styles.threadAvatarContainer}>
                              {thread.friend?.avatarUrl ? (
                                <Image
                                  source={{ uri: thread.friend.avatarUrl }}
                                  style={styles.threadAvatar}
                                  contentFit="cover"
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.threadAvatarFallback,
                                    { backgroundColor: colors.accent },
                                  ]}
                                >
                                  <Caption color="white" weight="bold">
                                    {(
                                      thread.friend?.displayName ||
                                      thread.friend?.username ||
                                      'U'
                                    )[0].toUpperCase()}
                                  </Caption>
                                </View>
                              )}
                            </View>

                            <View style={styles.threadInfo}>
                              <Body weight="bold" color="primary" style={{ fontSize: 16.5 }}>
                                {thread.friend?.displayName || thread.friend?.username}
                              </Body>
                              <Caption
                                numberOfLines={1}
                                color="secondary"
                                style={styles.threadLastMessage}
                              >
                                {thread.lastMessage?.content || t('chat.sentMomentReply', 'Đã phản hồi khoảnh khắc này')}
                              </Caption>
                            </View>

                            <View
                              style={[
                                styles.replyActionBtn,
                                { backgroundColor: colors.accentDark },
                              ]}
                            >
                              <Caption color="white" weight="bold" style={{ fontSize: 14 }}>
                                {t('chat.reply', 'Trả lời')}
                              </Caption>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.emptyBox,
                          { backgroundColor: colors.surfaceSoft },
                        ]}
                      >
                        <Caption color="muted">
                          {t('chat.noRepliesYet', 'Chưa có tin nhắn riêng nào cho khoảnh khắc này')}
                        </Caption>
                      </View>
                    )}
                  </View>
                </ScrollView>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8C4BD',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 0,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm + 2,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  reactionUserItem: {
    alignItems: 'center',
    width: 66,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  reactionAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  reactionAvatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emojiBadgeText: {
    fontSize: 14,
  },
  reactionUsername: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  threadsList: {
    gap: Spacing.md,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md + 2,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: Spacing.md,
  },
  threadAvatarContainer: {
    position: 'relative',
  },
  threadAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  threadAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadInfo: {
    flex: 1,
    gap: 3,
  },
  threadLastMessage: {
    fontSize: 14,
  },
  replyActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  emptyBox: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
