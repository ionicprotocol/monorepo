import { BigNumber, constants, Contract, ContractFactory } from "ethers";

import { FlywheelStaticRewards__factory } from "../../lib/contracts/typechain/factories/FlywheelStaticRewards__factory";
import { FuseFlywheelCore__factory } from "../../lib/contracts/typechain/factories/FuseFlywheelCore__factory";
import { FuseFlywheelDynamicRewards__factory } from "../../lib/contracts/typechain/factories/FuseFlywheelDynamicRewards__factory";
import { FlywheelCore } from "../../lib/contracts/typechain/FlywheelCore";
import { FlywheelStaticRewards } from "../../lib/contracts/typechain/FlywheelStaticRewards";
import { FuseFlywheelCore } from "../../lib/contracts/typechain/FuseFlywheelCore";
import { FuseFlywheelDynamicRewards } from "../../lib/contracts/typechain/FuseFlywheelDynamicRewards";
import { FuseFlywheelLensRouter } from "../../lib/contracts/typechain/FuseFlywheelLensRouter.sol";

import { withCreateContracts } from "./CreateContracts";

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

type FuseBaseConstructorWithCreateContracts = ReturnType<typeof withCreateContracts>;

export function withFlywheel<TBase extends FuseBaseConstructorWithCreateContracts>(Base: TBase) {
  return class Flywheel extends Base {
    async deployFlywheelCore(
      rewardTokenAddress: string,
      options: {
        from: string;
        rewardsAddress?: string;
        boosterAddress?: string;
        ownerAddress?: string;
        authorityAddress?: string;
      }
    ) {
      const flywheelCoreFactory = new ContractFactory(
        this.artifacts.FuseFlywheelCore.abi,
        this.artifacts.FuseFlywheelCore.bytecode,
        this.provider.getSigner()
      ) as FuseFlywheelCore__factory;
      return (await flywheelCoreFactory.deploy(
        rewardTokenAddress,
        options.rewardsAddress || constants.AddressZero,
        options.boosterAddress || constants.AddressZero,
        options.ownerAddress || options.from,
        options.authorityAddress || constants.AddressZero
      )) as FuseFlywheelCore;
    }

    async deployFlywheelStaticRewards(
      flywheelCoreAddress: string,
      options: {
        from: string;
        ownerAddress?: string;
        authorityAddress?: string;
      }
    ) {
      const fwStaticRewardsFactory = new ContractFactory(
        this.artifacts.FlywheelStaticRewards.abi,
        this.artifacts.FlywheelStaticRewards.bytecode,
        this.provider.getSigner()
      ) as FlywheelStaticRewards__factory;

      return (await fwStaticRewardsFactory.deploy(
        flywheelCoreAddress,
        options.ownerAddress || options.from,
        options.authorityAddress || constants.AddressZero
      )) as FlywheelStaticRewards;
    }

    async deployFuseFlywheelDynamicRewards(flywheelCoreAddress: string, rewardsCycleLength: number) {
      const factory = new ContractFactory(
        this.artifacts.FuseFlywheelDynamicRewards.abi,
        this.artifacts.FuseFlywheelDynamicRewards.bytecode,
        this.provider.getSigner()
      ) as FuseFlywheelDynamicRewards__factory;

      return (await factory.deploy(flywheelCoreAddress, rewardsCycleLength)) as FuseFlywheelDynamicRewards;
    }

    setStaticRewardInfo(
      staticRewardsAddress: string,
      marketAddress: string,
      rewardInfo: FlywheelStaticRewards.RewardsInfoStruct,
      options: { from: string }
    ) {
      const staticRewardsInstance = this.createFlywheelStaticRewards(staticRewardsAddress);
      return staticRewardsInstance.functions.setRewardsInfo(marketAddress, rewardInfo);
    }

    setFlywheelRewards(flywheelAddress: string, rewardsAddress: string, options: { from: string }) {
      const flywheelCoreInstance = this.createFuseFlywheelCore(flywheelAddress);
      return flywheelCoreInstance.functions.setFlywheelRewards(rewardsAddress);
    }

    addMarketForRewardsToFlywheelCore(flywheelCoreAddress: string, marketAddress: string, options: { from: string }) {
      return this.addStrategyForRewardsToFlywheelCore(flywheelCoreAddress, marketAddress, options);
    }

    addStrategyForRewardsToFlywheelCore(flywheelCoreAddress: string, marketAddress: string, options: { from: string }) {
      const flywheelCoreInstance = this.createFuseFlywheelCore(flywheelCoreAddress);
      return flywheelCoreInstance.functions.addStrategyForRewards(marketAddress, options);
    }

    addFlywheelCoreToComptroller(flywheelCoreAddress: string, comptrollerAddress: string, options: { from: string }) {
      const comptrollerInstance = this.getComptrollerInstance(comptrollerAddress, options);
      return comptrollerInstance.functions._addRewardsDistributor(flywheelCoreAddress, options);
    }

    async accrueFlywheel(
      flywheelAddress: string,
      accountAddress: string,
      marketAddress: string,
      options: { from: string }
    ) {
      const flywheelCoreInstance = this.createFuseFlywheelCore(flywheelAddress);
      return flywheelCoreInstance.functions["accrue(address,address)"](marketAddress, accountAddress, options);
    }

    async getFlywheelClaimableRewardsForPool(poolAddress: string, account: string, options: { from: string }) {
      const pool = await this.getComptrollerInstance(poolAddress, options);
      const marketsOfPool = await pool.getAllMarkets();

      const rewardDistributorsOfPool = await pool.callStatic.getRewardsDistributors();
      const flywheels = rewardDistributorsOfPool.map((address) => this.createFuseFlywheelCore(address));
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

    async getFlywheelClaimableRewards(account: string, options: { from: string }) {
      const [comptrollerIndexes, comptrollers, flywheels] =
        await this.contracts.FusePoolLensSecondary.callStatic.getRewardsDistributorsBySupplier(account, options);

      return (
        await Promise.all(comptrollers.map((comp) => this.getFlywheelClaimableRewardsForPool(comp, account, options)))
      )
        .reduce((acc, curr) => [...acc, ...curr], []) // Flatten Array
        .filter((value, index, self) => self.indexOf(value) === index); // Unique Array;
    }

    async getFlywheelMarketRewardsByPool(
      pool: string,
      options: { from: string }
    ): Promise<FlywheelMarketRewardsInfo[]> {
      const [flywheelsOfPool, marketsOfPool] = await Promise.all([
        this.getFlywheelsByPool(pool, options),
        this.getComptrollerInstance(pool, options).callStatic.getAllMarkets(),
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

    async getFlywheelMarketRewardsByPoolWithAPR(
      pool: string,
      options: { from: string }
    ): Promise<FlywheelMarketRewardsInfo[]> {
      const marketRewards = await (
        this.contracts.FuseFlywheelLensRouter as FuseFlywheelLensRouter
      ).callStatic.getMarketRewardsInfo(pool, options);

      const adaptedMarketRewards = marketRewards.map((marketReward) => ({
        underlyingPrice: marketReward.underlyingPrice,
        market: marketReward.market,
        rewardsInfo: marketReward.rewardsInfo
          .filter((info) => info.rewardSpeedPerSecondPerToken.gt(0))
          .map((info) => ({
            rewardToken: info.rewardToken,
            flywheel: info.flywheel,
            rewardSpeedPerSecondPerToken: info.rewardSpeedPerSecondPerToken,
            rewardTokenPrice: info.rewardTokenPrice,
            formattedAPR: info.formattedAPR,
          })),
      }));
      return adaptedMarketRewards;
    }

    async getFlywheelMarketRewardsByPools(pools: string[], options: { from: string }) {
      return Promise.all(pools.map((pool) => this.getFlywheelMarketRewardsByPool(pool, options)));
    }

    async getFlywheelRewardsInfos(flywheelAddress: string, options: { from: string }) {
      const flywheelCoreInstance = this.createFuseFlywheelCore(flywheelAddress);
      const [fwStaticAddress, enabledMarkets] = await Promise.all([
        flywheelCoreInstance.callStatic.flywheelRewards(options),
        flywheelCoreInstance.callStatic.getAllStrategies(options),
      ]);
      const fwStatic = this.createFlywheelStaticRewards(fwStaticAddress);
      const rewardsInfos = {};
      await Promise.all(
        enabledMarkets.map(async (m) => {
          rewardsInfos[m] = await fwStatic.callStatic.rewardsInfo(m);
        })
      );
      return rewardsInfos;
    }

    async getFlywheelRewardsInfoForMarket(flywheelAddress: string, marketAddress: string, options: { from: string }) {
      const fwCoreInstance = this.createFuseFlywheelCore(flywheelAddress);
      const fwRewardsAddress = await fwCoreInstance.callStatic.flywheelRewards(options);
      const fwRewardsInstance = this.createFlywheelStaticRewards(fwRewardsAddress);
      const [marketState, rewardsInfo] = await Promise.all([
        await fwCoreInstance.callStatic.marketState(marketAddress, options),
        fwRewardsInstance.callStatic.rewardsInfo(marketAddress, options),
      ]);
      return {
        enabled: marketState.lastUpdatedTimestamp > 0,
        ...rewardsInfo,
      };
    }

    async getFlywheelsByPool(poolAddress: string, options: { from: string }): Promise<FlywheelCore[]> {
      const comptrollerInstance = this.getComptrollerInstance(poolAddress, options);
      const allRewardDistributors = await comptrollerInstance.callStatic.getRewardsDistributors(options);
      const instances = allRewardDistributors.map((address) => {
        return new Contract(
          address,
          this.artifacts.FuseFlywheelCore.abi,
          this.provider.getSigner(options.from)
        ) as FuseFlywheelCore;
      });

      const filterList = await Promise.all(
        instances.map(async (instance) => {
          try {
            return await instance.callStatic.isFlywheel(options);
          } catch (error) {
            return false;
          }
        })
      );

      return instances.filter((_, index) => filterList[index]);
    }
  };
}
