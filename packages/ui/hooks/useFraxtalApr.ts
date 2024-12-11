import { useQueries } from '@tanstack/react-query';

import { type MarketData } from '@ui/types/TokensDataMap';

const BASE_URL = 'https://data.stakingwatch.io/api/v0.1';

const STAKING_WATCH_TOKEN =
  'NDMzNzk1MDMtZmU4MC00OGM5LTlhNWUtNzlkMjkzZmRjNzFk.cdaab1aa5ba0e1f6681e29949b561835';

const SYMBOL_TO_API_ID: Record<string, string> = {
  sfrxETH: 'sfrxeth',
  sFRAX: 'sfrax',
  wfrxETH: 'wfrxeth',
  FXS: 'fxs',
  FRAX: 'frax'
};

const fetchApr = async (
  collection: string,
  item: string,
  duration: string
): Promise<number | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/metric/apr/${collection}/${item}/apr_${duration}`,
      {
        headers: {
          'x-api-key': STAKING_WATCH_TOKEN || '',
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
  const relevantAssets = assets.filter(
    (asset) => SYMBOL_TO_API_ID[asset.underlyingSymbol]
  );

  // Create queries only for relevant assets
  const queries = relevantAssets.map((asset) => ({
    queryKey: ['fraxtalApr', SYMBOL_TO_API_ID[asset.underlyingSymbol], '7d'],
    queryFn: () =>
      fetchApr('frax', SYMBOL_TO_API_ID[asset.underlyingSymbol], '7d'),
    meta: {
      cToken: asset.cToken,
      symbol: asset.underlyingSymbol
    }
  }));

  const results = useQueries({ queries });

  // Map results to assets using the stored meta data
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
    isLoading: results.some((r) => r.isLoading),
    error: results.find((r) => r.error)?.error
  };
};
