import { FlywheelMarketRewardsInfo } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { FlywheelReward, Reward } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { utils } from 'ethers';

import { RewardsResponse } from '../pages/api/rewards';

import { useFusePoolData } from './useFusePoolData';

import { useSdk } from '@ui/hooks/fuse/useSdk';

interface UseRewardsProps {
  chainId: number;
  poolId: string;
}

export interface UseRewardsData {
  [key: string]: Reward[];
}
export function useRewards({ poolId, chainId }: UseRewardsProps) {
  const { data: poolData } = useFusePoolData(poolId, Number(chainId));
  const sdk = useSdk(chainId);

  return useQuery<UseRewardsData>(
    ['useRewards', chainId, poolData?.comptroller],
    async () => {
      if (chainId && sdk && poolData) {
        try {
          let allFlywheelRewards: FlywheelMarketRewardsInfo[] = [];
          try {
            allFlywheelRewards = await sdk.getFlywheelMarketRewardsByPoolWithAPR(
              poolData.comptroller
            );

            if (
              poolData.comptroller === '0xeB2D3A9D962d89b4A9a34ce2bF6a2650c938e185' &&
              chainId === 1284
            ) {
              console.warn('Manually updating APYs in Pool, fix me soon!');

              allFlywheelRewards = allFlywheelRewards.map((r) => {
                // `wstDOT` Market
                if (r.market === '0xb3D83F2CAb787adcB99d4c768f1Eb42c8734b563') {
                  return {
                    ...r,
                    rewardsInfo: r.rewardsInfo.map((info) => {
                      // only LDO reward token
                      if (info.rewardToken === '0x9Fda7cEeC4c18008096C2fE2B85F05dc300F94d0') {
                        return { ...info, formattedAPR: info.formattedAPR?.div(100000000) }; // make 8 decimals smaller
                      }
                      // Or change nothing
                      return info;
                    }),
                  };
                }

                // `xcDOT` Market
                if (r.market === '0xa9736bA05de1213145F688e4619E5A7e0dcf4C72') {
                  return {
                    ...r,
                    rewardsInfo: r.rewardsInfo.map((info) => {
                      // only USDC reward token
                      if (info.rewardToken === '0x931715FEE2d06333043d11F658C8CE934aC61D0c') {
                        return { ...info, formattedAPR: info.formattedAPR?.mul(10000) }; // make 4 decimals bigger
                      }
                      // Or change nothing
                      return info;
                    }),
                  };
                }

                // Or change nothing
                return r;
              });
            }
          } catch (exception) {
            // Fallback to rewards without APRs
            // TODO LogRocket
            console.error('Unable to get onchain Flywheel Rewards with APY', exception);
            try {
              allFlywheelRewards = await sdk.getFlywheelMarketRewardsByPool(poolData.comptroller);
            } catch (exception) {
              // TODO LogRocket
              console.error('Unable to get onchain Flywheel Rewards Fallback', exception);
            }
          }

          const rewardsOfMarkets: UseRewardsData = {};
          await Promise.all(
            poolData.assets.map(async (asset) => {
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
                      flywheel: info.flywheel,
                      updated_at: new Date().toISOString(),
                      apy: info.formattedAPR
                        ? parseFloat(utils.formatUnits(info.formattedAPR, 18))
                        : undefined,
                      token: info.rewardToken,
                    } as FlywheelReward);
                  }
                }
              }
              rewardsOfMarkets[asset.cToken] = allRewards;
            })
          );
          return rewardsOfMarkets;
        } catch (exception) {
          // TODO show error toast and send to logrocket
          console.error(exception);
        }
      }
      return {};
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolData,
    }
  );
}
