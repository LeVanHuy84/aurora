import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interactionsService } from '../services/modules/interactions.service';
import { MomentInteractionsResponse, MomentItem, ReactionType } from '@aurora/types';
import { momentKeys } from './use-moments';

export const interactionKeys = {
  all: ['interactions'] as const,
  moment: (momentId: string) => [...interactionKeys.all, 'moment', momentId] as const,
};

/**
 * Hook lấy dữ liệu tổng hợp tương tác của Moment (Reactions & Threads)
 */
export function useMomentInteractions(momentId?: string, enabled = true) {
  return useQuery<MomentInteractionsResponse>({
    queryKey: interactionKeys.moment(momentId || ''),
    queryFn: () => interactionsService.getMomentInteractions(momentId!),
    enabled: Boolean(momentId) && enabled,
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * Hook thả hoặc gỡ reaction với optimistic update
 */
export function useReactMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      momentId,
      type = ReactionType.LOVE,
      remove = false,
    }: {
      momentId: string;
      type?: ReactionType;
      remove?: boolean;
    }) => {
      if (remove) {
        return interactionsService.removeReaction(momentId);
      }
      return interactionsService.addReaction(momentId, type);
    },
    onMutate: async ({ momentId, type = ReactionType.LOVE, remove = false }) => {
      await queryClient.cancelQueries({ queryKey: momentKeys.today() });

      const previousMoments = queryClient.getQueryData<MomentItem[]>(momentKeys.today());

      if (previousMoments) {
        queryClient.setQueryData<MomentItem[]>(
          momentKeys.today(),
          previousMoments.map((item) => {
            if (item.id === momentId) {
              const currentCount = item.reactionsCount ?? item._count?.reactions ?? 0;
              const wasReacted = item.hasReacted ?? false;
              let newCount = currentCount;

              if (remove) {
                newCount = Math.max(0, currentCount - 1);
              } else if (!wasReacted) {
                newCount = currentCount + 1;
              }

              return {
                ...item,
                hasReacted: !remove,
                userReactionType: remove ? null : type,
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
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: momentKeys.today() });
      queryClient.invalidateQueries({ queryKey: interactionKeys.moment(variables.momentId) });
    },
  });
}
