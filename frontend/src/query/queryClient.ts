import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,

      staleTime: 30000,
      gcTime: 5 * 60000,

      retry: (failureCount, _error) => {
        if (failureCount >= 2) return false;
        return true;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
