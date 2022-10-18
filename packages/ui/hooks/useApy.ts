import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { APYResponse } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const fetchApy = async (
  chainId: number,
  underlyingAddress: string,
  pluginAddress: string,
  rewardAddress?: string
) => {
  const response = await axios.get(
    `/api/apy?chain=${chainId}&underlyingAddress=${underlyingAddress}&pluginAddress=${pluginAddress}${
      rewardAddress ? `&rewardAddress=${rewardAddress}` : ''
    }`
  );

  if (response.status === 200) return response.data;

  throw 'APY Response was not ok';
};

export function useApy(
  underlyingAddress: string,
  pluginAddress: string,
  rewardAddress?: string,
  poolChainId?: number
) {
  return useQuery<APYResponse>(
    ['useApy', poolChainId, underlyingAddress, pluginAddress, rewardAddress],
    async () => {
      if (poolChainId) {
        return await fetchApy(poolChainId, underlyingAddress, pluginAddress, rewardAddress);
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!underlyingAddress && !!pluginAddress && !!poolChainId,
    }
  );
}

export const useTotalApy = (
  rewards: FlywheelMarketRewardsInfo[],
  assets: MarketData[],
  poolChainId: number
) => {
  const sdk = useSdk(poolChainId);

  const rewardsPerMarket = useMemo(() => {
    const _rewardsPerMarket: { [cToken: string]: FlywheelMarketRewardsInfo | undefined } = {};

    assets.map((asset) => {
      _rewardsPerMarket[asset.cToken] = rewards.find((r) => r.market === asset.cToken);
    });

    return _rewardsPerMarket;
  }, [assets, rewards]);

  const supplyApyPerMarket = useMemo(() => {
    const _supplyApyPerMarket: { [cToken: string]: number } = {};

    assets.map((asset) => {
      _supplyApyPerMarket[asset.cToken] = sdk
        ? sdk.ratePerBlockToAPY(
            asset.supplyRatePerBlock,
            getBlockTimePerMinuteByChainId(poolChainId)
          )
        : 0;
    });

    return _supplyApyPerMarket;
  }, [assets, poolChainId, sdk]);

  return useQuery(
    ['useTotalApy', poolChainId, rewardsPerMarket, supplyApyPerMarket, assets],
    async () => {
      const totalApyPerMarket: { [ctoken: string]: number } = {};
      assets.map(async (asset) => {
        let totalApy = supplyApyPerMarket[asset.cToken] || 0;

        const rewardsOfThisMarket = rewardsPerMarket[asset.cToken];

        if (rewardsOfThisMarket?.rewardsInfo && rewardsOfThisMarket.rewardsInfo.length !== 0) {
          rewardsOfThisMarket.rewardsInfo.map(async (reward) => {
            if (asset.plugin) {
              const plugin = asset.plugin;
              const res = await fetchApy(
                poolChainId,
                asset.underlyingToken,
                plugin,
                reward.rewardToken
              );
              if (!res.error && res.apy) totalApy += Number(res.apy) * 100;
            } else if (reward.formattedAPR) {
              totalApy += Number(utils.formatUnits(reward.formattedAPR, 16));
            }
          });
        } else if (asset.plugin) {
          const plugin = asset.plugin;
          const res = await fetchApy(poolChainId, asset.underlyingToken, plugin);
          if (!res.error && res.apy) totalApy += Number(res.apy) * 100;
        }

        totalApyPerMarket[asset.cToken] = totalApy;
      });

      return totalApyPerMarket;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: assets.length > 0 && !!poolChainId,
    }
  );
};
