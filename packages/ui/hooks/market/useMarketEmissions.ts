import { useMemo } from 'react';

import { createClient } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co/';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';

const supabase = createClient(supabaseUrl, supabaseKey);

interface MarketData {
  id: number;
  chain_id: string;
  ctoken_address: string;
  underlying_address: string;
  underlying_symbol: string;
  reward_tokens: string[] | null;
  reward_apy_supply: number;
  reward_apy_borrow: number;
  updated_at: string;
}

interface UseMarketEmissionsProps {
  chainId: number;
  cTokenAddresses?: string[];
}

async function fetchMarketEmissionsData(
  chainId: string,
  cTokenAddresses?: string[]
) {
  let query = supabase
    .from('asset_master_data_main')
    .select(
      'id, chain_id, ctoken_address, underlying_address, underlying_symbol, reward_tokens, reward_apy_supply, reward_apy_borrow, updated_at'
    )
    .eq('chain_id', chainId)
    .order('updated_at', { ascending: false });

  if (cTokenAddresses?.length) {
    query = query.in('ctoken_address', cTokenAddresses);
  }

  const { data: latestMarkets, error } = await query;
  if (error) {
    console.error('Supabase Error:', error.message, error.details);
    throw error;
  }

  const latestByMarket = new Map<string, MarketData>();
  latestMarkets?.forEach((row) => {
    if (!latestByMarket.has(row.ctoken_address)) {
      latestByMarket.set(row.ctoken_address, row);
    }
  });

  return Array.from(latestByMarket.values());
}

export const useMarketEmissions = ({
  chainId,
  cTokenAddresses
}: UseMarketEmissionsProps) => {
  const queryClient = useQueryClient();

  const memoizedCTokenAddresses = useMemo(
    () => cTokenAddresses?.map((addr) => addr.toLowerCase()),
    [cTokenAddresses]
  );
  const chainIdString = useMemo(() => chainId.toString(), [chainId]);

  useMemo(() => {
    const subscription = supabase
      .channel('market-emissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asset_master_data_main',
          filter: `chain_id=eq.${chainIdString}`
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              'marketEmissions',
              chainIdString,
              memoizedCTokenAddresses
            ]
          });
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [chainIdString, memoizedCTokenAddresses, queryClient]);

  return useQuery({
    queryKey: ['marketEmissions', chainIdString, memoizedCTokenAddresses],
    queryFn: () =>
      fetchMarketEmissionsData(chainIdString, memoizedCTokenAddresses),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data) => ({
      data:
        data?.map((market) => ({
          cTokenAddress: market.ctoken_address as `0x${string}`,
          underlyingAddress: market.underlying_address as `0x${string}`,
          underlyingSymbol: market.underlying_symbol,
          rewardTokens: market.reward_tokens ?? [],
          supplyEmissions: market.reward_apy_supply,
          borrowEmissions: market.reward_apy_borrow,
          updatedAt: market.updated_at
        })) ?? [],
      error: null,
      isLoading: false
    })
  });
};
