import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsService } from '../services/modules/friends.service';

export const friendKeys = {
  all: ['friends'] as const,
  list: () => [...friendKeys.all, 'list'] as const,
  pending: () => [...friendKeys.all, 'pending'] as const,
};

/**
 * Hook to fetch accepted friends list
 */
export function useFriends() {
  return useQuery({
    queryKey: friendKeys.list(),
    queryFn: () => friendsService.getFriends(),
  });
}

/**
 * Hook to fetch pending friend requests
 */
export function usePendingFriendRequests() {
  return useQuery({
    queryKey: friendKeys.pending(),
    queryFn: () => friendsService.getPendingRequests(),
  });
}

/**
 * Hook to send a friend request
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiverId: string) => friendsService.sendRequest(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

/**
 * Hook to accept a friend request
 */
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) => friendsService.acceptRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

/**
 * Hook to remove a friend or decline a request
 */
export function useDeleteFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) => friendsService.deleteFriend(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

/**
 * Hook to toggle close friend status
 */
export function useToggleCloseFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ friendshipId, isCloseFriend }: { friendshipId: string; isCloseFriend: boolean }) =>
      friendsService.toggleCloseFriend(friendshipId, isCloseFriend),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}
