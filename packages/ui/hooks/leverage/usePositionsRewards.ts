import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { UseRewardsData } from '@ui/hooks/useRewards';
import { fetchFlywheelRewards, fetchRewards } from '@ui/hooks/useRewards';
import type { MarketData } from '@ui/types/TokensDataMap';

export function useFlywheelRewardsForPositions(
  pools?: Address[],
  chainIds?: number[]
) {
  const { getSdk } = useMultiIonic();

  return useQuery({
    queryKey: ['useFlywheelRewardsForPositions', pools, chainIds],

    queryFn: async () => {
      if (
        chainIds &&
        pools &&
        chainIds.length > 0 &&
        chainIds.length === pools.length
      ) {
        return await Promise.all(
          chainIds.map(async (chainId, i) => {
            const sdk = getSdk(chainId);
            if (sdk) {
              return await fetchFlywheelRewards(pools[i], sdk);
            }

            return null;
          })
        );
      }

      return null;
    },

    gcTime: Infinity,

    enabled:
      !!pools &&
      !!chainIds &&
      pools.length > 0 &&
      chainIds.length > 0 &&
      pools.length === chainIds.length,

    staleTime: Infinity
  });
}

export function useRewardsForPositions(
  assets: Pick<MarketData, 'cToken' | 'plugin'>[],
  chainIds: number[],
  pools: Address[]
) {
  const { data: flywheelRewards } = useFlywheelRewardsForPositions(
    pools,
    chainIds
  );

  return useQuery({
    queryKey: ['useRewardsForMarket', chainIds, assets, flywheelRewards],

    queryFn: async () => {
      if (chainIds && assets && flywheelRewards) {
        let rewards: UseRewardsData = {};

        await Promise.all(
          chainIds.map(async (chainId, i) => {
            const fwReward = flywheelRewards[i];

            if (fwReward) {
              const res = await fetchRewards(
                [assets[i]],
                chainId,
                fwReward.flywheelRewardsWithAPY,
                fwReward.flywheelRewardsWithoutAPY
              );

              rewards = { ...rewards, ...res };
            }
          })
        );
      }

      return {};
    },

    gcTime: Infinity,
    enabled: !!assets && !!pools && !!chainIds,
    staleTime: Infinity
  });
}
