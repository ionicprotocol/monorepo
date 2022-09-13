import { FusePoolData } from '@midas-capital/types';
import FuseJS from 'fuse.js';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { config } from '@ui/config/index';
import { useMidas } from '@ui/context/MidasContext';
import { useSupportedUnderlyings } from '@ui/hooks/useSupportedAssets';

const poolSort = (pools: FusePoolData[]) => {
  return pools.sort((a, b) => {
    if (b.totalSuppliedNative > a.totalSuppliedNative) {
      return 1;
    }

    if (b.totalSuppliedNative < a.totalSuppliedNative) {
      return -1;
    }

    // They're equal, let's sort by pool number:
    return b.id > a.id ? 1 : -1;
  });
};

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (
  filter: 'created-pools' | 'verified-pools' | 'unverified-pools' | string | null
) => {
  const { midasSdk, currentChain, address } = useMidas();
  const { data: supportedUnderlyings } = useSupportedUnderlyings();

  const isCreatedPools = filter === 'created-pools';
  const isAllPools = filter === '';

  const { data: pools, ...queryResultRest } = useQuery(
    ['useFusePools', currentChain.id, filter, address, supportedUnderlyings],
    async () => {
      let res;

      if (!filter) {
        res = await midasSdk.fetchPoolsManual({
          from: address,
        });
      } else {
        res = await midasSdk.fetchPools({
          filter,
          options: { from: address },
        });
      }

      if (!res || !res.length) return undefined;

      const data: FusePoolData[] = [];

      type configKey = keyof typeof config;

      const hidePools = (config[`hidePools${currentChain.id}` as configKey] as string[]) || [];
      res.map((pool) => {
        if (pool && !hidePools.includes(pool.id.toString())) {
          const underlyingTokens: string[] = [];
          const underlyingSymbols: string[] = [];
          pool.underlyingTokens.map((token, index) => {
            if (supportedUnderlyings?.includes(token)) {
              underlyingTokens.push(token);
              underlyingSymbols.push(pool.underlyingSymbols[index]);
            }
          });
          const assets = pool.assets.filter((asset) =>
            supportedUnderlyings?.includes(asset.underlyingToken)
          );

          data.push({
            ...pool,
            assets,
            underlyingTokens,
            underlyingSymbols,
          });
        }
      });

      return data;
    },
    {
      enabled: !!currentChain.id && !!supportedUnderlyings,
    }
  );

  const filteredPools = useMemo(() => {
    if (!pools?.length) {
      return [];
    }

    if (!filter || isCreatedPools || isAllPools) {
      return poolSort(pools);
    }

    const options = {
      keys: ['name', 'id', 'underlyingTokens', 'underlyingSymbols'],
      fieldNormWeight: 0,
      threshold: 0.3,
    };

    const filtered = new FuseJS(pools, options).search(filter);
    return poolSort(filtered.map((item) => item.item));
  }, [pools, filter, isCreatedPools, isAllPools]);

  return { pools, filteredPools, ...queryResultRest };
};
