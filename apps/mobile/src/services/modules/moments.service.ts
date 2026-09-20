import { apiClient } from '../api-client';
import {
  MomentItem,
  CreateMomentPayload,
  CalendarMomentItem,
  HistoryResponse,
  HomeFeedResponse,
} from '@aurora/types';

export const momentsService = {
  /**
   * Fetch home cursor-paginated timeline moments and today stats
   */
  async getHomeFeed(cursor?: string, limit = 10): Promise<HomeFeedResponse> {
    return apiClient.get<HomeFeedResponse>('/moments/feed', {
      params: { cursor, limit },
    });
  },

  /**
   * Fetch today's timeline moments for the current user and their friends
   */
  async getToday(): Promise<MomentItem[]> {
    return apiClient.get<MomentItem[]>('/moments/today');
  },

  /**
   * Fetch monthly calendar mood overview
   */
  async getCalendar(month: number, year: number): Promise<CalendarMomentItem[]> {
    return apiClient.get<CalendarMomentItem[]>('/moments/calendar', {
      params: { month, year },
    });
  },

  /**
   * Fetch historical moments with cursor pagination
   */
  async getHistory(cursor?: string, limit = 20): Promise<HistoryResponse> {
    return apiClient.get<HistoryResponse>('/moments/history', {
      params: { cursor, limit },
    });
  },

  /**
   * Fetch a single moment detail
   */
  async getById(id: string): Promise<MomentItem> {
    return apiClient.get<MomentItem>(`/moments/${id}`);
  },

  /**
   * Create a new moment (Photo, Note, Mood)
   */
  async create(payload: CreateMomentPayload): Promise<MomentItem> {
    return apiClient.post<MomentItem>('/moments', payload);
  },

  /**
   * Soft delete a moment
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/moments/${id}`);
  },
};
