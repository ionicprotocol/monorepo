import { Address, getContract, GetContractReturnType, Hex, PublicClient } from "viem";

import { flywheelStaticRewardsAbi, ionicFlywheelAbi } from "../generated";

import { CreateContractsModule } from "./CreateContracts";

export interface FlywheelClaimableRewards {
  rewardToken: Address;
  amount: bigint;
  flywheel?: Address;
}

export type FlywheelMarketRewardsInfo = {
  market: Address;
  underlyingPrice?: bigint;
  rewardsInfo: {
    rewardToken: Address;
    flywheel: Address;
    rewardSpeedPerSecondPerToken?: bigint;
    rewardTokenPrice?: bigint;
    formattedAPR?: bigint;
  }[];
};

export interface IFlywheel {
  getFlywheelMarketRewardsByPools(pools: Address[]): Promise<FlywheelMarketRewardsInfo[][]>;
  getFlywheelMarketRewardsByPool(pool: Address): Promise<FlywheelMarketRewardsInfo[]>;
  getFlywheelsByPool(poolAddress: Address): Promise<GetContractReturnType<typeof ionicFlywheelAbi, PublicClient>[]>;
  getFlywheelRewardsInfos(flywheelAddress: Address): Promise<Record<string, any>>;
  getFlywheelsByPool(poolAddress: Address): Promise<GetContractReturnType<typeof ionicFlywheelAbi, PublicClient>[]>;
  getFlywheelRewardsInfos(flywheelAddress: Address): Promise<Record<string, any>>;
  getFlywheelMarketRewardsByPoolWithAPR(pool: Address): Promise<FlywheelMarketRewardsInfo[]>;
  getFlywheelRewardsInfoForMarket(flywheelAddress: Address, marketAddress: Address): Promise<any>;
  getFlywheelClaimableRewardsForMarket(
    poolAddress: Address,
    market: Address,
    account: Address
  ): Promise<FlywheelClaimableRewards[]>;
  getFlywheelClaimableRewardsByMarkets(
    poolAddress: Address,
    markets: Address[],
    account: Address
  ): Promise<FlywheelClaimableRewards[]>;
  getFlywheelClaimableRewardsForPool(poolAddress: Address, account: Address): Promise<FlywheelClaimableRewards[]>;
  getAllFlywheelClaimableRewards(account: Address): Promise<FlywheelClaimableRewards[]>;
  getRewardsForMarketsAndFlywheels(
    account: Address,
    markets: Address[],
    flywheels: Address[]
  ): Promise<FlywheelClaimableRewards[]>;
  getFlywheelEnabledMarkets(flywheelAddress: Address): Promise<Address[]>;
  setStaticRewardInfo(staticRewardsAddress: Address, marketAddress: Address, rewardInfo: any): Promise<Address>;
  setFlywheelRewards(flywheelAddress: Address, rewardsAddress: Address): Promise<Address>;
  addMarketForRewardsToFlywheelCore(flywheelCoreAddress: Address, marketAddress: Address): Promise<Address>;
  addStrategyForRewardsToFlywheelCore(flywheelCoreAddress: Address, marketAddress: Address): Promise<Address>;
  addFlywheelCoreToComptroller(flywheelCoreAddress: Address, comptrollerAddress: Address): Promise<Address>;
  claimRewardsForMarket(market: Address, flywheels: Address[]): Promise<Hex>;
  claimRewardsForMarkets(markets: Address[], flywheels: Address[]): Promise<Hex>;
  claimRewardsForPool(poolAddress: Address): Promise<Hex>;
  claimRewardsForRewardToken(rewardToken: Address): Promise<Hex>;
  claimAllRewards(): Promise<Hex>;
}

export function withFlywheel<TBase extends CreateContractsModule = CreateContractsModule>(
  Base: TBase
): {
  new (...args: any[]): IFlywheel;
} & TBase {
  return class Flywheel extends Base {
    /** READ */
    async getFlywheelMarketRewardsByPools(pools: Address[]) {
      return Promise.all(pools.map((pool) => this.getFlywheelMarketRewardsByPool(pool)));
    }

    async getFlywheelMarketRewardsByPool(pool: Address): Promise<FlywheelMarketRewardsInfo[]> {
      const retryOperation = async <T>(operation: () => Promise<T>, retries = 3): Promise<T> => {
        try {
          return await operation();
        } catch (error) {
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return retryOperation(operation, retries - 1);
          }
          throw error;
        }
      };

      try {
        // Use Promise.all with retry for initial data fetching
        const [flywheelsOfPool, marketsOfPool] = await Promise.all([
          retryOperation(() => this.getFlywheelsByPool(pool)),
          retryOperation(() => this.createComptroller(pool, this.publicClient).read.getAllMarkets())
        ]);

        // Get strategies with retry
        const strategiesOfFlywheels = await Promise.all(
          flywheelsOfPool.map((fw) => retryOperation(() => fw.read.getAllStrategies()))
        );

        const marketRewardsInfo = await Promise.all(
          marketsOfPool.map(async (market) => {
            // Filter and map operations combined to reduce async operations
            const rewardsInfo = await Promise.all(
              flywheelsOfPool
                .map(async (fw, fwIndex) => {
                  // Skip if market is not active in this flywheel
                  if (!strategiesOfFlywheels[fwIndex].includes(market)) {
                    return null;
                  }

                  try {
                    const rewardToken = await retryOperation(() => fw.read.rewardToken());
                    return {
                      rewardToken,
                      flywheel: fw.address
                    };
                  } catch (error) {
                    console.warn(`Failed to get reward token for flywheel ${fw.address}: ${error}`);
                    return null;
                  }
                })
                .filter((x): x is Promise<{ rewardToken: Hex; flywheel: Address } | null> => x !== null)
            );

            return {
              market,
              rewardsInfo: rewardsInfo.filter((info): info is { rewardToken: Hex; flywheel: Address } => info !== null)
            };
          })
        );

        return marketRewardsInfo;
      } catch (error) {
        console.error(`Failed to get flywheel market rewards for pool ${pool}:`, error);
        return [];
      }
    }

    async getFlywheelsByPool(
      poolAddress: Address
    ): Promise<GetContractReturnType<typeof ionicFlywheelAbi, PublicClient>[]> {
      const pool = this.createComptroller(poolAddress, this.publicClient);
      const allRewardDistributors = await pool.read.getRewardsDistributors();
      const instances = allRewardDistributors.map((address) => {
        return getContract({
          address,
          abi: ionicFlywheelAbi,
          client: this.publicClient
        });
      });

      const filterList = await Promise.all(
        instances.map(async (instance) => {
          try {
            return await instance.read.isFlywheel();
          } catch (error) {
            return false;
          }
        })
      );

      return instances.filter((_, index) => filterList[index]);
    }

    async getFlywheelRewardsInfos(flywheelAddress: Address) {
      const flywheelCoreInstance: GetContractReturnType<typeof ionicFlywheelAbi, PublicClient> = getContract({
        address: flywheelAddress,
        abi: ionicFlywheelAbi,
        client: this.publicClient
      });
      const [fwStaticAddress, enabledMarkets] = await Promise.all([
        flywheelCoreInstance.read.flywheelRewards(),
        flywheelCoreInstance.read.getAllStrategies()
      ]);
      const fwStatic = getContract({
        address: fwStaticAddress,
        abi: flywheelStaticRewardsAbi,
        client: this.publicClient
      });
      const rewardsInfos: Record<string, any> = {};
      await Promise.all(
        enabledMarkets.map(async (m) => {
          rewardsInfos[m] = await fwStatic.read.rewardsInfo([m]);
        })
      );
      return rewardsInfos;
    }

    async getFlywheelMarketRewardsByPoolWithAPR(pool: Address): Promise<FlywheelMarketRewardsInfo[]> {
      const marketRewards = await this.contracts.IonicFlywheelLensRouter.simulate.getPoolMarketRewardsInfo([pool]);

      const adaptedMarketRewards = marketRewards.result
        .map((marketReward) => ({
          underlyingPrice: marketReward.underlyingPrice,
          market: marketReward.market,
          rewardsInfo: marketReward.rewardsInfo.filter((info) => info.rewardSpeedPerSecondPerToken > BigInt(0))
        }))
        .filter((marketReward) => marketReward.rewardsInfo.length > 0);
      return adaptedMarketRewards;
    }

    async getFlywheelRewardsInfoForMarket(flywheelAddress: Address, marketAddress: Address) {
      const fwCoreInstance = this.createIonicFlywheel(flywheelAddress, this.publicClient);
      const fwRewardsAddress = await fwCoreInstance.read.flywheelRewards();
      const fwRewardsInstance = this.createFlywheelDynamicRewards(fwRewardsAddress, this.publicClient);
      const [marketState, rewardsInfo] = await Promise.all([
        fwCoreInstance.read.marketState([marketAddress]),
        fwRewardsInstance.read.rewardsCycle([marketAddress])
      ]);
      return {
        enabled: marketState[1] > 0,
        ...rewardsInfo
      };
    }

    async getFlywheelClaimableRewardsForMarket(
      poolAddress: Address,
      market: Address,
      account: Address
    ): Promise<FlywheelClaimableRewards[]> {
      const pool = this.createComptroller(poolAddress, this.publicClient);
      const rewardDistributors = await pool.read.getRewardsDistributors();

      const fwLensRouter = this.createIonicFlywheelLensRouter();

      const result = await fwLensRouter.simulate.claimRewardsForMarket([
        account,
        market,
        rewardDistributors,
        Array.from(rewardDistributors, () => true)
      ]);
      const [_flywheels, rewardTokens, rewards] = result.result;

      return _flywheels.map((flywheel, i) => {
        return {
          flywheel,
          rewardToken: rewardTokens[i],
          amount: rewards[i]
        };
      });
    }

    async getFlywheelClaimableRewardsByMarkets(
      poolAddress: Address,
      markets: Address[],
      account: Address
    ): Promise<FlywheelClaimableRewards[]> {
      const pool = this.createComptroller(poolAddress, this.publicClient);
      const rewardDistributors = await pool.read.getRewardsDistributors();

      const fwLensRouter = this.createIonicFlywheelLensRouter();

      const result = await fwLensRouter.simulate.claimRewardsForMarkets([
        account,
        markets,
        rewardDistributors,
        Array.from(rewardDistributors, () => true)
      ]);
      const [_flywheels, rewardTokens, rewards] = result.result;

      return _flywheels.map((flywheel, i) => {
        return {
          flywheel,
          rewardToken: rewardTokens[i],
          amount: rewards[i]
        };
      });
    }

    async getFlywheelClaimableRewardsForPool(poolAddress: Address, account: Address) {
      const fwLensRouter = this.createIonicFlywheelLensRouter();

      const result = await fwLensRouter.simulate.claimRewardsForPool([account, poolAddress]);
      const [_flywheels, rewardTokens, rewards] = result.result;

      return _flywheels.map((flywheel, i) => {
        return {
          flywheel,
          rewardToken: rewardTokens[i],
          amount: rewards[i]
        };
      });
    }

    async getAllFlywheelClaimableRewards(account: Address) {
      const fwLensRouter = this.createIonicFlywheelLensRouter();

      const result = await fwLensRouter.simulate.claimAllRewardTokens([account]);
      const [rewardTokens, rewards] = result.result;

      return rewardTokens.map((rewardToken, i) => {
        return {
          rewardToken,
          amount: rewards[i]
        };
      });
    }

    async getRewardsForMarketsAndFlywheels(
      account: Address,
      markets: Address[],
      flywheels: Address[]
    ): Promise<FlywheelClaimableRewards[]> {
      const fwLensRouter = this.createIonicFlywheelLensRouter();

      const result = await fwLensRouter.simulate.claimRewardsForMarkets([
        account,
        markets,
        flywheels,
        Array.from(flywheels, () => true)
      ]);
      const [_flywheels, rewardTokens, rewards] = result.result;

      return rewardTokens.map((rewardToken, i) => {
        return {
          flywheel: _flywheels[i],
          rewardToken,
          amount: rewards[i]
        };
      });
    }

    /** WRITE */
    async getFlywheelEnabledMarkets(flywheelAddress: Address): Promise<Address[]> {
      return (await this.createIonicFlywheel(flywheelAddress).read.getAllStrategies()) as Address[];
    }

    setStaticRewardInfo(staticRewardsAddress: Address, marketAddress: Address, rewardInfo: any): Promise<Address> {
      const staticRewardsInstance = this.createFlywheelStaticRewards(staticRewardsAddress, this.publicClient);
      return staticRewardsInstance.write.setRewardsInfo([marketAddress, rewardInfo], {
        account: this.walletClient!.account!.address,
        chain: this.walletClient!.chain
      });
    }

    setFlywheelRewards(flywheelAddress: Address, rewardsAddress: Address): Promise<Address> {
      const flywheelCoreInstance = this.createIonicFlywheel(flywheelAddress, this.publicClient);
      return flywheelCoreInstance.write.setFlywheelRewards([rewardsAddress], {
        account: this.walletClient!.account!.address,
        chain: this.walletClient!.chain
      });
    }

    addMarketForRewardsToFlywheelCore(flywheelCoreAddress: Address, marketAddress: Address): Promise<Address> {
      return this.addStrategyForRewardsToFlywheelCore(flywheelCoreAddress, marketAddress);
    }

    addStrategyForRewardsToFlywheelCore(flywheelCoreAddress: Address, marketAddress: Address) {
      const flywheelCoreInstance = this.createIonicFlywheel(flywheelCoreAddress, this.publicClient);
      return flywheelCoreInstance.write.addStrategyForRewards([marketAddress], {
        account: this.walletClient!.account!.address,
        chain: this.walletClient!.chain
      });
    }

    addFlywheelCoreToComptroller(flywheelCoreAddress: Address, comptrollerAddress: Address) {
      const comptrollerInstance = this.createComptroller(comptrollerAddress, this.publicClient);
      return comptrollerInstance.write._addRewardsDistributor([flywheelCoreAddress], {
        account: this.walletClient!.account!.address,
        chain: this.walletClient!.chain
      });
    }

    /**
      @notice claim rewards of single market.
      @param market market cToken address
      @param flywheels available flywheels addresses which market could have
      @return contract transaction
    */
    async claimRewardsForMarket(market: Address, flywheels: Address[]): Promise<Hex> {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient);
      const account = this.walletClient!.account!.address;

      const tx = await fwLensRouter.write.claimRewardsForMarket(
        [account, market, flywheels, Array.from(flywheels, () => true)],
        { account, chain: this.walletClient!.chain }
      );

      return tx;
    }

    /**
      @notice claim rewards of multiple markets.
      @param market markets cToken addresses
      @param flywheels available flywheels addresses which markets could have
      @return contract transaction
    */
    async claimRewardsForMarkets(markets: Address[], flywheels: Address[]): Promise<Hex> {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient);
      const account = this.walletClient!.account!.address;

      const tx = await fwLensRouter.write.claimRewardsForMarkets(
        [account, markets, flywheels, Array.from(flywheels, () => true)],
        { account, chain: this.walletClient!.chain }
      );

      return tx;
    }

    /**
      @notice claim rewards of single pool.
      @param poolAddress pool address
      @return contract transaction
    */
    async claimRewardsForPool(poolAddress: Address): Promise<Hex> {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient);
      const account = this.walletClient!.account!.address;

      const tx = await fwLensRouter.write.claimRewardsForPool([account, poolAddress], {
        account,
        chain: this.walletClient!.chain
      });

      return tx;
    }

    /**
      @notice claim rewards for specific reward token
      @param rewardToken reward token address
      @return contract transaction
    */
    async claimRewardsForRewardToken(rewardToken: Address): Promise<Hex> {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient);
      const account = this.walletClient!.account!.address;

      const tx = await fwLensRouter.write.claimRewardsOfRewardToken([account, rewardToken], {
        account,
        chain: this.walletClient!.chain
      });

      return tx;
    }

    /**
      @notice claim all rewards
      @return contract transaction
    */
    async claimAllRewards(): Promise<Hex> {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient);
      const account = this.walletClient!.account!.address;

      const tx = await fwLensRouter.write.claimAllRewardTokens([account], { account, chain: this.walletClient!.chain });

      return tx;
    }
  };
}
