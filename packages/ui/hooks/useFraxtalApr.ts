import { useQueries, useQuery } from '@tanstack/react-query';

import { type MarketData } from '@ui/types/TokensDataMap';

const BASE_URL = 'https://data.stakingwatch.io/api/v0.1';

const SYMBOL_TO_API_ID: Record<string, string> = {
  sfrxETH: 'sfrxeth',
  sFRAX: 'sfrax',
  wfrxETH: 'wfrxeth',
  FXS: 'fxs',
  FRAX: 'frax'
};

const fetchToken = async (): Promise<string> => {
  const response = await fetch('/api/token');
  if (!response.ok) {
    throw new Error('Failed to fetch API token');
  }
  const data = await response.json();
  return data.token;
};

const fetchApr = async (
  collection: string,
  item: string,
  duration: string,
  token: string
): Promise<number | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/metric/apr/${collection}/${item}/apr_${duration}`,
      {
        headers: {
          'x-api-key': token,
          Accept: 'application/json'
        }
      }
    );

    const text = await response.text();

    if (!response.ok) return null;

    const data = JSON.parse(text);
    return parseFloat(data.data.value) / 100;
  } catch (error) {
    console.error(`Error fetching APR for ${item}:`, error);
    return null;
  }
};

export const useFraxtalAprs = (assets: MarketData[]) => {
  // First get the token
  const tokenQuery = useQuery({
    queryKey: ['apiToken'],
    queryFn: fetchToken,
    staleTime: Infinity
  });

  const relevantAssets = assets.filter(
    (asset) => SYMBOL_TO_API_ID[asset.underlyingSymbol]
  );

  const queries = relevantAssets.map((asset) => ({
    queryKey: ['fraxtalApr', SYMBOL_TO_API_ID[asset.underlyingSymbol], '7d'],
    queryFn: () => {
      if (!tokenQuery.data) throw new Error('API token not available');
      return fetchApr(
        'frax',
        SYMBOL_TO_API_ID[asset.underlyingSymbol],
        '7d',
        tokenQuery.data
      );
    },
    enabled: !!tokenQuery.data,
    meta: {
      cToken: asset.cToken,
      symbol: asset.underlyingSymbol
    }
  }));

  const results = useQueries({ queries });

  const aprData = results.reduce(
    (acc, result, index) => {
      const meta = queries[index].meta;

      if (result.data && meta) {
        acc[meta.cToken] = {
          nativeAssetYield: result.data
        };
      }

      return acc;
    },
    {} as Record<string, { nativeAssetYield: number }>
  );

  return {
    data: aprData,
    isLoading: tokenQuery.isLoading || results.some((r) => r.isLoading),
    error: tokenQuery.error || results.find((r) => r.error)?.error
  };
};
