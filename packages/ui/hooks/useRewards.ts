import type { MidasSdk } from '@midas-capital/sdk';
import type { FlywheelReward, Reward } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { utils } from 'ethers';

import type { RewardsResponse } from '../pages/api/rewards';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import type { MarketData } from '@ui/types/TokensDataMap';

interface UseRewardsProps {
  chainId: number;
  poolId: string;
}

export interface UseRewardsData {
  [key: string]: Reward[];
}

export const fetchRewards = async (
  comptroller: string,
  assets: MarketData[],
  chainId: number,
  sdk: MidasSdk
) => {
  try {
    const [flywheelRewardsWithAPY, flywheelRewardsWithoutAPY] = await Promise.all([
      sdk
        .getFlywheelMarketRewardsByPoolWithAPR(assets.map((asset) => asset.cToken))
        .catch((exception) => {
          console.error('Unable to get onchain Flywheel Rewards with APY', exception);
          return [];
        }),
      sdk.getFlywheelMarketRewardsByPool(comptroller).catch((error) => {
        console.error('Unable to get onchain Flywheel Rewards without APY', error);
        return [];
      }),
    ]);

    const allFlywheelRewards = flywheelRewardsWithoutAPY.map((fwReward) => {
      const rewardWithAPY = flywheelRewardsWithAPY.find((r) => r.market === fwReward.market);
      if (rewardWithAPY) return rewardWithAPY;
      return fwReward;
    });

    const rewardsOfMarkets: UseRewardsData = {};

    await Promise.all(
      assets.map(async (asset) => {
        let pluginRewards: RewardsResponse = [];
        if (asset.plugin) {
          pluginRewards = await axios
            .get(`/api/rewards?chainId=${chainId}&pluginAddress=${asset.plugin}`)
            .then((response) => response.data)
            .catch((error) => {
              console.error(`Unable to fetch reward for ${asset.plugin}`, error);
              return [];
            });
        }

        const flywheelRewards = allFlywheelRewards.find(
          (fwRewardsInfo) => fwRewardsInfo.market === asset.cToken
        );
        const allRewards = [...pluginRewards];
        if (flywheelRewards) {
          const flywheelsInPluginResponse = pluginRewards
            .map((pluginReward) =>
              'flywheel' in pluginReward ? pluginReward.flywheel.toLowerCase() : null
            )
            .filter((f) => !!f) as string[];
          for (const info of flywheelRewards.rewardsInfo) {
            if (!flywheelsInPluginResponse.includes(info.flywheel.toLowerCase())) {
              allRewards.push({
                apy: info.formattedAPR
                  ? parseFloat(utils.formatUnits(info.formattedAPR, 18))
                  : undefined,
                flywheel: info.flywheel,
                token: info.rewardToken,
                updated_at: new Date().toISOString(),
              } as FlywheelReward);
            }
          }
        }
        rewardsOfMarkets[asset.cToken] = allRewards;
      })
    );

    return rewardsOfMarkets;
  } catch (exception) {
    console.error(exception);

    return {};
  }
};

export function useRewards({ poolId, chainId }: UseRewardsProps) {
  const { data: poolData } = useFusePoolData(poolId, Number(chainId));
  const sdk = useSdk(chainId);

  return useQuery<UseRewardsData>(
    [
      'useRewards',
      chainId,
      poolData?.comptroller,
      poolData?.assets.map((asset) => [asset.cToken, asset.plugin]),
    ],
    async () => {
      if (chainId && sdk && poolData) {
        return await fetchRewards(poolData.comptroller, poolData.assets, chainId, sdk);
      }

      return {};
    },
    {
      cacheTime: Infinity,
      enabled: !!poolData,
      staleTime: Infinity,
    }
  );
}
