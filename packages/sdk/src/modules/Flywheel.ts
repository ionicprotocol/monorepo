import { BigNumber, CallOverrides, constants, Contract, ContractFactory } from "ethers";

import { FlywheelStaticRewards__factory } from "../../lib/contracts/typechain/factories/FlywheelStaticRewards__factory";
import { MidasFlywheel__factory } from "../../lib/contracts/typechain/factories/MidasFlywheel__factory";
import { FlywheelStaticRewards } from "../../lib/contracts/typechain/FlywheelStaticRewards";
import { MidasFlywheel } from "../../lib/contracts/typechain/MidasFlywheel";
import { MidasFlywheelLensRouter } from "../../lib/contracts/typechain/MidasFlywheelLensRouter.sol";

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
    /** READ */
    async getFlywheelMarketRewardsByPools(pools: string[]) {
      return Promise.all(pools.map((pool) => this.getFlywheelMarketRewardsByPool(pool)));
    }

    async getFlywheelMarketRewardsByPool(pool: string): Promise<FlywheelMarketRewardsInfo[]> {
      const [flywheelsOfPool, marketsOfPool] = await Promise.all([
        this.getFlywheelsByPool(pool),
        this.getComptrollerInstance(pool).callStatic.getAllMarkets(),
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
      const comptrollerInstance = new Contract(poolAddress, this.artifacts.Comptroller.abi, this.provider);
      const allRewardDistributors = await comptrollerInstance.callStatic.getRewardsDistributors();
      const instances = allRewardDistributors.map((address) => {
        return new Contract(address, this.artifacts.MidasFlywheel.abi, this.provider) as MidasFlywheel;
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
        this.artifacts.MidasFlywheel.abi,
        this.provider
      ) as MidasFlywheel;
      const [fwStaticAddress, enabledMarkets] = await Promise.all([
        flywheelCoreInstance.callStatic.flywheelRewards(),
        flywheelCoreInstance.callStatic.getAllStrategies(),
      ]);
      const fwStatic = new Contract(fwStaticAddress, this.artifacts.FlywheelStaticRewards.abi, this.provider);
      const rewardsInfos = {};
      await Promise.all(
        enabledMarkets.map(async (m) => {
          rewardsInfos[m] = await fwStatic.callStatic.rewardsInfo(m);
        })
      );
      return rewardsInfos;
    }

    async getFlywheelClaimableRewardsForPool(poolAddress: string, account: string) {
      const pool = await this.getComptrollerInstance(poolAddress, this.signer);
      const marketsOfPool = await pool.getAllMarkets();

      const rewardDistributorsOfPool = await pool.callStatic.getRewardsDistributors();
      const flywheels = rewardDistributorsOfPool.map((address) => this.createMidasFlywheel(address));
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
      const pool = this.getComptrollerInstance(poolAddress, this.signer);
      const rewardDistributorsOfPool = await pool.callStatic.getRewardsDistributors();
      const flywheels = rewardDistributorsOfPool.map((address) => this.createMidasFlywheel(address));
      const flywheelWithRewards: FlywheelClaimableRewards[] = [];
      for (const flywheel of flywheels) {
        const rewards: FlywheelClaimableRewards["rewards"] = [];
        const rewardOfMarket = await flywheel.callStatic["accrue(address,address)"](market, account);
        if (rewardOfMarket.gt(0)) {
          rewards.push({
            market,
            amount: rewardOfMarket,
          });
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

    async getFlywheelClaimableRewards(account: string) {
      const [, comptrollers] = await this.contracts.FusePoolLensSecondary.callStatic.getRewardsDistributorsBySupplier(
        account,
        { from: account }
      );

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
      const fwCoreInstance = this.createMidasFlywheel(flywheelAddress);
      const fwRewardsAddress = await fwCoreInstance.callStatic.flywheelRewards();
      const fwRewardsInstance = this.createFlywheelStaticRewards(fwRewardsAddress);
      const [marketState, rewardsInfo] = await Promise.all([
        await fwCoreInstance.callStatic.marketState(marketAddress),
        fwRewardsInstance.callStatic.rewardsInfo(marketAddress),
      ]);
      return {
        enabled: marketState[1] > 0,
        ...rewardsInfo,
      };
    }
    /** WRITE */
    async deployFlywheelCore(
      rewardTokenAddress: string,
      options?: {
        rewardsAddress?: string;
        boosterAddress?: string;
        ownerAddress?: string;
        authorityAddress?: string;
      }
    ) {
      const midasFlywheel = new ContractFactory(
        this.artifacts.MidasFlywheel.abi,
        this.artifacts.MidasFlywheel.bytecode,
        this.signer
      ) as MidasFlywheel__factory;
      const addressOfSigner = await this.signer.getAddress();
      const flywheelCore = await midasFlywheel.deploy();
      const initializeTx = await flywheelCore.initialize(
        rewardTokenAddress,
        options?.rewardsAddress || constants.AddressZero,
        options?.boosterAddress || constants.AddressZero,
        options?.ownerAddress || addressOfSigner
      );
      await initializeTx.wait();
      return flywheelCore;
    }
    async deployFlywheelStaticRewards(
      flywheelCoreAddress: string,
      options?: {
        ownerAddress?: string;
        authorityAddress?: string;
      }
    ) {
      const fwStaticRewardsFactory = new ContractFactory(
        this.artifacts.FlywheelStaticRewards.abi,
        this.artifacts.FlywheelStaticRewards.bytecode,
        this.signer
      ) as FlywheelStaticRewards__factory;
      const addressOfSigner = await this.signer.getAddress();
      return (await fwStaticRewardsFactory.deploy(
        flywheelCoreAddress,
        options?.ownerAddress || addressOfSigner,
        options?.authorityAddress || constants.AddressZero
      )) as FlywheelStaticRewards;
    }

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
      const comptrollerInstance = this.getComptrollerInstance(comptrollerAddress, this.signer);
      return comptrollerInstance.functions._addRewardsDistributor(flywheelCoreAddress);
    }
  };
}
