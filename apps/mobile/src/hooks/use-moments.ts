import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { momentsService } from '../services/modules/moments.service';
import { interactionsService } from '../services/modules/interactions.service';
import { MomentItem, ReactionType, HomeFeedResponse, HomeFeedTodayStats } from '@aurora/types';

export const momentKeys = {
  all: ['moments'] as const,
  feed: () => [...momentKeys.all, 'feed'] as const,
  today: () => [...momentKeys.all, 'today'] as const,
  calendar: (month: number, year: number) => [...momentKeys.all, 'calendar', month, year] as const,
  history: (cursor?: string) => [...momentKeys.all, 'history', cursor] as const,
  detail: (id: string) => [...momentKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch cursor-paginated Home feed with today's stats
 */
export function useHomeFeed() {
  const query = useInfiniteQuery({
    queryKey: momentKeys.feed(),
    queryFn: ({ pageParam }) => momentsService.getHomeFeed(pageParam, 10),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: HomeFeedResponse) => lastPage.meta?.nextCursor ?? undefined,
  });

  const moments: MomentItem[] = query.data?.pages.flatMap((page) => page.items) || [];
  const todayStats: HomeFeedTodayStats = query.data?.pages[0]?.todayStats || {
    myMomentsTodayCount: 0,
    todayMomentsCount: 0,
    myEmotionsCount: 0,
    activeFriendIdsToday: [],
  };

  return {
    ...query,
    moments,
    todayStats,
  };
}

/**
 * Hook to fetch today's timeline moments (Legacy wrapper)
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

/**
 * Hook to create a new moment
 */
export function useCreateMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      type: any;
      content?: string;
      imageUrl?: string;
      emotionId?: string;
      visibility?: any;
    }) => momentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.all });
    },
  });
}

/**
 * Hook to fetch monthly calendar mood overview
 */
export function useCalendarMoments(month: number, year: number) {
  return useQuery({
    queryKey: momentKeys.calendar(month, year),
    queryFn: () => momentsService.getCalendar(month, year),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

/**
 * Hook to fetch historical moments of the user
 */
export function useHistoryMoments(limit = 50) {
  return useQuery({
    queryKey: momentKeys.history(),
    queryFn: () => momentsService.getHistory(undefined, limit),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

/**
 * Hook to soft delete a moment
 */
export function useDeleteMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (momentId: string) => momentsService.delete(momentId),
    onSuccess: () => {
      // Invalidate all moment queries so feed, calendar, today, and history refresh immediately
      queryClient.invalidateQueries({ queryKey: momentKeys.all });
    },
  });
}


