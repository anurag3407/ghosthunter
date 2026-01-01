"use client";

/**
 * ============================================================================
 * APPLICATION PROVIDERS
 * ============================================================================
 * Client-side providers for React Query, Web3 wallet, state management, etc.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WalletProvider } from "@/components/providers/wallet-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create a new QueryClient for each session to avoid shared state
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </QueryClientProvider>
  );
}
