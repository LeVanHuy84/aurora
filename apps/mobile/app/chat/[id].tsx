import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { Body, Caption, Title } from '../../src/components/ui/Typography';
import { Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/use-auth';
import { useMessages, useSendMessage, useMarkAsRead } from '../../src/hooks/use-chat';
import { ChatMessageItem, MessageType } from '@aurora/types';
import { triggerHapticFeedback } from '../../src/utils/haptics';
import { ChatSharedMomentCard } from '../../src/components/chat/ChatSharedMomentCard';

export default function ChatScreen() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const params = useLocalSearchParams<{
    id: string;
    friendName?: string;
    friendAvatar?: string;
    quotedMomentId?: string;
    quotedMomentType?: string;
    quotedMomentImage?: string;
    quotedMomentContent?: string;
  }>();

  const conversationId = params.id;
  const friendName = params.friendName;
  const friendAvatar = params.friendAvatar;

  const [inputText, setInputText] = useState('');
  const [activeQuotedMoment, setActiveQuotedMoment] = useState<{
    id: string;
    imageUrl?: string;
    content?: string;
  } | null>(
    params.quotedMomentId
      ? {
          id: params.quotedMomentId,
          imageUrl: params.quotedMomentImage,
          content: params.quotedMomentContent,
        }
      : null,
  );

  const flatListRef = useRef<FlatList>(null);

  const { data: messagesData, isLoading } = useMessages(conversationId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  useEffect(() => {
    if (conversationId) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId]);

  const handleSend = () => {
    if (!inputText.trim() || !conversationId) return;

    triggerHapticFeedback();
    const textToSend = inputText.trim();
    const momentIdToSend = activeQuotedMoment?.id;

    setInputText('');
    setActiveQuotedMoment(null);

    sendMessageMutation.mutate({
      conversationId,
      payload: {
        content: textToSend,
        momentId: momentIdToSend,
        type: momentIdToSend ? MessageType.MOMENT_REPLY : MessageType.TEXT,
      },
    });
  };

  const handleQuickEmoji = (emoji: string) => {
    if (!conversationId) return;
    triggerHapticFeedback();

    sendMessageMutation.mutate({
      conversationId,
      payload: {
        content: emoji,
        momentId: activeQuotedMoment?.id,
        type: MessageType.REACTION_BURST,
      },
    });
    setActiveQuotedMoment(null);
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderMessageItem = ({ item }: { item: ChatMessageItem }) => {
    const isMe = item.senderId === user?.id || item.senderId === 'me';
    const hasMomentQuote = Boolean(item.moment || item.momentId);
    const isBurstReaction = item.type === MessageType.REACTION_BURST;

    // 1. REACTION BURST (Large Floating Emoji)
    if (isBurstReaction) {
      return (
        <View
          style={[
            styles.messageRow,
            isMe ? styles.myMessageRow : styles.friendMessageRow,
          ]}
        >
          <View style={styles.burstEmojiContainer}>
            <Body style={styles.burstEmojiText}>{item.content}</Body>
            <Caption color="muted" style={styles.burstTimestamp}>
              {formatMessageTime(item.createdAt)}
            </Caption>
          </View>
        </View>
      );
    }

    // 2. STANDARD / MOMENT REPLY MESSAGE
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.myMessageRow : styles.friendMessageRow,
        ]}
      >
        <View
          style={[
            styles.messageStack,
            isMe ? styles.myMessageStack : styles.friendMessageStack,
          ]}
        >
          {/* LOCKET-STYLE STANDALONE MOMENT CARD (Rendered separately ABOVE the text bubble) */}
          {hasMomentQuote && item.moment ? (
            <ChatSharedMomentCard moment={item.moment} isMe={isMe} />
          ) : null}

          {/* DEDICATED TEXT REPLY BUBBLE */}
          <View
            style={[
              styles.bubbleContainer,
              isMe
                ? [
                    styles.myBubble,
                    { backgroundColor: colors.accentDark },
                  ]
                : [
                    styles.friendBubble,
                    {
                      backgroundColor: isDark ? '#25221F' : '#F7F4EE',
                      borderColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : colors.cardBorder,
                    },
                  ],
            ]}
          >
            <Body
              color={isMe ? 'white' : 'primary'}
              style={styles.messageText}
            >
              {item.content}
            </Body>

            <View style={styles.timestampRow}>
              <Caption
                color={isMe ? 'white' : 'muted'}
                style={[styles.timestamp, { opacity: isMe ? 0.75 : 0.85 }]}
              >
                {formatMessageTime(item.createdAt)}
              </Caption>
              {isMe && (
                <Ionicons
                  name="checkmark-done"
                  size={13}
                  color="rgba(255,255,255,0.75)"
                  style={{ marginLeft: 3 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* 1. Header Bar */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.cardBorder,
            backgroundColor: isDark ? '#1C1A18' : '#FDFBF7',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            triggerHapticFeedback();
            router.back();
          }}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <View style={styles.avatarWrapper}>
            {friendAvatar ? (
              <Image
                source={{ uri: friendAvatar }}
                style={styles.headerAvatar}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.headerAvatarFallback,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Caption color="white" weight="bold" style={{ fontSize: 16 }}>
                  {(friendName || 'U')[0].toUpperCase()}
                </Caption>
              </View>
            )}
          </View>

          <View style={styles.headerInfo}>
            <Title level={3} color="primary" weight="bold" style={styles.headerName}>
              {friendName || t('chat.friend', 'Bạn bè')}
            </Title>
            <Caption color="muted" style={styles.headerStatus}>
              {t('chat.directMessage', 'Tin nhắn 1-1')}
            </Caption>
          </View>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* 2. Messages List */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        {isLoading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="small" color={colors.accentDark} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messagesData?.items || []}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            inverted
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 3. Floating Quoted Moment Preview Bar (Active Reply Preview) */}
        {activeQuotedMoment && (
          <View
            style={[
              styles.floatingQuoteBar,
              {
                backgroundColor: isDark ? '#25221F' : '#F7F4EE',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.floatingQuoteLeft}>
              {activeQuotedMoment.imageUrl ? (
                <Image
                  source={{ uri: activeQuotedMoment.imageUrl }}
                  style={styles.floatingQuoteImage}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.floatingQuoteIcon,
                    { backgroundColor: isDark ? '#2C2926' : '#FFEEDB' },
                  ]}
                >
                  <Ionicons name="sparkles" size={16} color={colors.accentDark} />
                </View>
              )}

              <View style={styles.floatingQuoteTextGroup}>
                <Caption color="accent" weight="bold" style={{ fontSize: 11.5 }}>
                  {t('chat.replyingToMoment', 'Đang phản hồi khoảnh khắc')}
                </Caption>
                <Caption
                  color="secondary"
                  numberOfLines={1}
                  style={styles.floatingQuoteContent}
                >
                  {activeQuotedMoment.content || 'Ảnh khoảnh khắc'}
                </Caption>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                triggerHapticFeedback();
                setActiveQuotedMoment(null);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.floatingCloseBtn}
            >
              <Ionicons name="close-circle" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Quick Emoji Pill Bar */}
        <View style={styles.quickEmojiBar}>
          {['❤️', '🔥', '🥰', '💛', '👏', '✨', '☕'].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.quickEmojiPill,
                {
                  backgroundColor: isDark ? '#25221F' : '#F7F4EE',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBorder,
                },
              ]}
              activeOpacity={0.65}
              onPress={() => handleQuickEmoji(emoji)}
            >
              <Body style={styles.quickEmojiText}>{emoji}</Body>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. Message Input Bar */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? '#1C1A18' : '#FDFBF7',
              borderTopColor: colors.cardBorder,
              paddingBottom: Math.max(insets.bottom, Spacing.sm),
            },
          ]}
        >
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: isDark ? '#25221F' : '#F5F2EB',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.cardBorder,
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              placeholder={t('chat.inputPlaceholder', 'Nhắn tin riêng...')}
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputText.trim()
                    ? colors.accentDark
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  opacity: inputText.trim() ? 1 : 0.5,
                },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-up"
                size={19}
                color={inputText.trim() ? '#FFFFFF' : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
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
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 17,
    letterSpacing: -0.2,
  },
  headerStatus: {
    fontSize: 11.5,
    marginTop: 1,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm + 4,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  friendMessageRow: {
    justifyContent: 'flex-start',
  },
  messageStack: {
    maxWidth: '82%',
    gap: 4,
  },
  myMessageStack: {
    alignItems: 'flex-end',
  },
  friendMessageStack: {
    alignItems: 'flex-start',
  },
  bubbleContainer: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  friendBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15.5,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  burstEmojiContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  burstEmojiText: {
    fontSize: 38,
    lineHeight: 46,
    includeFontPadding: false,
  },
  burstTimestamp: {
    fontSize: 10.5,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  timestamp: {
    fontSize: 10.5,
  },
  floatingQuoteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  floatingQuoteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  floatingQuoteImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  floatingQuoteIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingQuoteTextGroup: {
    flex: 1,
  },
  floatingQuoteContent: {
    fontSize: 12.5,
    marginTop: 1,
  },
  floatingCloseBtn: {
    padding: 2,
  },
  quickEmojiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    overflow: 'visible',
  },
  quickEmojiPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  quickEmojiText: {
    fontSize: 22,
    lineHeight: 28,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs + 2,
    borderTopWidth: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.card + 4,
    borderWidth: 1,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Platform.OS === 'ios' ? Spacing.xs : 2,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 15.5,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
