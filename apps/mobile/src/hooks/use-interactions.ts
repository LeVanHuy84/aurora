import { useQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { interactionsService } from '../services/modules/interactions.service';
import { HomeFeedResponse, MomentInteractionsResponse, MomentItem, ReactionType } from '@aurora/types';
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
 * Hook thả hoặc gỡ reaction với optimistic update toàn diện trên cả Feed và Today Timeline
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
      type?: ReactionType | string;
      remove?: boolean;
    }) => {
      if (remove) {
        return interactionsService.removeReaction(momentId);
      }
      return interactionsService.addReaction(momentId, type);
    },
    onMutate: async ({
      momentId,
      type = ReactionType.LOVE,
      remove = false,
    }: {
      momentId: string;
      type?: ReactionType | string;
      remove?: boolean;
    }) => {
      // 1. Cancel ongoing queries to avoid overwriting optimistic updates
      await queryClient.cancelQueries({ queryKey: momentKeys.feed() });
      await queryClient.cancelQueries({ queryKey: momentKeys.today() });

      const previousFeed = queryClient.getQueryData<InfiniteData<HomeFeedResponse>>(momentKeys.feed());
      const previousToday = queryClient.getQueryData<MomentItem[]>(momentKeys.today());

      const updateMomentItem = (item: MomentItem): MomentItem => {
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
      };

      // 2. Optimistic update Home Feed (Infinite Query)
      if (previousFeed) {
        queryClient.setQueryData<InfiniteData<HomeFeedResponse>>(
          momentKeys.feed(),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map(updateMomentItem),
              })),
            };
          },
        );
      }

      // 3. Optimistic update Today timeline query
      if (previousToday) {
        queryClient.setQueryData<MomentItem[]>(
          momentKeys.today(),
          previousToday.map(updateMomentItem),
        );
      }

      return { previousFeed, previousToday };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(momentKeys.feed(), context.previousFeed);
      }
      if (context?.previousToday) {
        queryClient.setQueryData(momentKeys.today(), context.previousToday);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Invalidate all moment queries so Feed, Today, Detail are synced with server
      queryClient.invalidateQueries({ queryKey: momentKeys.all });
      queryClient.invalidateQueries({ queryKey: interactionKeys.moment(variables.momentId) });
    },
  });
}
