import { useQueries } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { FusePoolsPerChain } from '@ui/types/ChainMetaData';
import type { Err, PoolsPerChainStatus } from '@ui/types/ComponentPropsType';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { poolSort, poolSortByAddress } from '@ui/utils/sorts';

import { useChainUsdPrices } from '../useUsdPrices';

import type { IonicPoolData, SupportedChains } from '@ionicprotocol/types';

export const useCrossPools = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiIonic();
  const { data: prices } = useChainUsdPrices(chainIds);

  const poolsQueries = useQueries({
    queries: chainIds.map((chainId) => {
      const chainIdStr = chainId.toString();
      return {
        enabled: !!chainId && !!prices && !!prices[chainIdStr],
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && prices && prices[chainIdStr] && sdk) {
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

              const usdPrice = prices[chainIdStr].value;
              const allPools: PoolData[] = await Promise.all(
                _allPools.map((pool) => {
                  const assetsWithPrice: MarketData[] =
                    pool.assets?.map((asset) => ({
                      ...asset,
                      borrowBalanceFiat: asset.borrowBalanceNative * usdPrice,
                      liquidityFiat: asset.liquidityNative * usdPrice,
                      netSupplyBalanceFiat:
                        asset.netSupplyBalanceNative * usdPrice,
                      supplyBalanceFiat: asset.supplyBalanceNative * usdPrice,
                      totalBorrowFiat: asset.totalBorrowNative * usdPrice,
                      totalSupplyFiat: asset.totalSupplyNative * usdPrice
                    })) ?? [];

                  return {
                    ...pool,
                    assets: assetsWithPrice,
                    totalAvailableLiquidityFiat:
                      pool.totalAvailableLiquidityNative * usdPrice,
                    totalBorrowBalanceFiat:
                      pool.totalBorrowBalanceNative * usdPrice,
                    totalBorrowedFiat: pool.totalBorrowedNative * usdPrice,
                    totalLiquidityFiat: pool.totalLiquidityNative * usdPrice,
                    totalSuppliedFiat: pool.totalSuppliedNative * usdPrice,
                    totalSupplyBalanceFiat:
                      pool.totalSupplyBalanceNative * usdPrice
                  };
                })
              );

              return allPools;
            } catch (e) {
              console.warn(`Fetching pools error: `, { chainId }, e);
              return null;
            }
          }
          return null;
        },
        queryKey: [
          'useCrossPools',
          chainId,
          address,
          prices && prices[chainIdStr]
        ],
        staleTime: 30000 // 30 seconds
      };
    })
  });

  const poolsPerChain: PoolsPerChainStatus = {};
  const allPools: PoolData[] = [];

  let isAllLoading = false;
  let isError = false;
  let error: Err | undefined;

  poolsQueries.forEach((pools, index) => {
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
