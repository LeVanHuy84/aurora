import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useMomentInteractions } from '../../hooks/use-interactions';

export interface MomentAuthorInteractionBarProps {
  momentId: string;
  reactionsCount: number;
  messagesCount: number;
  onOpenInteractionsSheet: () => void;
  onOpenChatWithFriend: (conversationId: string, friend: any) => void;
}

export function MomentAuthorInteractionBar({
  momentId,
  reactionsCount,
  messagesCount,
  onOpenInteractionsSheet,
  onOpenChatWithFriend,
}: MomentAuthorInteractionBarProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const { data } = useMomentInteractions(momentId);

  const reactions = data?.reactions || [];
  const threads = data?.threads || [];
  const latestThread = threads[0] || null;

  const getEmojiIcon = (type: string) => {
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

  return (
    <View style={styles.container}>
      {/* ROW 1: REACTIONS AVATARS STRIP */}
      <TouchableOpacity
        style={[
          styles.rowBar,
          {
            backgroundColor: isDark ? '#242220' : '#F5F2EB',
            borderColor: colors.cardBorder,
          },
        ]}
        activeOpacity={0.75}
        onPress={onOpenInteractionsSheet}
      >
        <View style={styles.reactionsLeft}>
          {reactions.length > 0 ? (
            <View style={styles.avatarStack}>
              {reactions.slice(0, 4).map((reaction, index) => (
                <View
                  key={reaction.id}
                  style={[
                    styles.avatarBadgeWrapper,
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
                      <Caption
                        color="white"
                        weight="bold"
                        style={{ fontSize: 10 }}
                      >
                        {(
                          reaction.user?.displayName ||
                          reaction.user?.username ||
                          'U'
                        )[0].toUpperCase()}
                      </Caption>
                    </View>
                  )}
                  <View style={styles.miniEmojiBadge}>
                    <Caption style={{ fontSize: 9 }}>
                      {getEmojiIcon(reaction.type)}
                    </Caption>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Ionicons name="heart-outline" size={18} color={colors.accentDark} />
          )}

          <Body weight="semibold" color="primary" style={styles.reactionsText}>
            {reactionsCount > 0
              ? `${reactionsCount} ${t('chat.reactionsCount', 'cảm xúc')}`
              : t('chat.noReactionsYet', 'Chưa có cảm xúc nào')}
          </Body>
        </View>

        <View style={styles.sheetArrow}>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* ROW 2: QUICK REPLY BAR */}
      <TouchableOpacity
        style={[
          styles.rowBar,
          {
            backgroundColor: isDark ? '#242220' : '#F5F2EB',
            borderColor: colors.cardBorder,
          },
        ]}
        activeOpacity={0.75}
        onPress={() => {
          if (latestThread) {
            onOpenChatWithFriend(latestThread.conversationId, latestThread.friend);
          } else {
            onOpenInteractionsSheet();
          }
        }}
      >
        <View style={styles.replyLeft}>
          <Ionicons
            name="chatbubble-ellipses"
            size={18}
            color={colors.accentDark}
            style={{ marginRight: 6 }}
          />
          {latestThread ? (
            <View style={styles.threadSnippet}>
              <Body
                weight="bold"
                color="primary"
                numberOfLines={1}
                style={{ fontSize: 14 }}
              >
                {latestThread.friend?.displayName || latestThread.friend?.username}:
              </Body>
              <Caption
                color="secondary"
                numberOfLines={1}
                style={styles.snippetContent}
              >
                {latestThread.lastMessage?.content || t('chat.sentMomentReply', 'Đã phản hồi')}
              </Caption>
            </View>
          ) : (
            <Caption color="secondary" style={styles.noMessagesText}>
              {t('chat.noRepliesYet', 'Chưa có tin nhắn riêng nào')}
            </Caption>
          )}
        </View>

        <View
          style={[
            styles.actionButton,
            { backgroundColor: colors.accentDark },
          ]}
        >
          <Caption color="white" weight="bold" style={{ fontSize: 13 }}>
            {latestThread ? t('chat.reply', 'Trả lời') : t('chat.viewInteractions', 'Xem')}
          </Caption>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs + 2,
    marginTop: Spacing.xs,
  },
  rowBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    height: 50,
    paddingHorizontal: Spacing.md,
  },
  reactionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 4,
    flex: 1,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadgeWrapper: {
    position: 'relative',
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  miniAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  miniEmojiBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    width: 13,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionsText: {
    fontSize: 14.5,
  },
  sheetArrow: {
    marginLeft: Spacing.xs,
  },
  replyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.xs,
  },
  threadSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  snippetContent: {
    fontSize: 13.5,
    flex: 1,
  },
  noMessagesText: {
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
});
