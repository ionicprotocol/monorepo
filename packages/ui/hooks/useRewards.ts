import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type Address, formatUnits } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import type { MarketData } from '@ui/types/TokensDataMap';

import type { IonicSdk } from '@ionicprotocol/sdk';
import type { FlywheelMarketRewardsInfo } from '@ionicprotocol/sdk/src/modules/Flywheel';
import type { FlywheelReward, Reward } from '@ionicprotocol/types';
// import type { RewardsResponse } from '../pages/api/rewards';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RewardsResponse = any;

interface UseRewardsProps {
  chainId: number;
  poolId: string;
}

export interface UseRewardsData {
  [key: string]: Reward[];
}

export const fetchFlywheelRewards = async (
  comptroller: Address,
  sdk: IonicSdk
): Promise<{
  flywheelRewardsWithAPY: FlywheelMarketRewardsInfo[];
  flywheelRewardsWithoutAPY: FlywheelMarketRewardsInfo[];
}> => {
  try {
    const [flywheelRewardsWithAPY = [], flywheelRewardsWithoutAPY = []] =
      await Promise.all([
        sdk.getFlywheelMarketRewardsByPoolWithAPR(comptroller),
        sdk.getFlywheelMarketRewardsByPool(comptroller)
      ]).catch((error) => {
        console.error('Failed to fetch flywheel rewards:', error);
        return [[], []];
      });

    return { flywheelRewardsWithAPY, flywheelRewardsWithoutAPY };
  } catch (error) {
    console.error('Fatal error fetching flywheel rewards:', error);
    return { flywheelRewardsWithAPY: [], flywheelRewardsWithoutAPY: [] };
  }
};

export function useFlywheelRewards(comptroller?: Address, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useFlywheelRewards', chainId, comptroller],

    queryFn: async () => {
      if (chainId && sdk && comptroller) {
        return await fetchFlywheelRewards(comptroller, sdk);
      }

      return null;
    },

    enabled: !!comptroller && !!chainId
  });
}

export const fetchRewards = async (
  assets: Pick<MarketData, 'cToken' | 'plugin'>[],
  chainId: number,
  flywheelRewardsWithAPY: FlywheelMarketRewardsInfo[],
  flywheelRewardsWithoutAPY: FlywheelMarketRewardsInfo[]
) => {
  try {
    const allFlywheelRewards = flywheelRewardsWithoutAPY.map((fwReward) => {
      const rewardWithAPY = flywheelRewardsWithAPY.find(
        (r) => r.market === fwReward.market
      );
      if (rewardWithAPY) return rewardWithAPY;
      return fwReward;
    });

    const rewardsOfMarkets: UseRewardsData = {};

    await Promise.all(
      assets.map(async (asset) => {
        let pluginRewards: RewardsResponse = [];
        if (asset.plugin) {
          pluginRewards = await axios
            .get(
              `/api/rewards?chainId=${chainId}&pluginAddress=${asset.plugin}`
            )
            .then((response) => response.data)
            .catch((error) => {
              console.error(
                `Unable to fetch reward for ${asset.plugin}`,
                error
              );
              return [];
            });
        }

        const flywheelRewards = allFlywheelRewards.find(
          (fwRewardsInfo) => fwRewardsInfo.market === asset.cToken
        );
        const allRewards = [...pluginRewards];
        if (flywheelRewards) {
          const flywheelsInPluginResponse = pluginRewards
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((pluginReward: any) =>
              'flywheel' in pluginReward
                ? pluginReward.flywheel.toLowerCase()
                : null
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((f: any) => !!f) as string[];
          for (const info of flywheelRewards.rewardsInfo) {
            if (
              !flywheelsInPluginResponse.includes(info.flywheel.toLowerCase())
            ) {
              allRewards.push({
                apy: info.formattedAPR
                  ? Number.parseFloat(formatUnits(info.formattedAPR, 18))
                  : undefined,
                flywheel: info.flywheel,
                token: info.rewardToken,
                updated_at: new Date().toISOString()
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
  const {
    data: poolData,
    isLoading: isLoadingPoolData,
    isError: isPoolError
  } = useFusePoolData(poolId, Number(chainId));

  const {
    data: flywheelRewards,
    isLoading: isLoadingFlywheelRewards,
    isError: isFlywheelError
  } = useFlywheelRewards(poolData?.comptroller, chainId);

  const rewardsQuery = useQuery({
    queryKey: [
      'useRewards',
      chainId,
      poolId,
      poolData?.comptroller,
      poolData?.assets?.length
    ],

    queryFn: async () => {
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

    enabled: !!poolData && !!flywheelRewards,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000
  });

  const isLoading =
    isLoadingPoolData ||
    isLoadingFlywheelRewards ||
    (rewardsQuery.isLoading && !rewardsQuery.isPaused);

  return {
    ...rewardsQuery,
    isLoading,
    isError: isPoolError || isFlywheelError || rewardsQuery.isError,
    loadingStates: {
      poolData: isLoadingPoolData,
      flywheelRewards: isLoadingFlywheelRewards,
      rewards: rewardsQuery.isLoading && !rewardsQuery.isPaused
    }
  };
}

export function useRewardsForMarket({
  asset,
  chainId,
  poolAddress
}: {
  asset: Pick<MarketData, 'cToken' | 'plugin'>;
  chainId: number;
  poolAddress: Address;
}) {
  const { data: flywheelRewards } = useFlywheelRewards(poolAddress, chainId);

  return useQuery({
    queryKey: ['useRewardsForMarket', chainId, asset, flywheelRewards],

    queryFn: async () => {
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

    enabled: !!asset && !!poolAddress,
    staleTime: Number.POSITIVE_INFINITY
  });
}
