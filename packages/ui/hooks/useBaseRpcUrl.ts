import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { base } from 'viem/chains';

import { getBaseRpcUrl } from '@ui/config/web3';

/**
 * Custom hook to provide the Base chain with the appropriate RPC URL
 * This allows us to use environment variables that are only available server-side
 * Returns a modified Base chain object with the custom RPC URL
 */
export function useBaseRpcUrl() {
  const {
    data: rpcUrl,
    isLoading,
    error
  } = useQuery({
    queryKey: ['baseRpcUrl'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/base-rpc');
        if (!response.ok) {
          throw new Error('Failed to fetch Base RPC URL');
        }
        const data = await response.json();
        return data.url as string;
      } catch (error) {
        console.error('Error fetching Base RPC URL:', error);
        // Fall back to a more reliable public RPC URL if there's an error
        return getBaseRpcUrl();
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    gcTime: 30 * 60 * 1000
  });

  const modifiedBase = useMemo(() => {
    const currentRpcUrl = rpcUrl || getBaseRpcUrl();

    return {
      ...base,
      rpcUrls: {
        ...base.rpcUrls,
        default: {
          http: [currentRpcUrl]
        }
      }
    };
  }, [rpcUrl]);

  return {
    baseChain: modifiedBase,
    rpcUrl,
    isLoading,
    error
  };
}
