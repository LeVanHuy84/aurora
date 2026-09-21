import { apiClient } from '../api-client';
import { MomentInteractionsResponse, ReactionItem, ReactionType } from '@aurora/types';

export const interactionsService = {
  /**
   * Thả hoặc cập nhật reaction trên một Moment
   */
  async addReaction(momentId: string, type: ReactionType | string = ReactionType.LOVE): Promise<ReactionItem> {
    return apiClient.post<ReactionItem>(`/moments/${momentId}/reactions`, { type });
  },

  /**
   * Gỡ reaction khỏi Moment
   */
  async removeReaction(momentId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/moments/${momentId}/reactions`);
  },

  /**
   * Lấy tổng hợp tương tác (Reactions & Danh sách phản hồi 1-1) của Moment
   */
  async getMomentInteractions(momentId: string): Promise<MomentInteractionsResponse> {
    return apiClient.get<MomentInteractionsResponse>(`/moments/${momentId}/interactions`);
  },
};
