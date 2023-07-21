import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { UseRewardsData } from '@ui/hooks/useRewards';
import { fetchFlywheelRewards, fetchRewards } from '@ui/hooks/useRewards';
import type { MarketData } from '@ui/types/TokensDataMap';

export function useFlywheelRewardsForPositions(pools?: string[], chainIds?: number[]) {
  const { getSdk } = useMultiIonic();

  return useQuery(
    ['useFlywheelRewardsForPositions', pools, chainIds],
    async () => {
      if (chainIds && pools && chainIds.length > 0 && chainIds.length === pools.length) {
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
    {
      enabled:
        !!pools &&
        !!chainIds &&
        pools.length > 0 &&
        chainIds.length > 0 &&
        pools.length === chainIds.length
    }
  );
}

export function useRewardsForPositions(
  assets: Pick<MarketData, 'cToken' | 'plugin'>[],
  chainIds: number[],
  pools: string[]
) {
  const { data: flywheelRewards } = useFlywheelRewardsForPositions(pools, chainIds);

  return useQuery<UseRewardsData>(
    ['useRewardsForMarket', chainIds, assets, flywheelRewards],
    async () => {
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
    {
      enabled: !!assets && !!pools && !!chainIds
    }
  );
}
