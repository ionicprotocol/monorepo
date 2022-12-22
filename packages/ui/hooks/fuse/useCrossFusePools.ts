import { FusePoolData, SupportedChains } from '@midas-capital/types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { config } from '@ui/config/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useUSDPrices } from '@ui/hooks/useUSDPrices';
import { FusePoolsPerChain } from '@ui/types/ChainMetaData';
import { Err, PoolsPerChainStatus } from '@ui/types/ComponentPropsType';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { poolSort } from '@ui/utils/sorts';

export const useCrossFusePools = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();
  const { data: prices } = useUSDPrices(chainIds);

  const poolsQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        queryKey: ['useCrossFusePools', chainId, address, prices && prices[chainId.toString()]],
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && prices && prices[chainId.toString()] && sdk) {
            const chainPools: FusePoolsPerChain = {};
            const _allPools: FusePoolData[] = [];

            const pools = await sdk.fetchPoolsManual({ from: address });
            const visiblePools: FusePoolData[] = !pools
              ? []
              : poolSort(
                  pools.map((p) => ({ ...p, chainId: Number(sdk.chainId) } as FusePoolData))
                );

            chainPools[sdk.chainId] = visiblePools;
            _allPools.push(...visiblePools);

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
                      liquidityFiat: asset.liquidityNative * prices[pool.chainId.toString()].value,
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

            return allPools;
          } else {
            return null;
          }
        },
        cacheTime: Infinity,
        staleTime: Infinity,
        enabled: !!chainId && !!prices && !!prices[chainId.toString()],
      };
    }),
  });

  const [poolsPerChain, isLoading, error] = useMemo(() => {
    const _poolsPerChain: PoolsPerChainStatus = {};

    let isLoading = true;
    let isError = true;
    let error: Err | undefined;

    poolsQueries.map((pools, index) => {
      isLoading = isLoading && pools.isLoading;
      isError = isError && pools.isError;
      error = isError ? (pools.error as Err) : undefined;
      const _chainId = chainIds[index];
      _poolsPerChain[_chainId.toString()] = {
        isLoading: pools.isLoading,
        error: pools.error as Err | undefined,
        data: pools.data,
      };
    });

    return [_poolsPerChain, isLoading, error];
  }, [poolsQueries, chainIds]);

  return { poolsPerChain, isLoading, error };
};
