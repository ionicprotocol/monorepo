import { createClient } from '@supabase/supabase-js';
import { useQuery, useQueries } from '@tanstack/react-query';

import { getSupportedChainIds } from '@ui/utils/networkData';

const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co/';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';

const supabase = createClient(supabaseUrl, supabaseKey);

interface Price {
  symbol: string;
  value: number;
}

async function fetchLatestPriceForChain(
  chainId: string
): Promise<Price | null> {
  const { data: latestPrice, error } = await supabase
    .from('asset-price')
    .select('*')
    .eq('chain_id', chainId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn(`Error fetching price for chain ${chainId}:`, error);
    return null;
  }

  return latestPrice ? { symbol: '$', value: latestPrice.info.usdPrice } : null;
}

// Hook for getting prices for specific chains
export function useChainUsdPrices(chainIds?: (number | string)[]) {
  const requestedChainIds = chainIds ?? getSupportedChainIds();
  const normalizedChainIds = requestedChainIds.map(String);

  return useQueries({
    queries: normalizedChainIds.map((chainId) => ({
      queryKey: ['usdPrice', chainId],
      queryFn: () => fetchLatestPriceForChain(chainId),
      staleTime: 30000,
      cacheTime: 60000,
      enabled: !!chainId
    })),
    combine: (results) => {
      const prices: Record<string, Price> = {};
      results.forEach((result, index) => {
        if (result.data) {
          prices[normalizedChainIds[index]] = result.data;
        }
      });
      return {
        data: prices,
        isLoading: results.some((r) => r.isLoading),
        error: results.find((r) => r.error)?.error
      };
    }
  });
}

// Hook for getting single chain price
export function useUsdPrice(chainId?: number | string) {
  const normalizedChainId = chainId?.toString();

  return useQuery({
    queryKey: ['usdPrice', normalizedChainId],
    queryFn: () =>
      normalizedChainId ? fetchLatestPriceForChain(normalizedChainId) : null,
    staleTime: 30000,
    enabled: !!normalizedChainId,
    select: (data) => data?.value ?? null
  });
}
