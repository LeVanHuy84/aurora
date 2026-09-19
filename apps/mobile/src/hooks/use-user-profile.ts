import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, UpdateUserPayload } from '../services/modules/users.service';
import { useAuthStore } from '../stores/auth.store';

export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  search: (q: string) => [...userKeys.all, 'search', q] as const,
};

/**
 * Hook to fetch current user profile
 */
export function useUserProfile() {
  const storeUser = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => usersService.getMe(),
    initialData: storeUser || undefined,
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersService.updateMe(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(userKeys.me(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Hook to search users by query
 */
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () => usersService.searchUsers(query),
    enabled: query.trim().length >= 2,
  });
}
