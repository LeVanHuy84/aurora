import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { momentsService } from '../services/modules/moments.service';
import { interactionsService } from '../services/modules/interactions.service';
import { MomentItem, ReactionType } from '@aurora/types';

export const momentKeys = {
  all: ['moments'] as const,
  today: () => [...momentKeys.all, 'today'] as const,
  calendar: (month: number, year: number) => [...momentKeys.all, 'calendar', month, year] as const,
  history: (cursor?: string) => [...momentKeys.all, 'history', cursor] as const,
  detail: (id: string) => [...momentKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch today's timeline moments
 */
export function useTodayMoments() {
  return useQuery({
    queryKey: momentKeys.today(),
    queryFn: () => momentsService.getToday(),
  });
}

/**
 * Hook to toggle reaction on a moment with optimistic update
 */
export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ momentId, hasReacted }: { momentId: string; hasReacted: boolean }) => {
      if (hasReacted) {
        return interactionsService.removeReaction(momentId);
      } else {
        return interactionsService.addReaction(momentId, ReactionType.LOVE);
      }
    },
    onMutate: async ({ momentId, hasReacted }) => {
      await queryClient.cancelQueries({ queryKey: momentKeys.today() });

      const previousMoments = queryClient.getQueryData<MomentItem[]>(momentKeys.today());

      if (previousMoments) {
        queryClient.setQueryData<MomentItem[]>(
          momentKeys.today(),
          previousMoments.map((item) => {
            if (item.id === momentId) {
              const currentCount =
                item.reactionsCount !== undefined
                  ? item.reactionsCount
                  : item._count?.reactions || 0;
              const newCount = hasReacted ? Math.max(0, currentCount - 1) : currentCount + 1;

              return {
                ...item,
                hasReacted: !hasReacted,
                reactionsCount: newCount,
                _count: {
                  ...item._count,
                  reactions: newCount,
                },
              };
            }
            return item;
          }),
        );
      }

      return { previousMoments };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMoments) {
        queryClient.setQueryData(momentKeys.today(), context.previousMoments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.today() });
    },
  });
}
