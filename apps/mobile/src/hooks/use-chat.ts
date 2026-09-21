import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, GetMessagesResponse } from '../services/modules/chat.service';
import {
  ChatMessageItem,
  ConversationItem,
  MessageType,
  SendMessagePayload,
} from '@aurora/types';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  directConversation: (friendId: string) =>
    [...chatKeys.all, 'direct', friendId] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, 'messages', conversationId] as const,
};

/**
 * Hook lấy danh sách các cuộc trò chuyện của User
 */
export function useConversations() {
  return useQuery<ConversationItem[]>({
    queryKey: chatKeys.conversations(),
    queryFn: () => chatService.getConversations(),
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook lấy hoặc khởi tạo cuộc trò chuyện 1-1 với bạn bè
 */
export function useDirectConversation(friendId?: string, enabled = true) {
  return useQuery<ConversationItem>({
    queryKey: chatKeys.directConversation(friendId || ''),
    queryFn: () => chatService.getOrCreateDirectConversation(friendId!),
    enabled: Boolean(friendId) && enabled,
  });
}

/**
 * Hook lấy danh sách tin nhắn trong một phòng chat
 */
export function useMessages(conversationId?: string, enabled = true) {
  return useQuery<GetMessagesResponse>({
    queryKey: chatKeys.messages(conversationId || ''),
    queryFn: () => chatService.getMessages(conversationId!),
    enabled: Boolean(conversationId) && enabled,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook gửi tin nhắn với Optimistic Update
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: SendMessagePayload;
    }) => chatService.sendMessage(conversationId, payload),
    onMutate: async ({ conversationId, payload }) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });

      const previousData = queryClient.getQueryData<GetMessagesResponse>(
        chatKeys.messages(conversationId),
      );

      if (previousData) {
        const optimisticMessage: ChatMessageItem = {
          id: `temp-${Date.now()}`,
          conversationId,
          senderId: 'me',
          content: payload.content,
          type: payload.type || (payload.momentId ? MessageType.MOMENT_REPLY : MessageType.TEXT),
          momentId: payload.momentId || null,
          createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData<GetMessagesResponse>(
          chatKeys.messages(conversationId),
          {
            ...previousData,
            items: [optimisticMessage, ...previousData.items],
          },
        );
      }

      return { previousData };
    },
    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          chatKeys.messages(variables.conversationId),
          context.previousData,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },
  });
}

/**
 * Hook đánh dấu cuộc trò chuyện là đã đọc
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatService.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
