import { apiClient } from '../api-client';
import { FriendshipItem } from '@aurora/types';

export const friendsService = {
  /**
   * Fetch current user's accepted friends list
   */
  async getFriends(): Promise<FriendshipItem[]> {
    return apiClient.get<FriendshipItem[]>('/friends');
  },

  /**
   * Send a friend request to another user
   */
  async sendRequest(receiverId: string): Promise<FriendshipItem> {
    return apiClient.post<FriendshipItem>('/friends/request', { receiverId });
  },

  /**
   * Accept an incoming friend request
   */
  async acceptRequest(friendshipId: string): Promise<FriendshipItem> {
    return apiClient.patch<FriendshipItem>(`/friends/accept/${friendshipId}`);
  },

  /**
   * Remove friend or decline/cancel request
   */
  async deleteFriend(friendshipId: string): Promise<void> {
    return apiClient.delete<void>(`/friends/${friendshipId}`);
  },

  /**
   * Toggle Close Friend status
   */
  async toggleCloseFriend(friendshipId: string, isCloseFriend: boolean): Promise<FriendshipItem> {
    return apiClient.patch<FriendshipItem>(`/friends/close-friend/${friendshipId}`, {
      isCloseFriend,
    });
  },
};
