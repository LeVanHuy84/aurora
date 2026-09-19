import { apiClient } from '../api-client';
import { ReactionType } from '@aurora/types';

export const interactionsService = {
  /**
   * Add or update reaction on a moment
   */
  async addReaction(momentId: string, type: ReactionType = ReactionType.LOVE): Promise<any> {
    return apiClient.post(`/moments/${momentId}/reactions`, { type });
  },

  /**
   * Remove reaction from a moment
   */
  async removeReaction(momentId: string): Promise<any> {
    return apiClient.delete(`/moments/${momentId}/reactions`);
  },

  /**
   * Fetch comments on a moment
   */
  async getComments(momentId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/moments/${momentId}/comments`);
  },

  /**
   * Add a comment to a moment
   */
  async addComment(momentId: string, content: string, parentId?: string): Promise<any> {
    return apiClient.post(`/moments/${momentId}/comments`, { content, parentId });
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    return apiClient.delete<void>(`/comments/${commentId}`);
  },
};
