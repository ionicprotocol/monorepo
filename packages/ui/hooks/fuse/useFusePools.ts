import { FusePoolData, SupportedChains } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import FuseJS from 'fuse.js';
import { useMemo } from 'react';

import { config } from '@ui/config/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { FusePoolsPerChain } from '@ui/types/ChainMetaData';
import { poolSort } from '@ui/utils/sorts';

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (
  filter: 'created-pools' | 'verified-pools' | 'unverified-pools' | string | null
) => {
  const { currentSdk, currentChain, address } = useMultiMidas();

  const isCreatedPools = filter === 'created-pools';
  const isAllPools = filter === '';

  const { data: pools, ...queryResultRest } = useQuery(
    [
      'useFusePools',
      currentChain?.id || '',
      filter || '',
      address || '',
      currentSdk?.chainId || '',
    ],
    async () => {
      if (!currentChain || !currentSdk || !address) return;

      let res;

      if (!filter) {
        res = await currentSdk.fetchPoolsManual({
          from: address,
        });
      } else {
        res = await currentSdk.fetchPools({
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
          data.push({
            ...pool,
          });
        }
      });

      return data;
    },
    {
      enabled: !!currentChain?.id && !!currentSdk,
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

export const useCrossFusePools = (chainIds: SupportedChains[]) => {
  const { address } = useMultiMidas();

  const { data, ...queryResultRest } = useQuery(
    ['useCrossFusePools', chainIds, address || ''],
    async () => {
      try {
        const res = await axios.post('/api/pools', {
          chains: chainIds,
          address,
        });

        return {
          allPools: res.data.allPools as FusePoolData[],
          chainPools: res.data.chainPools as FusePoolsPerChain,
        };
      } catch (e) {
        console.error(e);

        return undefined;
      }
    },
    {
      enabled: chainIds.length !== 0,
    }
  );

  return {
    ...data,
    ...queryResultRest,
  };
};
