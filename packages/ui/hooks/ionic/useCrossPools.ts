import type { IonicPoolData, SupportedChains } from '@ionicprotocol/types';
import { useQueries } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { FusePoolsPerChain } from '@ui/types/ChainMetaData';
import type { Err, PoolsPerChainStatus } from '@ui/types/ComponentPropsType';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { poolSort, poolSortByAddress } from '@ui/utils/sorts';

export const useCrossPools = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiIonic();
  const { data: prices } = useAllUsdPrices();

  const poolsQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        enabled: !!chainId && !!prices && !!prices[chainId.toString()],
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && prices && prices[chainId.toString()] && sdk) {
            const chainPools: FusePoolsPerChain = {};
            const _allPools: IonicPoolData[] = [];

            try {
              const pools = await sdk.fetchPoolsManual({ from: address });
              const visiblePools: IonicPoolData[] = !pools
                ? []
                : poolSort(
                    pools.map(
                      (p) =>
                        (({
                          ...p,
                          chainId: Number(sdk.chainId)
                        }) as IonicPoolData)
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
                    // totalCollateralSupplyBalanceFiat:
                    //   pool.totalCollateralSupplyBalanceNative *
                    //   prices[pool.chainId.toString()].value,
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
          'useCrossPools',
          chainId,
          address,
          prices && prices[chainId.toString()]
        ]
      };
    })
  });

  const poolsPerChain: PoolsPerChainStatus = {};
  const allPools: PoolData[] = [];

  let isAllLoading = false;
  let isError = false;
  let error: Err | undefined;

  poolsQueries.map((pools, index) => {
    isAllLoading = isAllLoading || pools.isLoading;
    isError = isError || pools.isError;
    error = isError ? (pools.error as Err) : undefined;
    const _chainId = chainIds[index];
    poolsPerChain[_chainId.toString()] = {
      data: poolSortByAddress(pools.data ?? []),
      error: pools.error as Err | undefined,
      isLoading: pools.isLoading
    };

    if (pools.data) {
      allPools.push(...poolSortByAddress(pools.data));
    }
  });

  return { allPools, error, isAllLoading, poolsPerChain };
};
