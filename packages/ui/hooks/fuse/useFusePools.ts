import { FusePoolData, SupportedChains } from '@midas-capital/types';
import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import FuseJS from 'fuse.js';
import { useMemo } from 'react';

import { config } from '@ui/config/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useUSDPrices } from '@ui/hooks/useUSDPrices';
import { FusePoolsPerChain } from '@ui/types/ChainMetaData';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { poolSort } from '@ui/utils/sorts';

// returns impersonal data about fuse pools ( can filter by your supplied/created pools )
export const useFusePools = (
  filter: 'created-pools' | 'verified-pools' | 'unverified-pools' | string | null
) => {
  const { currentSdk, currentChain, address } = useMultiMidas();

  const isCreatedPools = filter === 'created-pools';
  const isAllPools = filter === '';

  const { data: pools, ...queryResultRest } = useQuery(
    ['useFusePools', currentChain?.id, filter, address, currentSdk?.chainId],
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
  const { data: prices } = useUSDPrices(chainIds);

  const poolsPerChain = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        queryKey: ['useCrossFusePools', chainId, address, prices && prices[chainId.toString()]],
        queryFn: async () => {
          if (chainId && prices && prices[chainId.toString()]) {
            try {
              const res = await axios.post('/api/pools', {
                chains: [chainId],
                address,
              });

              const _allPools = res.data.allPools as FusePoolData[];

              const allPools: PoolData[] = await Promise.all(
                _allPools.map((pool) => {
                  const assetsWithPrice: MarketData[] = [];
                  const { assets } = pool;

                  if (assets && assets.length !== 0) {
                    assets.map((asset) => {
                      assetsWithPrice.push({
                        ...asset,
                        supplyBalanceFiat:
                          asset.supplyBalanceNative * prices[pool.chainId.toString()].value,
                        borrowBalanceFiat:
                          asset.borrowBalanceNative * prices[pool.chainId.toString()].value,
                        totalSupplyFiat:
                          asset.totalSupplyNative * prices[pool.chainId.toString()].value,
                        totalBorrowFiat:
                          asset.totalBorrowNative * prices[pool.chainId.toString()].value,
                        liquidityFiat:
                          asset.liquidityNative * prices[pool.chainId.toString()].value,
                      });
                    });
                  }
                  const adaptedFusePoolData: PoolData = {
                    ...pool,
                    assets: assetsWithPrice,
                    totalLiquidityFiat:
                      pool.totalLiquidityNative * prices[pool.chainId.toString()].value,
                    totalAvailableLiquidityFiat:
                      pool.totalAvailableLiquidityNative * prices[pool.chainId.toString()].value,
                    totalSuppliedFiat:
                      pool.totalSuppliedNative * prices[pool.chainId.toString()].value,
                    totalBorrowedFiat:
                      pool.totalBorrowedNative * prices[pool.chainId.toString()].value,
                    totalSupplyBalanceFiat:
                      pool.totalSupplyBalanceNative * prices[pool.chainId.toString()].value,
                    totalBorrowBalanceFiat:
                      pool.totalBorrowBalanceNative * prices[pool.chainId.toString()].value,
                  };

                  return adaptedFusePoolData;
                })
              );

              return {
                allPools: allPools as PoolData[],
                chainPools: res.data.chainPools as FusePoolsPerChain,
              };
            } catch (e) {
              console.error(e);

              return undefined;
            }
          }
        },
        enabled: !!chainId && !!prices && !!prices[chainId.toString()],
      };
    }),
  });

  const [allPools, isLoading, error] = useMemo(() => {
    const _allPools: PoolData[] = [];
    let isLoading = true;
    let isError = true;
    let error: Error | undefined;
    poolsPerChain.map((pools) => {
      isLoading = isLoading && pools.isLoading;
      isError = isError && pools.isError;
      error = isError ? (pools.error as Error) : undefined;
      if (pools.data) {
        _allPools.push(...pools.data.allPools);
      }
    });

    return [_allPools.filter((pool) => !!pool), isLoading, error];
  }, [poolsPerChain]);

  return { allPools, isLoading, error };
};
