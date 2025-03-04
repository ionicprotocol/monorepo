import { useMemo } from 'react';

import { createClient } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AssetPriceInfo {
  createdAt: number;
  underlyingPrice: number;
  usdPrice: number;
}

interface AssetPrice {
  id: number;
  chain_id: string;
  created_at: string;
  underlying_address: string;
  symbol: string;
  decimals: number;
  info: AssetPriceInfo;
}

interface UseAssetPricesProps {
  chainId?: number | string;
  tokens?: string[];
}

const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co/';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAssetPrices(chainId?: string, tokens?: string[]) {
  if (!tokens?.length || !chainId) {
    return [];
  }

  const { data: latestTimestamps, error: timestampError } = await supabase
    .from('asset-price')
    .select('underlying_address, created_at')
    .eq('chain_id', chainId)
    .in('underlying_address', tokens)
    .order('created_at', { ascending: false });

  if (timestampError) throw timestampError;

  const latestByToken = new Map<string, string>();
  latestTimestamps?.forEach((row) => {
    if (!latestByToken.has(row.underlying_address)) {
      latestByToken.set(row.underlying_address, row.created_at);
    }
  });

  const promises = Array.from(latestByToken.entries()).map(
    ([address, timestamp]) =>
      supabase
        .from('asset-price')
        .select('*')
        .eq('chain_id', chainId)
        .eq('underlying_address', address)
        .eq('created_at', timestamp)
        .single()
  );

  const results = await Promise.all(promises);
  return results
    .map((result) => result.data)
    .filter((data): data is AssetPrice => data !== null);
}

export const useAssetPrices = ({
  chainId,
  tokens
}: UseAssetPricesProps = {}) => {
  const queryClient = useQueryClient();

  // Memoize tokens array to prevent unnecessary query key changes
  const memoizedTokens = useMemo(
    () => tokens?.map((t) => t.toLowerCase()),
    [tokens]
  );
  const chainIdString = useMemo(() => chainId?.toString(), [chainId]);

  // Set up real-time subscription
  useMemo(() => {
    const subscription = supabase
      .channel('asset-price-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asset-price',
          filter: chainIdString ? `chain_id=eq.${chainIdString}` : undefined
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({
            queryKey: ['assetPrices', chainIdString, memoizedTokens]
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chainIdString, memoizedTokens, queryClient]);

  return useQuery({
    queryKey: ['assetPrices', chainIdString, memoizedTokens],
    queryFn: () => fetchAssetPrices(chainIdString, memoizedTokens),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data) => ({
      data,
      error: null,
      isLoading: false
    })
  });
};
