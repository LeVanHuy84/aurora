import { useQuery } from '@tanstack/react-query';
import { emotionsService } from '../services/modules/emotions.service';
import { EmotionItem } from '@aurora/types';

export const emotionKeys = {
  all: ['emotions'] as const,
  list: () => [...emotionKeys.all, 'list'] as const,
};

/**
 * Hook to fetch preset master emotions list from API
 */
export function useEmotions() {
  return useQuery<EmotionItem[]>({
    queryKey: emotionKeys.list(),
    queryFn: () => emotionsService.getAll(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
