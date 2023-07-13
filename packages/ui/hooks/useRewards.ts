import type { IonicSdk } from '@ionicprotocol/sdk';
import type { FlywheelMarketRewardsInfo } from '@ionicprotocol/sdk/src/modules/Flywheel';
import type { FlywheelReward, Reward } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { utils } from 'ethers';

import type { RewardsResponse } from '../pages/api/rewards';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import type { MarketData } from '@ui/types/TokensDataMap';

interface UseRewardsProps {
  chainId?: number;
  poolId?: string;
}

export interface UseRewardsData {
  [key: string]: Reward[];
}

export const fetchFlywheelRewards = async (comptroller: string, sdk: IonicSdk) => {
  let flywheelRewardsWithAPY: FlywheelMarketRewardsInfo[] = [];
  let flywheelRewardsWithoutAPY: FlywheelMarketRewardsInfo[] = [];

  [flywheelRewardsWithAPY, flywheelRewardsWithoutAPY] = await Promise.all([
    sdk.getFlywheelMarketRewardsByPoolWithAPR(comptroller).catch((exception) => {
      console.error('Unable to get onchain Flywheel Rewards with APY', exception);
      return [];
    }),
    sdk.getFlywheelMarketRewardsByPool(comptroller).catch((error) => {
      console.error('Unable to get onchain Flywheel Rewards without APY', error);
      return [];
    }),
  ]);

  return { flywheelRewardsWithAPY, flywheelRewardsWithoutAPY };
};

export function useFlywheelRewards(comptroller?: string, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useFlywheelRewards', chainId, comptroller],
    async () => {
      if (chainId && sdk && comptroller) {
        return await fetchFlywheelRewards(comptroller, sdk);
      }

      return null;
    },
    {
      enabled: !!comptroller && !!chainId,
    }
  );
}

export const fetchRewards = async (
  assets: Pick<MarketData, 'cToken' | 'plugin'>[],
  chainId: number,
  flywheelRewardsWithAPY: FlywheelMarketRewardsInfo[],
  flywheelRewardsWithoutAPY: FlywheelMarketRewardsInfo[]
) => {
  try {
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
  const { data: poolData } = useFusePoolData(poolId, chainId);
  const { data: flywheelRewards } = useFlywheelRewards(poolData?.comptroller, chainId);

  return useQuery<UseRewardsData>(
    [
      'useRewards',
      chainId,
      poolData?.assets.map((asset) => [asset.cToken, asset.plugin]),
      flywheelRewards,
    ],
    async () => {
      if (chainId && poolData && flywheelRewards) {
        return await fetchRewards(
          poolData.assets,
          chainId,
          flywheelRewards.flywheelRewardsWithAPY,
          flywheelRewards.flywheelRewardsWithoutAPY
        );
      }

      return {};
    },
    {
      enabled: !!poolData && !!flywheelRewards,
    }
  );
}

export function useRewardsForMarket({
  asset,
  chainId,
  poolAddress,
}: {
  asset: Pick<MarketData, 'cToken' | 'plugin'>;
  chainId: number;
  poolAddress: string;
}) {
  const { data: flywheelRewards } = useFlywheelRewards(poolAddress, chainId);

  return useQuery<UseRewardsData>(
    ['useRewardsForMarket', chainId, asset, flywheelRewards],
    async () => {
      if (chainId && asset && flywheelRewards) {
        return await fetchRewards(
          [asset],
          chainId,
          flywheelRewards.flywheelRewardsWithAPY,
          flywheelRewards.flywheelRewardsWithoutAPY
        );
      }

      return {};
    },
    {
      enabled: !!asset && !!poolAddress,
    }
  );
}
