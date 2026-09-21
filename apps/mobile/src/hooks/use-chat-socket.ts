import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '../services/socket.service';
import { chatKeys } from './use-chat';
import { useAuthStore } from '../stores/auth.store';
import { ChatMessageItem } from '@aurora/types';
import { GetMessagesResponse } from '../services/modules/chat.service';

export function useChatSocket(conversationId?: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Quản lý kết nối Socket theo Auth Token
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, token]);

  // 2. Tham gia phòng chat và lắng nghe sự kiện
  useEffect(() => {
    if (conversationId) {
      socketService.joinConversation(conversationId);
    }

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (newMessage: ChatMessageItem) => {
      // 1. Cập nhật cache danh sách tin nhắn của cuộc trò chuyện
      queryClient.setQueryData<GetMessagesResponse>(
        chatKeys.messages(newMessage.conversationId),
        (oldData) => {
          if (!oldData) {
            return {
              items: [newMessage],
              meta: { hasMore: false, nextCursor: null, limit: 30 },
            };
          }

          // Tránh trùng lặp tin nhắn nếu đã có optimistic update
          const exists = oldData.items.some(
            (item) =>
              item.id === newMessage.id ||
              (item.id.startsWith('temp-') &&
                item.senderId === newMessage.senderId &&
                item.content === newMessage.content),
          );

          if (exists) {
            // Thay thế optimistic message bằng tin nhắn thật từ server
            return {
              ...oldData,
              items: oldData.items.map((item) =>
                item.id.startsWith('temp-') &&
                item.senderId === newMessage.senderId &&
                item.content === newMessage.content
                  ? newMessage
                  : item,
              ),
            };
          }

          return {
            ...oldData,
            items: [newMessage, ...oldData.items],
          };
        },
      );

      // 2. Cập nhật Inbox
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    };

    // Lắng nghe cập nhật Inbox
    const handleInboxUpdated = () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    };

    // Lắng nghe trạng thái đang soạn tin (typing)
    const handleUserTyping = (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      console.log('⚡ Received user_typing event:', data, 'currentConvId:', conversationId);
      if (conversationId && data.conversationId === conversationId) {
        setIsFriendTyping(Boolean(data.isTyping));

        // Tự động tắt typing sau 4s nếu bạn bè ngừng gõ
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsFriendTyping(false);
          }, 4000);
        }
      }
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('inbox_updated', handleInboxUpdated);
    socketService.on('user_typing', handleUserTyping);

    return () => {
      if (conversationId) {
        socketService.leaveConversation(conversationId);
      }
      socketService.off('new_message', handleNewMessage);
      socketService.off('inbox_updated', handleInboxUpdated);
      socketService.off('user_typing', handleUserTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, queryClient]);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (conversationId) {
        socketService.sendTyping(conversationId, isTyping);
      }
    },
    [conversationId],
  );

  return {
    isFriendTyping,
    sendTyping,
  };
}
