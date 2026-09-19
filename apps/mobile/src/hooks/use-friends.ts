import { useQuery } from '@tanstack/react-query';
import { friendsService } from '../services/modules/friends.service';

export const friendKeys = {
  all: ['friends'] as const,
  list: () => [...friendKeys.all, 'list'] as const,
};

/**
 * Hook to fetch friends list
 */
export function useFriends() {
  return useQuery({
    queryKey: friendKeys.list(),
    queryFn: () => friendsService.getFriends(),
  });
}
