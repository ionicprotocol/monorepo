import type { IonicPoolData, SupportedChains } from '@ionicprotocol/types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { FusePoolsPerChain } from '@ui/types/ChainMetaData';
import type { Err, PoolsPerChainStatus } from '@ui/types/ComponentPropsType';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { poolSort } from '@ui/utils/sorts';

export const useCrossFusePools = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiIonic();
  const { data: prices } = useAllUsdPrices();

  const poolsQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        gcTime: Infinity,
        enabled: !!chainId && !!prices && !!prices[chainId.toString()],
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && prices && prices[chainId.toString()] && sdk) {
            const chainPools: FusePoolsPerChain = {};
            const _allPools: IonicPoolData[] = [];

            try {
              const pools = await sdk.fetchPoolsManual();
              const visiblePools: IonicPoolData[] = !pools
                ? []
                : poolSort(
                    pools.map(
                      (p) =>
                        ({
                          ...p,
                          chainId: Number(sdk.chainId)
                        }) as IonicPoolData
                    )
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
                        borrowBalanceFiat:
                          asset.borrowBalanceNative *
                          prices[pool.chainId.toString()].value,
                        liquidityFiat:
                          asset.liquidityNative *
                          prices[pool.chainId.toString()].value,
                        netSupplyBalanceFiat:
                          asset.netSupplyBalanceNative *
                          prices[pool.chainId.toString()].value,
                        supplyBalanceFiat:
                          asset.supplyBalanceNative *
                          prices[pool.chainId.toString()].value,
                        totalBorrowFiat:
                          asset.totalBorrowNative *
                          prices[pool.chainId.toString()].value,
                        totalSupplyFiat:
                          asset.totalSupplyNative *
                          prices[pool.chainId.toString()].value
                      });
                    });
                  }
                  const adaptedIonicPoolData: PoolData = {
                    ...pool,
                    assets: assetsWithPrice,
                    totalAvailableLiquidityFiat:
                      pool.totalAvailableLiquidityNative *
                      prices[pool.chainId.toString()].value,
                    totalBorrowBalanceFiat:
                      pool.totalBorrowBalanceNative *
                      prices[pool.chainId.toString()].value,
                    totalBorrowedFiat:
                      pool.totalBorrowedNative *
                      prices[pool.chainId.toString()].value,
                    totalLiquidityFiat:
                      pool.totalLiquidityNative *
                      prices[pool.chainId.toString()].value,
                    totalSuppliedFiat:
                      pool.totalSuppliedNative *
                      prices[pool.chainId.toString()].value,
                    totalSupplyBalanceFiat:
                      pool.totalSupplyBalanceNative *
                      prices[pool.chainId.toString()].value
                  };

                  return adaptedIonicPoolData;
                })
              );

              return allPools;
            } catch (e) {
              console.warn(`Fetching pools error: `, { chainId }, e);

              return null;
            }
          } else {
            return null;
          }
        },
        queryKey: [
          'useCrossFusePools',
          chainId,
          address,
          prices && prices[chainId.toString()]
        ],
        staleTime: Infinity
      };
    })
  });

  const [allPools, poolsPerChain, isLoading, error] = useMemo(() => {
    const _poolsPerChain: PoolsPerChainStatus = {};
    const allPools: PoolData[] = [];

    let isLoading = true;
    let isError = true;
    let error: Err | undefined;

    poolsQueries.map((pools, index) => {
      isLoading = isLoading && pools.isLoading;
      isError = isError && pools.isError;
      error = isError ? (pools.error as Err) : undefined;
      const _chainId = chainIds[index];
      _poolsPerChain[_chainId.toString()] = {
        data: pools.data,
        error: pools.error as Err | undefined,
        isLoading: pools.isLoading
      };

      if (pools.data) {
        allPools.push(...pools.data);
      }
    });

    return [allPools, _poolsPerChain, isLoading, error];
  }, [poolsQueries, chainIds]);

  return { allPools, error, isLoading, poolsPerChain };
};
