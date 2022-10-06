import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { useMidas } from '@ui/context/MidasContext';
import { APYResult } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const fetchApy = async (
  chainId: number,
  underlyingAddress: string,
  pluginAddress: string,
  rewardAddress?: string
) => {
  const response = await axios.get(
    `/api/apyData?chain=${chainId}&underlyingAddress=${underlyingAddress}&pluginAddress=${pluginAddress}${
      rewardAddress ? `&rewardAddress=${rewardAddress}` : ''
    }`
  );

  if (response.status === 200) return response.data;

  throw 'APY Response was not ok';
};

export function useApy(underlyingAddress: string, pluginAddress: string, rewardAddress?: string) {
  const {
    currentChain: { id: currentChainId },
  } = useMidas();
  return useQuery<APYResult>(
    ['useApy', currentChainId, underlyingAddress, pluginAddress, rewardAddress],
    async () => {
      return await fetchApy(currentChainId, underlyingAddress, pluginAddress, rewardAddress);
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!underlyingAddress && !!pluginAddress && !!currentChainId,
    }
  );
}

export const useTotalApy = (rewards: FlywheelMarketRewardsInfo[], assets: MarketData[]) => {
  const {
    midasSdk,
    currentChain: { id: currentChainId },
  } = useMidas();

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
      _supplyApyPerMarket[asset.cToken] = midasSdk.ratePerBlockToAPY(
        asset.supplyRatePerBlock,
        getBlockTimePerMinuteByChainId(currentChainId)
      );
    });

    return _supplyApyPerMarket;
  }, [assets, currentChainId, midasSdk]);

  return useQuery(
    ['useTotalApy', currentChainId, rewardsPerMarket, supplyApyPerMarket, assets],
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
                currentChainId,
                asset.underlyingToken,
                plugin,
                reward.rewardToken
              );
              if (!res.error && res.apy) totalApy += Number(res.apy) * 100;
            } else if (reward.formattedAPR) {
              totalApy += Number(utils.formatUnits(reward.formattedAPR));
            }
          });
        } else if (asset.plugin) {
          const plugin = asset.plugin;
          const res = await fetchApy(currentChainId, asset.underlyingToken, plugin);
          if (!res.error && res.apy) totalApy += Number(res.apy) * 100;
        }

        totalApyPerMarket[asset.cToken] = totalApy;
      });

      return totalApyPerMarket;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: assets.length > 0 && !!currentChainId,
    }
  );
};
