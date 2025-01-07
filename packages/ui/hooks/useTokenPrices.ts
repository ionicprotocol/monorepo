import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co/';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface TokenConfig {
  cgId: string;
  symbol: string;
  address?: string;
}

interface TokenPrice {
  symbol: string;
  price: number;
}

interface AssetPrice {
  chain_id: string;
  created_at: string;
  info: {
    usdPrice: number;
    symbol?: string;
  };
}

async function fetchTokenPrices(tokens: TokenConfig[]) {
  const prices: Record<string, TokenPrice> = {};

  if (tokens.length === 0) return prices;

  try {
    const { data: latestPrices, error } = await supabase
      .from('asset-price')
      .select('*')
      .in(
        'chain_id',
        tokens.map((t) => t.cgId)
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    const latestByToken = new Map<string, AssetPrice>();
    latestPrices?.forEach((price) => {
      if (!latestByToken.has(price.chain_id)) {
        latestByToken.set(price.chain_id, price);
      }
    });

    tokens.forEach((token) => {
      const priceData = latestByToken.get(token.cgId);
      const price = priceData?.info.usdPrice ?? 0;

      prices[token.symbol] = {
        symbol: token.symbol,
        price: Number.isFinite(price) ? price : 0
      };

      // Set default price of 1 for stablecoins if we got 0
      if (
        price === 0 &&
        (token.symbol === 'USDC' ||
          token.symbol === 'USDT' ||
          token.symbol === 'DAI')
      ) {
        prices[token.symbol].price = 1;
      }
    });

    return prices;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);

    // Return default prices in case of complete failure
    tokens.forEach((token) => {
      prices[token.symbol] = {
        symbol: token.symbol,
        price:
          token.symbol === 'USDC' ||
          token.symbol === 'USDT' ||
          token.symbol === 'DAI'
            ? 1
            : 0
      };
    });

    return prices;
  }
}

export function useTokenPrices(tokens: TokenConfig[]) {
  return useQuery({
    queryKey: ['tokenPrices', tokens.map((t) => t.cgId).sort()],
    queryFn: () => fetchTokenPrices(tokens),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });
}
