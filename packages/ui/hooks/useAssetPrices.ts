// useAssetPrices.ts
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import { createClient } from '@supabase/supabase-js';

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

interface UseAssetPricesReturn {
  data: AssetPrice[] | null;
  error: Error | null;
  isLoading: boolean;
}

const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co/';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';

const supabase = createClient(supabaseUrl, supabaseKey);

export const useAssetPrices = ({
  chainId,
  tokens
}: UseAssetPricesProps = {}): UseAssetPricesReturn => {
  const [data, setData] = useState<AssetPrice[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Memoize tokens array to prevent unnecessary effect triggers
  const memoizedTokens = useMemo(
    () => tokens?.map((t) => t.toLowerCase()),
    [tokens]
  );
  const chainIdString = useMemo(() => chainId?.toString(), [chainId]);

  // Keep track of last update time to prevent too frequent updates
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = 10000; // 10 seconds

  const fetchAssetPrice = useCallback(async () => {
    const now = Date.now();
    if (now - lastUpdateTime.current < updateInterval) {
      return;
    }
    lastUpdateTime.current = now;

    try {
      if (!memoizedTokens?.length || !chainIdString) {
        setData([]);
        return;
      }

      const { data: latestTimestamps, error: timestampError } = await supabase
        .from('asset-price')
        .select('underlying_address, created_at')
        .eq('chain_id', chainIdString)
        .in('underlying_address', memoizedTokens)
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
            .eq('chain_id', chainIdString)
            .eq('underlying_address', address)
            .eq('created_at', timestamp)
            .single()
      );

      const results = await Promise.all(promises);
      const finalData = results
        .map((result) => result.data)
        .filter((data): data is AssetPrice => data !== null);

      setData(finalData);
      setError(null);
    } catch (err) {
      console.error('Error fetching asset prices:', err);
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [chainIdString, memoizedTokens]);

  useEffect(() => {
    fetchAssetPrice();

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
          fetchAssetPrice();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chainIdString, fetchAssetPrice]);

  return { data, error, isLoading };
};
