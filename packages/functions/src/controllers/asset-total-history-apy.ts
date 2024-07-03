import {
  NativePricedIonicAsset,
  SupportedChains,
  assetSymbols,
  Reward,
  Strategy,
  FlywheelReward,
} from '@ionicprotocol/types';
import { IonicSdk, filterOnlyObjectProperties } from '@ionicprotocol/sdk';
import { Handler } from '@netlify/functions';
import { chainIdtoChain, chainIdToConfig } from '@ionicprotocol/chains';
import { FlywheelMarketRewardsInfo } from '@ionicprotocol/sdk/src/modules/Flywheel';
import axios from 'axios';

import { getAPYProviders as getAssetAPYProviders } from '../providers/rewards/assets';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { pluginsOfChain } from '../data/plugins';
import { getAPYProviders as getPluginAPYProviders } from '../providers/rewards/plugins';
import { createPublicClient, formatUnits, http } from 'viem';

export const HEARTBEAT_API_URL = environment.uptimeTotalHistoryApyApi;

export const MINUTES_PER_YEAR = BigInt(24 * 365 * 60);

export const aprDays = 7;

export interface TotalApy {
  cTokenAddress: string;
  underlyingAddress: string;
  totalSupplyApy: number;
  supplyApy: number;
  ankrBNBApr?: number;
  compoundingApy?: number;
  rewardApy?: number;
  borrowApy?: number;
}

export interface UseRewardsData {
  [key: string]: Reward[];
}

export interface PluginRewards {
  pluginAddress: string;
  strategy: Strategy;
  rewards: Reward[];
}

export const updateAssetTotalApy = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const publicClient = createPublicClient({
      chain: chainIdtoChain[chainId],
      transport: http(config.specificParams.metadata.rpcUrls.default.http[0]),
    });
    const sdk = new IonicSdk(publicClient, undefined, config);

    const [poolIndexes, pools] = await sdk.contracts.PoolDirectory.read.getActivePools();

    if (!pools.length || !poolIndexes.length) {
      throw `Error occurred during saving assets total apy to database: pools not found`;
    }

    const allPluginRewards: PluginRewards[] = [];
    const totalAssets: NativePricedIonicAsset[] = [];
    const allFlywheelRewards: FlywheelMarketRewardsInfo[] = [];
    const results: TotalApy[] = [];

    //get plugin rewards
    const plugins = pluginsOfChain[chainId];

    if (plugins) {
      const apyProviders = await getPluginAPYProviders({
        chainId: chainId,
        publicClient,
      });

      const _pluginRewards = await Promise.all(
        Object.entries(plugins).map(async ([pluginAddress, pluginData]) => {
          const apyProvider = apyProviders[pluginData.strategy];

          if (!apyProvider) {
            return undefined;
          }

          return {
            pluginAddress,
            strategy: pluginData.strategy,
            rewards: await apyProvider.getApy(pluginAddress, pluginData),
          };
        }),
      );

      _pluginRewards.map((reward) => {
        if (reward) {
          allPluginRewards.push(reward);
        }
      });
    }

    await Promise.all(
      pools.map(async ({ comptroller }) => {
        const [_assets, flywheelRewardsWithAPY, flywheelRewardsWithoutAPY] = await Promise.all([
          sdk.contracts.PoolLens.simulate
            .getPoolAssetsWithData([comptroller])
            .then((r) => r.result)
            .catch(() => []),
          sdk.getFlywheelMarketRewardsByPoolWithAPR(comptroller).catch((exception) => {
            console.error('Unable to get onchain Flywheel Rewards with APY', exception);
            return [];
          }),
          sdk.getFlywheelMarketRewardsByPool(comptroller).catch((error) => {
            console.error('Unable to get onchain Flywheel Rewards without APY', error);
            return [];
          }),
        ]);

        const assets = _assets.map(filterOnlyObjectProperties);
        const rewards = flywheelRewardsWithoutAPY.map((fwReward) => {
          const rewardWithAPY = flywheelRewardsWithAPY.find((r) => r.market === fwReward.market);
          if (rewardWithAPY) return rewardWithAPY;
          return fwReward;
        });

        totalAssets.push(...assets);
        allFlywheelRewards.push(...rewards);
      }),
    );

    const apyProviders = await getAssetAPYProviders(chainId, {
      chainId,
      publicClient,
    });
    if (apyProviders.length === 0) {
      console.error('No APY Providers available.');
      return 0;
    }
    const assetInfos = await Promise.all(
      Object.entries(apyProviders).map(async ([assetAddress, assetAPYProvider]) => {
        return {
          asset: assetAddress,
          rewards: await assetAPYProvider.getApy(assetAddress, {}),
        };
      }),
    );

    await Promise.all(
      totalAssets.map(async (asset) => {
        try {
          let totalSupplyApy = 0;
          //get supplyAPY
          const supplyApy = sdk.ratePerBlockToAPY(
            asset.supplyRatePerBlock,
            Number(config.specificParams.blocksPerYear / MINUTES_PER_YEAR),
          );

          totalSupplyApy += supplyApy;

          let result: TotalApy = {
            cTokenAddress: asset.cToken.toLowerCase(),
            underlyingAddress: asset.underlyingToken.toLowerCase(),
            totalSupplyApy,
            supplyApy,
          };

          //get asset reward
          let compoundingApy = 0;

          if (assetInfos) {
            assetInfos.map((info) => {
              if (info.asset.toLowerCase() === asset.underlyingToken.toLowerCase()) {
                info.rewards.map((reward: any) => {
                  if (reward.apy) {
                    compoundingApy += reward.apy * 100;
                  }
                });
              }
            });
          }

          // get plugin rewards
          const flywheelRewards = allFlywheelRewards.find(
            (fwRewardsInfo) => fwRewardsInfo.market === asset.cToken,
          );
          const pluginRewards: Reward[] = [];

          const assetPlugin = sdk.marketToPlugin[asset.cToken];

          if (assetPlugin) {
            const data = allPluginRewards.find(
              (rewards) => rewards.pluginAddress.toLowerCase() === assetPlugin.toLowerCase(),
            );

            if (data) {
              pluginRewards.push(...data.rewards);
            }
          }

          const allRewards = [...pluginRewards];

          if (flywheelRewards) {
            const flywheelsInPluginResponse = pluginRewards
              .map((pluginReward) =>
                'flywheel' in pluginReward ? pluginReward.flywheel.toLowerCase() : null,
              )
              .filter((f) => !!f) as string[];
            for (const info of flywheelRewards.rewardsInfo) {
              if (!flywheelsInPluginResponse.includes(info.flywheel.toLowerCase())) {
                allRewards.push({
                  apy: info.formattedAPR
                    ? parseFloat(formatUnits(info.formattedAPR, 18))
                    : undefined,
                  flywheel: info.flywheel,
                  token: info.rewardToken,
                  updated_at: new Date().toISOString(),
                } as FlywheelReward);
              }
            }
          }

          let rewardApy = 0;

          if (allRewards.length > 0) {
            allRewards.map((reward) => {
              if (reward.apy) {
                rewardApy += reward.apy * 100;
              }
            });
          }

          if (rewardApy) {
            totalSupplyApy += rewardApy;
            result = { ...result, rewardApy };
          }

          result = { ...result, totalSupplyApy };

          //get borrowApy
          let borrowApy = 0;

          if (!asset.borrowGuardianPaused || asset.totalBorrow !== 0n) {
            borrowApy = sdk.ratePerBlockToAPY(
              asset.borrowRatePerBlock,
              Number(config.specificParams.blocksPerYear / MINUTES_PER_YEAR),
            );
          }

          if (borrowApy) {
            result = { ...result, borrowApy };
          }

          results.push(result);
        } catch (exception) {
          console.error(exception);
          await functionsAlert(
            `Functions.asset-total-apy: CToken '${asset.cToken}' / Chain '${chainId}'`,
            JSON.stringify(exception),
          );
        }
      }),
    );

    const rows = results
      .filter((r) => !!r)
      .map((r) => {
        const { cTokenAddress, underlyingAddress, borrowApy, supplyApy, totalSupplyApy, ...rest } =
          r;
        return {
          chain_id: chainId,
          ctoken_address: r.cTokenAddress.toLowerCase(),
          underlying_address: r.underlyingAddress.toLocaleLowerCase(),
          borrowApy: r.borrowApy,
          supplyApy: r.supplyApy,
          totalSupplyApy: r.totalSupplyApy,
        };
      });
    await axios.get(HEARTBEAT_API_URL);

    let { error } = await supabase.from('asset_total_apy_history').insert(rows);
    if (error) {
      throw `Error occurred during saving asset history to database: ${error.message}`;
    }
  } catch (err) {
    await functionsAlert('Functions.asset-history: Generic Error', JSON.stringify(err));
  }
};

export const createAssetTotalApyHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    try {
      await updateAssetTotalApy(chain);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'done' }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err }),
      };
    }
  };

export default createAssetTotalApyHandler;
