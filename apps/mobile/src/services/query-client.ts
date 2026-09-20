import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 3, // 3 phút giữ dữ liệu tươi, không gọi API dư thừa khi switch tab
      gcTime: 1000 * 60 * 15, // 15 phút lưu cache trong bộ nhớ
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
  },
});
