import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

import { getSupportedChainIds } from '@ui/utils/networkData';

const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co/';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';

const supabase = createClient(supabaseUrl, supabaseKey);

interface Price {
  symbol: string;
  value: number;
}

interface AssetPrice {
  chain_id: string;
  created_at: string;
  info: {
    usdPrice: number;
  };
}

async function fetchSupabasePrices(chainIds: string[]) {
  const prices: Record<string, Price> = {};

  const { data: latestPrices, error } = await supabase
    .from('asset-price')
    .select('*')
    .in('chain_id', chainIds)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const latestByChain = new Map<string, AssetPrice>();
  latestPrices?.forEach((price) => {
    if (!latestByChain.has(price.chain_id)) {
      latestByChain.set(price.chain_id, price);
    }
  });

  latestByChain.forEach((price, chainId) => {
    prices[chainId] = { symbol: '$', value: price.info.usdPrice };
  });

  return prices;
}

export function useAllUsdPrices() {
  const chainIds = getSupportedChainIds();

  return useQuery({
    queryKey: ['useAllUsdPrices', ...chainIds.sort()],
    queryFn: async () => {
      return fetchSupabasePrices(chainIds.map(String));
    },
    enabled: !!chainIds && chainIds.length > 0,
    staleTime: Infinity
  });
}

export function useUsdPrice(chainId: string) {
  const { data: usdPrices } = useAllUsdPrices();

  return useQuery({
    queryKey: ['useUsdPrice', chainId, usdPrices],
    queryFn: async () => {
      if (usdPrices?.[chainId]) {
        return usdPrices[chainId].value;
      }
      return null;
    },
    enabled: !!chainId && !!usdPrices,
    staleTime: Infinity
  });
}
