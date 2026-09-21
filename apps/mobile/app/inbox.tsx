import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../src/components/common/ScreenContainer';
import { Ionicons } from '../src/components/common/Icon';
import { useAppTheme } from '../src/hooks/use-theme';
import { Body, Caption, Title } from '../src/components/ui/Typography';
import { Spacing, BorderRadius } from '../src/constants/theme';
import { useConversations } from '../src/hooks/use-chat';
import { useChatSocket } from '../src/hooks/use-chat-socket';
import { ConversationItem } from '@aurora/types';

interface ConversationListItemProps {
  item: ConversationItem;
  colors: any;
  isDark: boolean;
  onPress: () => void;
  timeAgoText: string;
  defaultFriendText: string;
  defaultStartedText: string;
}

const ConversationListItem = React.memo(
  function ConversationListItem({
    item,
    colors,
    isDark,
    onPress,
    timeAgoText,
    defaultFriendText,
    defaultStartedText,
  }: ConversationListItemProps) {
    const friend = item.friend;
    const hasUnread = (item.unreadCount || 0) > 0;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.conversationItem,
          {
            backgroundColor: hasUnread
              ? isDark
                ? '#2B2620'
                : '#FFFDF9'
              : colors.card,
            borderColor: hasUnread ? colors.accent : colors.cardBorder,
          },
        ]}
        onPress={onPress}
      >
        <View style={styles.avatarContainer}>
          {friend?.avatarUrl ? (
            <Image
              source={{ uri: friend.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={100}
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: colors.accent },
              ]}
            >
              <Caption color="white" weight="bold" style={{ fontSize: 16 }}>
                {(friend?.displayName || friend?.username || 'U')[0].toUpperCase()}
              </Caption>
            </View>
          )}
          {hasUnread && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <Body
              weight={hasUnread ? 'bold' : 'semibold'}
              color="primary"
              numberOfLines={1}
              style={styles.nameText}
            >
              {friend?.displayName || friend?.username || defaultFriendText}
            </Body>
            <Caption color="muted" style={styles.timeText}>
              {timeAgoText}
            </Caption>
          </View>

          <View style={styles.bottomRow}>
            <Caption
              color={hasUnread ? 'primary' : 'secondary'}
              weight={hasUnread ? 'semibold' : 'normal'}
              numberOfLines={1}
              style={styles.lastMessageText}
            >
              {item.lastMessage?.content || defaultStartedText}
            </Caption>

            {hasUnread && (
              <View
                style={[
                  styles.unreadBadge,
                  { backgroundColor: colors.accentDark },
                ]}
              >
                <Caption color="white" weight="bold" style={{ fontSize: 11 }}>
                  {item.unreadCount}
                </Caption>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    return (
      prev.item.id === next.item.id &&
      prev.item.unreadCount === next.item.unreadCount &&
      prev.item.lastMessageAt === next.item.lastMessageAt &&
      prev.item.lastMessage?.content === next.item.lastMessage?.content &&
      prev.timeAgoText === next.timeAgoText &&
      prev.isDark === next.isDark &&
      prev.colors === next.colors
    );
  },
);

export default function InboxScreen() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isManualRefreshing, setIsManualRefreshing] = React.useState(false);

  useChatSocket();
  const { data: conversations, isLoading, refetch } = useConversations();

  const handleManualRefresh = React.useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [refetch]);

  const formatTimeAgo = React.useCallback(
    (dateString: string) => {
      try {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMinutes = Math.floor(
          (now.getTime() - past.getTime()) / (1000 * 60),
        );

        if (diffInMinutes < 1) return t('common.justNow', 'Vừa xong');
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d`;
      } catch {
        return '';
      }
    },
    [t],
  );

  const handleOpenChat = React.useCallback(
    (item: ConversationItem) => {
      const friend = item.friend;
      router.push({
        pathname: '/chat/[id]',
        params: {
          id: item.id,
          friendName: friend?.displayName || friend?.username,
          friendAvatar: friend?.avatarUrl || '',
        },
      });
    },
    [router],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: ConversationItem }) => {
      return (
        <ConversationListItem
          item={item}
          colors={colors}
          isDark={isDark}
          onPress={() => handleOpenChat(item)}
          timeAgoText={formatTimeAgo(item.lastMessageAt || item.updatedAt)}
          defaultFriendText={t('chat.friend', 'Bạn bè')}
          defaultStartedText={t('chat.startedConversation', 'Bắt đầu cuộc trò chuyện')}
        />
      );
    },
    [colors, isDark, handleOpenChat, formatTimeAgo, t],
  );

  return (
    <ScreenContainer style={styles.container} edges={['top']}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.divider,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Title level={2} color="primary" weight="bold" style={styles.headerTitle}>
          {t('chat.inboxTitle', 'Hộp thư')}
        </Title>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={[
          styles.listContent,
          (!conversations || conversations.length === 0) && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={handleManualRefresh}
            tintColor={colors.accentDark}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: colors.surfaceSoft },
                ]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={42}
                  color={colors.textMuted}
                />
              </View>
              <Title level={3} color="primary" style={styles.emptyTitle}>
                {t('chat.noConversations', 'Chưa có tin nhắn nào')}
              </Title>
              <Caption color="secondary" style={styles.emptySubtitle}>
                {t(
                  'chat.noConversationsDesc',
                  'Phản hồi khoảnh khắc của bạn bè hoặc bắt đầu trò chuyện để kết nối.',
                )}
              </Caption>
            </View>
          ) : null
        }
      />
    </ScreenContainer>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    gap: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E53E3E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 16,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  lastMessageText: {
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
