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
  amount: BigNumber;
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
      const pool = this.createComptroller(poolAddress, this.provider);
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

    async getAllFlywheelClaimableRewards(account: string) {
      const fplSecondary = this.createFusePoolLensSecondary();
      const [, comptrollers] = await fplSecondary.callStatic.getFlywheelsToClaim(account, {
        from: account,
      });

      const flywheelWithRewards: FlywheelClaimableRewards[] = [];

      await Promise.all(
        comptrollers.map(async (comptroller) => {
          const pool = this.createComptroller(comptroller, this.provider);

          const [markets, rewardDistributors] = await Promise.all([
            pool.callStatic.getAllMarkets(),
            pool.callStatic.getRewardsDistributors(),
          ]);

          const rewardAmounts = await this.getClaimableRewardsForMarkets(markets, rewardDistributors, account);

          await Promise.all(
            rewardAmounts.map(async (amount, i) => {
              if (amount.gt(0)) {
                const flywheel = this.createMidasFlywheel(rewardDistributors[i], this.provider);

                flywheelWithRewards.push({
                  flywheel: flywheel.address,
                  rewardToken: await flywheel.callStatic.rewardToken(),
                  amount,
                });
              }
            })
          );
        })
      );

      return flywheelWithRewards;
    }

    async getFlywheelClaimableRewardsForPool(poolAddress: string, account: string) {
      const pool = this.createComptroller(poolAddress, this.provider);
      const [markets, rewardDistributors] = await Promise.all([
        pool.callStatic.getAllMarkets(),
        pool.callStatic.getRewardsDistributors(),
      ]);

      const flywheelWithRewards: FlywheelClaimableRewards[] = [];

      const rewardAmounts = await this.getClaimableRewardsForMarkets(markets, rewardDistributors, account);

      await Promise.all(
        rewardAmounts.map(async (amount, i) => {
          if (amount.gt(0)) {
            const flywheel = this.createMidasFlywheel(rewardDistributors[i], this.provider);

            flywheelWithRewards.push({
              flywheel: flywheel.address,
              rewardToken: await flywheel.callStatic.rewardToken(),
              amount,
            });
          }
        })
      );

      return flywheelWithRewards;
    }

    async getFlywheelClaimableRewardsForAsset(poolAddress: string, market: string, account: string) {
      const pool = this.createComptroller(poolAddress, this.provider);
      const rewardDistributors = await pool.callStatic.getRewardsDistributors();
      const rewardAmounts = await this.getClaimableRewardsForMarket(market, rewardDistributors, account);

      const flywheelWithRewards: FlywheelClaimableRewards[] = [];

      await Promise.all(
        rewardAmounts.map(async (amount, i) => {
          if (amount.gt(0)) {
            const flywheel = this.createMidasFlywheel(rewardDistributors[i], this.provider);

            flywheelWithRewards.push({
              flywheel: flywheel.address,
              rewardToken: await flywheel.callStatic.rewardToken(),
              amount,
            });
          }
        })
      );

      return flywheelWithRewards;
    }

    async getFlywheelMarketRewardsByPoolWithAPR(pool: string): Promise<FlywheelMarketRewardsInfo[]> {
      const marketRewards = await (
        this.contracts.MidasFlywheelLensRouter as MidasFlywheelLensRouter
      ).callStatic.getPoolMarketRewardsInfo(pool);

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

    async getClaimableRewardsForMarkets(markets: string[], flywheels: string[], account: string) {
      const fwLensRouter = this.createMidasFlywheelLensRouter();

      const rewardAmountsPerMarket = await fwLensRouter.callStatic.getUnclaimedRewardsByMarkets(
        account,
        markets,
        flywheels,
        Array.from(flywheels, () => true)
      );

      return rewardAmountsPerMarket;
    }

    async getClaimableRewardsForMarket(market: string, flywheels: string[], account: string) {
      const fwLensRouter = this.createMidasFlywheelLensRouter();

      const rewardAmountsPerFlywheel = await fwLensRouter.callStatic.getUnclaimedRewardsForMarket(
        account,
        market,
        flywheels,
        Array.from(flywheels, () => true)
      );

      return rewardAmountsPerFlywheel;
    }

    async getClaimableRewardsForPool(poolAddress: string, account: string) {
      const fwLensRouter = this.createMidasFlywheelLensRouter();

      const { rewardTokens, rewards } = await fwLensRouter.callStatic.getUnclaimedRewardsForPool(account, poolAddress);

      return { rewardTokens, rewards };
    }

    async getAllComptrollers() {
      const fplSecondary = this.createFusePoolLensSecondary();
      const account = await this.signer.getAddress();
      const [, comptrollers] = await fplSecondary.callStatic.getFlywheelsToClaim(account, {
        from: account,
      });

      return comptrollers;
    }

    async getAllMarkets() {
      const comptrollers = await this.getAllComptrollers();

      const allMarkets: string[] = [];

      await Promise.all(
        comptrollers.map(async (comptroller) => {
          const pool = this.createComptroller(comptroller, this.provider);
          const markets = await pool.callStatic.getAllMarkets();

          // get unique market
          markets.map((market) => {
            if (!allMarkets.includes(market)) {
              allMarkets.push(market);
            }
          });
        })
      );

      return allMarkets;
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

    /**
      @notice claim rewards of single market.
      @param market market cToken address
      @param flywheels available flywheels addresses which market could have
      @return contract transaction
    */
    async claimRewardsForMarket(market: string, flywheels: string[]) {
      const fwLensRouter = this.createMidasFlywheelLensRouter(this.signer);
      const account = await this.signer.getAddress();

      const tx = await fwLensRouter.getUnclaimedRewardsForMarket(
        account,
        market,
        flywheels,
        Array.from(flywheels, () => true)
      );

      return tx;
    }

    /**
      @notice claim rewards of multiple markets.
      @param market markets cToken addresses
      @param flywheels available flywheels addresses which markets could have
      @return contract transaction
    */
    async claimRewardsForMarkets(markets: string[], flywheels: string[]) {
      const fwLensRouter = this.createMidasFlywheelLensRouter(this.signer);
      const account = await this.signer.getAddress();

      const tx = await fwLensRouter.getUnclaimedRewardsByMarkets(
        account,
        markets,
        flywheels,
        Array.from(flywheels, () => true)
      );

      return tx;
    }

    /**
      @notice claim rewards of single pool.
      @param poolAddress pool address
      @return contract transaction
    */
    async claimRewardsForPool(poolAddress: string) {
      const fwLensRouter = this.createMidasFlywheelLensRouter(this.signer);
      const account = await this.signer.getAddress();

      const tx = await fwLensRouter.getUnclaimedRewardsForPool(account, poolAddress);

      return tx;
    }
  };
}
