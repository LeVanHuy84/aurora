import { apiClient } from '../api-client';
import { UserProfile, FriendUser } from '@aurora/types';

export interface UpdateUserPayload {
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
}

export const usersService = {
  /**
   * Fetch current user profile
   */
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/me');
  },

  /**
   * Update profile details (displayName, bio, avatarUrl)
   */
  async updateMe(payload: UpdateUserPayload): Promise<UserProfile> {
    return apiClient.patch<UserProfile>('/users/me', payload);
  },

  /**
   * Search users by username or displayName
   */
  async searchUsers(q: string): Promise<FriendUser[]> {
    return apiClient.get<FriendUser[]>('/users/search', {
      params: { q },
    });
  },

  /**
   * Update FCM / Expo Push Token for notifications
   */
  async updatePushToken(fcmToken: string): Promise<{ success: boolean }> {
    return apiClient.patch<{ success: boolean }>('/users/me/fcm-token', { fcmToken });
  },

  /**
   * Soft delete current account
   */
  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>('/users/me');
  },
};
