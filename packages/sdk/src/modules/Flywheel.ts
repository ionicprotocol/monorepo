import { BigNumber, Contract } from "ethers";

import MidasFlywheelABI from "../../abis/MidasFlywheel";
import FlywheelStaticRewardsArtifact from "../../artifacts/FlywheelStaticRewards.json";
import MidasFlywheelArtifact from "../../artifacts/MidasFlywheel.json";
import { FlywheelStaticRewards } from "../../typechain/FlywheelStaticRewards";
import { MidasFlywheel } from "../../typechain/MidasFlywheel";
import { MidasFlywheelLensRouter } from "../../typechain/MidasFlywheelLensRouter";

import { CreateContractsModule } from "./CreateContracts";

export interface FlywheelClaimableRewards {
  flywheel: string;
  rewardToken: string;
  rewards: Array<{
    market: string;
    amount: BigNumber;
  }>;
}

export type FlywheelMarketRewardsInfo = {
  market: string;
  underlyingPrice?: BigNumber;
  rewardsInfo: {
    rewardToken: string;
    flywheel: string;
    rewardSpeedPerSecondPerToken?: BigNumber;
    rewardTokenPrice?: BigNumber;
    formattedAPR?: BigNumber;
  }[];
};

export function withFlywheel<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Flywheel extends Base {
    /** READ */
    async getFlywheelMarketRewardsByPools(pools: string[]) {
      return Promise.all(pools.map((pool) => this.getFlywheelMarketRewardsByPool(pool)));
    }

    async getFlywheelMarketRewardsByPool(pool: string): Promise<FlywheelMarketRewardsInfo[]> {
      const [flywheelsOfPool, marketsOfPool] = await Promise.all([
        this.getFlywheelsByPool(pool),
        this.createComptroller(pool, this.provider).callStatic.getAllMarkets(),
      ]);
      const strategiesOfFlywheels = await Promise.all(flywheelsOfPool.map((fw) => fw.callStatic.getAllStrategies()));

      const rewardTokens: string[] = [];
      const marketRewardsInfo = await Promise.all(
        marketsOfPool.map(async (market) => {
          const rewardsInfo = await Promise.all(
            flywheelsOfPool
              // Make sure this market is active in this flywheel
              .filter((_, fwIndex) => strategiesOfFlywheels[fwIndex].includes(market))
              // TODO also check marketState?
              .map(async (fw) => {
                const rewardToken = await fw.callStatic.rewardToken();
                rewardTokens.push(rewardToken);
                return {
                  rewardToken,
                  flywheel: fw.address,
                };
              })
          );
          return {
            market,
            rewardsInfo,
          };
        })
      );

      return marketRewardsInfo;
    }

    async getFlywheelsByPool(poolAddress: string): Promise<MidasFlywheel[]> {
      const pool = await this.createComptroller(poolAddress, this.provider);
      const allRewardDistributors = await pool.callStatic.getRewardsDistributors();
      const instances = allRewardDistributors.map((address) => {
        return new Contract(address, MidasFlywheelABI, this.provider) as MidasFlywheel;
      });

      const filterList = await Promise.all(
        instances.map(async (instance) => {
          try {
            return await instance.callStatic.isFlywheel();
          } catch (error) {
            return false;
          }
        })
      );

      return instances.filter((_, index) => filterList[index]);
    }

    async getFlywheelRewardsInfos(flywheelAddress: string) {
      const flywheelCoreInstance = new Contract(
        flywheelAddress,
        MidasFlywheelArtifact.abi,
        this.provider
      ) as MidasFlywheel;
      const [fwStaticAddress, enabledMarkets] = await Promise.all([
        flywheelCoreInstance.callStatic.flywheelRewards(),
        flywheelCoreInstance.callStatic.getAllStrategies(),
      ]);
      const fwStatic = new Contract(fwStaticAddress, FlywheelStaticRewardsArtifact.abi, this.provider);
      const rewardsInfos: Record<string, any> = {};
      await Promise.all(
        enabledMarkets.map(async (m) => {
          rewardsInfos[m] = await fwStatic.callStatic.rewardsInfo(m);
        })
      );
      return rewardsInfos;
    }

    async getFlywheelClaimableRewardsForPool(poolAddress: string, account: string) {
      const pool = this.createComptroller(poolAddress, this.provider);
      const marketsOfPool = await pool.callStatic.getAllMarkets();

      const rewardDistributorsOfPool = await pool.callStatic.getRewardsDistributors();
      const flywheels = rewardDistributorsOfPool.map((address) => this.createMidasFlywheel(address, this.provider));
      const flywheelWithRewards: FlywheelClaimableRewards[] = [];
      for (const flywheel of flywheels) {
        const rewards: FlywheelClaimableRewards["rewards"] = [];
        for (const market of marketsOfPool) {
          const rewardOfMarket = await flywheel.callStatic["accrue(address,address)"](market, account);
          if (rewardOfMarket.gt(0)) {
            rewards.push({
              market,
              amount: rewardOfMarket,
            });
          }
        }
        if (rewards.length > 0) {
          flywheelWithRewards.push({
            flywheel: flywheel.address,
            rewardToken: await flywheel.rewardToken(),
            rewards,
          });
        }
      }
      return flywheelWithRewards;
    }

    async getFlywheelClaimableRewardsForAsset(poolAddress: string, market: string, account: string) {
      const pool = this.createComptroller(poolAddress, this.provider);
      const rewardDistributorsOfPool = await pool.callStatic.getRewardsDistributors();
      const flywheels = rewardDistributorsOfPool.map((address) => this.createMidasFlywheel(address));
      const flywheelWithRewards: FlywheelClaimableRewards[] = [];

      for (const flywheel of flywheels) {
        const rewards: FlywheelClaimableRewards["rewards"] = [];
        // TODO don't accrue for all markets. Check which markets/strategies are available for that specific flywheel
        // trying to accrue for a market which is not active in the flywheel will throw an error
        const rewardOfMarket = await flywheel.callStatic["accrue(address,address)"](market, account).catch((e) => {
          console.error(`Error while calling accrue for market ${market} and account ${account}: ${e.message}`);
          return BigNumber.from(0);
        });
        if (rewardOfMarket.gt(0)) {
          rewards.push({
            market,
            amount: rewardOfMarket,
          });
        }
        if (rewards.length > 0) {
          flywheelWithRewards.push({
            flywheel: flywheel.address,
            rewardToken: await flywheel.callStatic.rewardToken(),
            rewards,
          });
        }
      }
      return flywheelWithRewards;
    }

    async getFlywheelClaimableRewards(account: string) {
      const [, comptrollers] = await this.contracts.FusePoolLensSecondary.callStatic.getFlywheelsToClaim(account, {
        from: account,
      });

      return (await Promise.all(comptrollers.map((comp) => this.getFlywheelClaimableRewardsForPool(comp, account))))
        .reduce((acc, curr) => [...acc, ...curr], []) // Flatten Array
        .filter((value, index, self) => self.indexOf(value) === index); // Unique Array;
    }

    async getFlywheelMarketRewardsByPoolWithAPR(pool: string): Promise<FlywheelMarketRewardsInfo[]> {
      const marketRewards = await (
        this.contracts.MidasFlywheelLensRouter as MidasFlywheelLensRouter
      ).callStatic.getMarketRewardsInfo(pool);

      const adaptedMarketRewards = marketRewards
        .map((marketReward) => ({
          underlyingPrice: marketReward.underlyingPrice,
          market: marketReward.market,
          rewardsInfo: marketReward.rewardsInfo.filter((info) => info.rewardSpeedPerSecondPerToken.gt(0)),
        }))
        .filter((marketReward) => marketReward.rewardsInfo.length > 0);
      return adaptedMarketRewards;
    }

    async getFlywheelRewardsInfoForMarket(flywheelAddress: string, marketAddress: string) {
      const fwCoreInstance = this.createMidasFlywheel(flywheelAddress, this.provider);
      const fwRewardsAddress = await fwCoreInstance.callStatic.flywheelRewards();
      const fwRewardsInstance = this.createFlywheelStaticRewards(fwRewardsAddress, this.provider);
      const [marketState, rewardsInfo] = await Promise.all([
        fwCoreInstance.callStatic.marketState(marketAddress),
        fwRewardsInstance.callStatic.rewardsInfo(marketAddress),
      ]);
      return {
        enabled: marketState[1] > 0,
        ...rewardsInfo,
      };
    }
    /** WRITE */
    getFlywheelEnabledMarkets(flywheelAddress: string) {
      return this.createMidasFlywheel(flywheelAddress).callStatic.getAllStrategies();
    }

    setStaticRewardInfo(
      staticRewardsAddress: string,
      marketAddress: string,
      rewardInfo: FlywheelStaticRewards.RewardsInfoStruct
    ) {
      const staticRewardsInstance = this.createFlywheelStaticRewards(staticRewardsAddress, this.signer);
      return staticRewardsInstance.functions.setRewardsInfo(marketAddress, rewardInfo);
    }

    setFlywheelRewards(flywheelAddress: string, rewardsAddress: string) {
      const flywheelCoreInstance = this.createMidasFlywheel(flywheelAddress, this.signer);
      return flywheelCoreInstance.functions.setFlywheelRewards(rewardsAddress);
    }

    addMarketForRewardsToFlywheelCore(flywheelCoreAddress: string, marketAddress: string) {
      return this.addStrategyForRewardsToFlywheelCore(flywheelCoreAddress, marketAddress);
    }

    addStrategyForRewardsToFlywheelCore(flywheelCoreAddress: string, marketAddress: string) {
      const flywheelCoreInstance = this.createMidasFlywheel(flywheelCoreAddress, this.signer);
      return flywheelCoreInstance.functions.addStrategyForRewards(marketAddress);
    }

    addFlywheelCoreToComptroller(flywheelCoreAddress: string, comptrollerAddress: string) {
      const comptrollerInstance = this.createComptroller(comptrollerAddress, this.signer);
      return comptrollerInstance.functions._addRewardsDistributor(flywheelCoreAddress);
    }
  };
}
