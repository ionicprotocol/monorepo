import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { chainIdToConfig } from '@ionicprotocol/chains';

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

function getTokenInfo(
  chainId: number | string,
  address: string
): { symbol: string; decimals: number } | null {
  const config = chainIdToConfig[+chainId];
  if (!config) return null;

  // Check if it's the wrapped native token
  const nativeAddress =
    config.specificParams?.metadata?.wrappedNativeCurrency?.address;
  if (nativeAddress?.toLowerCase() === address.toLowerCase()) {
    return {
      symbol: config.specificParams.metadata.wrappedNativeCurrency.symbol,
      decimals: config.specificParams.metadata.wrappedNativeCurrency.decimals
    };
  }

  // Find in assets
  const asset = config.assets.find(
    (a) => a.underlying.toLowerCase() === address.toLowerCase()
  );

  if (asset) {
    return {
      symbol: asset.symbol,
      decimals: asset.decimals
    };
  }

  return null;
}

export const useAssetPrices = ({
  chainId,
  tokens
}: UseAssetPricesProps = {}): UseAssetPricesReturn => {
  const [data, setData] = useState<AssetPrice[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAssetPrice = async () => {
      try {
        if (!tokens || tokens.length === 0 || !chainId) {
          setData([]);
          return;
        }

        const lowerCaseTokens = tokens.map((token) => token.toLowerCase());

        // First, get the latest created_at timestamp for each token
        const { data: latestTimestamps, error: timestampError } = await supabase
          .from('asset-price')
          .select('underlying_address, created_at')
          .eq('chain_id', chainId.toString())
          .in('underlying_address', lowerCaseTokens)
          .order('created_at', { ascending: false });

        if (timestampError) throw timestampError;

        // Get only the latest timestamp for each token
        const latestByToken = new Map<string, string>();
        latestTimestamps?.forEach((row) => {
          if (!latestByToken.has(row.underlying_address)) {
            latestByToken.set(row.underlying_address, row.created_at);
          }
        });

        // Then fetch the complete data for these specific timestamps
        const promises = Array.from(latestByToken.entries()).map(
          ([address, timestamp]) =>
            supabase
              .from('asset-price')
              .select('*')
              .eq('chain_id', chainId.toString())
              .eq('underlying_address', address)
              .eq('created_at', timestamp)
              .single()
        );

        const results = await Promise.all(promises);
        const finalData = results
          .map((result) => {
            if (!result.data) return null;

            const tokenInfo = getTokenInfo(
              chainId,
              result.data.underlying_address
            );
            if (!tokenInfo) return null;

            // Keep the original price, just add symbol and decimals
            return {
              ...result.data,
              symbol: tokenInfo.symbol,
              decimals: tokenInfo.decimals
            };
          })
          .filter((data): data is AssetPrice => data !== null);

        setData(finalData);
        setError(null);
      } catch (err) {
        console.error('Error fetching asset prices:', err);
        setError(err instanceof Error ? err : new Error('An error occurred'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssetPrice();

    // Set up real-time subscription with filters
    const subscription = supabase
      .channel('asset-price-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asset-price',
          filter: chainId ? `chain_id=eq.${chainId.toString()}` : undefined
        },
        (payload) => {
          fetchAssetPrice();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chainId, tokens]);

  return { data, error, isLoading };
};
