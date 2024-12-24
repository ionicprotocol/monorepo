import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const fetchAssetPrice = async () => {
      try {
        let query = supabase.from('asset-price').select('*');

        // Add chain filter if provided
        if (chainId !== undefined) {
          query = query.eq('chain_id', chainId.toString());
        }

        // Add token filter if provided
        if (tokens && tokens.length > 0) {
          const lowerCaseTokens = tokens.map((token) => token.toLowerCase());
          query = query.in('underlying_address', lowerCaseTokens);
        }

        // Order by created_at timestamp descending
        query = query.order('created_at', { ascending: false });

        const { data: assetPrice, error: supabaseError } = await query;

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        setData(assetPrice);
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
  }, [chainId, tokens]); // Added dependencies to useEffect

  return { data, error, isLoading };
};

// Usage example:
/*
// Fetch all prices for a specific chain
const { data, error, isLoading } = useAssetPrices({ 
  chainId: "34443"
});

// Fetch specific tokens for a specific chain
const { data, error, isLoading } = useAssetPrices({ 
  chainId: "34443",
  tokens: [
    "0x4200000000000000000000000000000000000006",
    "0xd988097fb8612cc24eec14542bc03424c656005f"
  ]
});
*/
