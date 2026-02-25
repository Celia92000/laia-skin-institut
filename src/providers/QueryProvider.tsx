'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache les données pendant 5 minutes
            staleTime: 5 * 60 * 1000,
            // Garde les données en cache pendant 10 minutes
            gcTime: 10 * 60 * 1000,
            // Ne pas refetch automatiquement au focus
            refetchOnWindowFocus: false,
            // Retry une fois en cas d'erreur
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
