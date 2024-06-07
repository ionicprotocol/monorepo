import {
  NativePricedIonicAsset,
  SupportedChains,
  assetSymbols,
  Reward,
  Strategy,
  FlywheelReward,
} from '@ionicprotocol/types';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { IonicSdk, filterOnlyObjectProperties } from '@ionicprotocol/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Handler } from '@netlify/functions';
import { chainIdToConfig } from '@ionicprotocol/chains';
import { BigNumber, Contract, ethers, utils } from 'ethers';
import { getAPYProviders as getAssetAPYProviders } from '../providers/rewards/assets';
import { FlywheelMarketRewardsInfo } from '@ionicprotocol/sdk/src/modules/Flywheel';
import { pluginsOfChain } from '../data/plugins';
import { getAPYProviders as getPluginAPYProviders } from '../providers/rewards/plugins';

export const MINUTES_PER_YEAR = 24 * 365 * 60;

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

console.log("supabase_key", environment.supabasePublicKey)


export const updateAssetTotalApy = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const provider = new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default.http[0]);
    const sdk = new IonicSdk(provider, config);

    const [poolIndexes, pools] = await sdk.contracts.PoolDirectory.callStatic.getActivePools();

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
        provider,
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
          sdk.contracts.PoolLens.callStatic.getPoolAssetsWithData(comptroller).catch(() => []),
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
      provider,
      
    });
    if (apyProviders.length === 0 ) {
      console.error("No APY Providers available.");
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
            config.specificParams.blocksPerYear.div(BigNumber.from(MINUTES_PER_YEAR)).toNumber(),
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
                info.rewards.map((reward : any) => {
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
                    ? parseFloat(utils.formatUnits(info.formattedAPR, 18))
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

          if (!asset.borrowGuardianPaused || !asset.totalBorrow.isZero()) {
            borrowApy = sdk.ratePerBlockToAPY(
              asset.borrowRatePerBlock,
              config.specificParams.blocksPerYear.div(BigNumber.from(MINUTES_PER_YEAR)).toNumber(),
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
        const { cTokenAddress, underlyingAddress, borrowApy, supplyApy, totalSupplyApy, ...rest } = r;
        return {
          chain_id: chainId,
          ctoken_address: r.cTokenAddress.toLowerCase(),
          underlying_address: r.underlyingAddress.toLocaleLowerCase(),
          borrowApy: r.borrowApy,
          supplyApy: r.supplyApy,
          totalSupplyApy: r.totalSupplyApy,
        };
      });

    console.log('Rows to be inserted:', rows); // Log the rows to be inserted

    let { error: error1 } = await supabase.from('asset_total_apy_history').insert(rows);

    if (error1) {
      console.error('Supabase insertion error:', error1); // Log the Supabase insertion error
      throw new Error(`Error occurred during saving asset total apy to database (asset_total_apy_history): ${error1.message}`);
    }

    console.log('Data successfully inserted into Supabase'); // Log successful insertion
  } catch (err) {
    console.error('Error caught in catch block:', err); // Log the error
    await functionsAlert('functions.asset-total-apy: Generic Error', JSON.stringify(err));
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
