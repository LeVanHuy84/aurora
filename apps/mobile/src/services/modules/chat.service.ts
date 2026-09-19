import { apiClient } from '../api-client';
import {
  ChatMessageItem,
  ConversationItem,
  SendMessagePayload,
} from '@aurora/types';

export interface GetMessagesResponse {
  items: ChatMessageItem[];
  meta: {
    hasMore: boolean;
    nextCursor: string | null;
    limit: number;
  };
}

export const chatService = {
  /**
   * Lấy danh sách các cuộc trò chuyện của User
   */
  async getConversations(): Promise<ConversationItem[]> {
    return apiClient.get<ConversationItem[]>('/conversations');
  },

  /**
   * Lấy hoặc tạo phòng chat 1-1 với một bạn bè
   */
  async getOrCreateDirectConversation(friendId: string): Promise<ConversationItem> {
    return apiClient.get<ConversationItem>(`/conversations/with-user/${friendId}`);
  },

  /**
   * Lấy lịch sử tin nhắn trong phòng chat
   */
  async getMessages(
    conversationId: string,
    params?: { cursor?: string; limit?: number },
  ): Promise<GetMessagesResponse> {
    const query = new URLSearchParams();
    if (params?.cursor) query.append('cursor', params.cursor);
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<GetMessagesResponse>(
      `/conversations/${conversationId}/messages${queryString}`,
    );
  },

  /**
   * Gửi tin nhắn mới vào phòng chat (hỗ trợ trích dẫn Moment)
   */
  async sendMessage(
    conversationId: string,
    payload: SendMessagePayload,
  ): Promise<ChatMessageItem> {
    return apiClient.post<ChatMessageItem>(
      `/conversations/${conversationId}/messages`,
      payload,
    );
  },

  /**
   * Đánh dấu đã đọc tất cả tin nhắn
   */
  async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    return apiClient.patch<{ success: boolean }>(
      `/conversations/${conversationId}/read`,
    );
  },
};
