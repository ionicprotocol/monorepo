import { createClient } from '@supabase/supabase-js';
import { useQuery, useQueries } from '@tanstack/react-query';
import axios from 'axios';

import { COINGECKO_API, DEFI_LLAMA_API } from '@ui/constants/index';
import { getSupportedChainIds } from '@ui/utils/networkData';

import { chainIdToConfig } from '@ionicprotocol/chains';

const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co/';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';

const supabase = createClient(supabaseUrl, supabaseKey);

interface Price {
  symbol: string;
  value: number;
}

async function fetchCoinGeckoPrice(chainId: string): Promise<Price | null> {
  const config = chainIdToConfig[Number(chainId)];
  if (!config?.specificParams.cgId) return null;

  const cgId = config.specificParams.cgId;

  try {
    // Try CoinGecko first
    const { data } = await axios.get(`${COINGECKO_API}${cgId}`);
    if (data[cgId]?.usd) {
      return { symbol: '$', value: data[cgId].usd };
    }
  } catch (e) {
    try {
      // Fallback to DefiLlama
      const { data } = await axios.get(`${DEFI_LLAMA_API}coingecko:${cgId}`);
      if (data.coins[`coingecko:${cgId}`]?.price) {
        return { symbol: '$', value: data.coins[`coingecko:${cgId}`].price };
      }
    } catch (defiFallbackError) {
      console.warn('DefiLlama fallback failed:', defiFallbackError);
    }
  }

  // If all external APIs fail, return chain's native currency if available
  if (config?.specificParams.metadata.nativeCurrency) {
    return {
      symbol: config.specificParams.metadata.nativeCurrency.symbol,
      value: 1
    };
  }

  return null;
}

async function fetchLatestPriceForChain(
  chainId: string
): Promise<Price | null> {
  // Try Supabase first
  try {
    const { data: latestPrice, error } = await supabase
      .from('asset-price')
      .select('*')
      .eq('chain_id', chainId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && latestPrice) {
      return { symbol: '$', value: latestPrice.info.usdPrice };
    }
  } catch (supabaseError) {
    console.warn(`Supabase error for chain ${chainId}:`, supabaseError);
  }

  // Fallback to CoinGecko if Supabase fails or returns no data
  return fetchCoinGeckoPrice(chainId);
}

export function useChainUsdPrices(chainIds?: (number | string)[]) {
  const requestedChainIds = chainIds ?? getSupportedChainIds();
  const normalizedChainIds = requestedChainIds.map(String);

  return useQueries({
    queries: normalizedChainIds.map((chainId) => ({
      queryKey: ['usdPrice', chainId],
      queryFn: () => fetchLatestPriceForChain(chainId),
      staleTime: 30000, // 30 seconds
      cacheTime: 60000, // 1 minute
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
