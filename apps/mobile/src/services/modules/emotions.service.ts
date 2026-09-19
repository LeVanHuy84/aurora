import { apiClient } from '../api-client';
import { EmotionItem } from '@aurora/types';

export const emotionsService = {
  /**
   * Fetch master data emotions from backend API
   */
  async getAll(): Promise<EmotionItem[]> {
    return apiClient.get<EmotionItem[]>('/emotions', {
      requiresAuth: false,
    });
  },
};
