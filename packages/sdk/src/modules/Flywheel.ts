import { Address, getContract, GetContractReturnType, PublicClient } from "viem";

import FlywheelStaticRewardsArtifact from "../../artifacts/FlywheelStaticRewards.sol/FlywheelStaticRewards.json";
import IonicFlywheelArtifact from "../../artifacts/IonicFlywheel.sol/IonicFlywheel.json";
import { FlywheelStaticRewards } from "../../typechain/FlywheelStaticRewards";
import { IonicFlywheel } from "../../typechain/IonicFlywheel";
import { IonicFlywheelLensRouter } from "../../typechain/IonicFlywheelLensRouter.sol/IonicFlywheelLensRouter";
import { flywheelStaticRewardsAbi, ionicFlywheelAbi } from "../generated";

import { CreateContractsModule } from "./CreateContracts";

export interface FlywheelClaimableRewards {
  flywheel: string;
  rewardToken: string;
  amount: bigint;
}

export type FlywheelMarketRewardsInfo = {
  market: string;
  underlyingPrice?: bigint;
  rewardsInfo: {
    rewardToken: string;
    flywheel: string;
    rewardSpeedPerSecondPerToken?: bigint;
    rewardTokenPrice?: bigint;
    formattedAPR?: bigint;
  }[];
};

export function withFlywheel<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Flywheel extends Base {
    /** READ */
    async getFlywheelMarketRewardsByPools(pools: Address[]) {
      return Promise.all(pools.map((pool) => this.getFlywheelMarketRewardsByPool(pool)));
    }

    async getFlywheelMarketRewardsByPool(pool: Address): Promise<FlywheelMarketRewardsInfo[]> {
      const [flywheelsOfPool, marketsOfPool] = await Promise.all([
        this.getFlywheelsByPool(pool),
        this.createComptroller(pool, this.publicClient, this.walletClient).read.getAllMarkets()
      ]);
      const strategiesOfFlywheels = await Promise.all(flywheelsOfPool.map((fw) => fw.read.getAllStrategies()));

      const rewardTokens: string[] = [];
      const marketRewardsInfo = await Promise.all(
        marketsOfPool.map(async (market) => {
          const rewardsInfo = await Promise.all(
            flywheelsOfPool
              // Make sure this market is active in this flywheel
              .filter((_, fwIndex) => strategiesOfFlywheels[fwIndex].includes(market))
              // TODO also check marketState?
              .map(async (fw) => {
                const rewardToken = await fw.read.rewardToken();
                rewardTokens.push(rewardToken);
                return {
                  rewardToken,
                  flywheel: fw.address
                };
              })
          );
          return {
            market,
            rewardsInfo
          };
        })
      );

      return marketRewardsInfo;
    }

    async getFlywheelsByPool(
      poolAddress: Address
    ): Promise<GetContractReturnType<typeof ionicFlywheelAbi, PublicClient>[]> {
      const pool = this.createComptroller(poolAddress, this.publicClient, this.walletClient);
      const allRewardDistributors = await pool.read.getRewardsDistributors();
      const instances = allRewardDistributors.map((address) => {
        return getContract({
          address,
          abi: ionicFlywheelAbi,
          client: { public: this.publicClient, wallet: this.walletClient }
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
      const fwRewardsInstance = this.createFlywheelStaticRewards(fwRewardsAddress, this.publicClient);
      const [marketState, rewardsInfo] = await Promise.all([
        fwCoreInstance.read.marketState([marketAddress]),
        fwRewardsInstance.read.rewardsInfo([marketAddress])
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

    /** WRITE */
    getFlywheelEnabledMarkets(flywheelAddress: Address) {
      return this.createIonicFlywheel(flywheelAddress).read.getAllStrategies();
    }

    setStaticRewardInfo(staticRewardsAddress: Address, marketAddress: Address, rewardInfo: any) {
      const staticRewardsInstance = this.createFlywheelStaticRewards(
        staticRewardsAddress,
        this.publicClient,
        this.walletClient
      );
      return staticRewardsInstance.write.setRewardsInfo([marketAddress, rewardInfo], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });
    }

    setFlywheelRewards(flywheelAddress: Address, rewardsAddress: Address) {
      const flywheelCoreInstance = this.createIonicFlywheel(flywheelAddress, this.publicClient, this.walletClient);
      return flywheelCoreInstance.write.setFlywheelRewards([rewardsAddress], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });
    }

    addMarketForRewardsToFlywheelCore(flywheelCoreAddress: Address, marketAddress: Address) {
      return this.addStrategyForRewardsToFlywheelCore(flywheelCoreAddress, marketAddress);
    }

    addStrategyForRewardsToFlywheelCore(flywheelCoreAddress: Address, marketAddress: Address) {
      const flywheelCoreInstance = this.createIonicFlywheel(flywheelCoreAddress, this.publicClient, this.walletClient);
      return flywheelCoreInstance.write.addStrategyForRewards([marketAddress], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });
    }

    addFlywheelCoreToComptroller(flywheelCoreAddress: Address, comptrollerAddress: Address) {
      const comptrollerInstance = this.createComptroller(comptrollerAddress, this.publicClient, this.walletClient);
      return comptrollerInstance.write._addRewardsDistributor([flywheelCoreAddress], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });
    }

    /**
      @notice claim rewards of single market.
      @param market market cToken address
      @param flywheels available flywheels addresses which market could have
      @return contract transaction
    */
    async claimRewardsForMarket(market: Address, flywheels: Address[]) {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient, this.walletClient);
      const account = this.walletClient.account!.address;

      const tx = await fwLensRouter.write.claimRewardsForMarket(
        [account, market, flywheels, Array.from(flywheels, () => true)],
        { account, chain: this.walletClient.chain }
      );

      return tx;
    }

    /**
      @notice claim rewards of multiple markets.
      @param market markets cToken addresses
      @param flywheels available flywheels addresses which markets could have
      @return contract transaction
    */
    async claimRewardsForMarkets(markets: Address[], flywheels: Address[]) {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient, this.walletClient);
      const account = this.walletClient.account!.address;

      const tx = await fwLensRouter.write.claimRewardsForMarkets(
        [account, markets, flywheels, Array.from(flywheels, () => true)],
        { account, chain: this.walletClient.chain }
      );

      return tx;
    }

    /**
      @notice claim rewards of single pool.
      @param poolAddress pool address
      @return contract transaction
    */
    async claimRewardsForPool(poolAddress: Address) {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient, this.walletClient);
      const account = this.walletClient.account!.address;

      const tx = await fwLensRouter.write.claimRewardsForPool([account, poolAddress], {
        account,
        chain: this.walletClient.chain
      });

      return tx;
    }

    /**
      @notice claim rewards for specific reward token
      @param rewardToken reward token address
      @return contract transaction
    */
    async claimRewardsForRewardToken(rewardToken: Address) {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient, this.walletClient);
      const account = this.walletClient.account!.address;

      const tx = await fwLensRouter.write.claimRewardsOfRewardToken([account, rewardToken], {
        account,
        chain: this.walletClient.chain
      });

      return tx;
    }

    /**
      @notice claim all rewards
      @return contract transaction
    */
    async claimAllRewards() {
      const fwLensRouter = this.createIonicFlywheelLensRouter(this.publicClient, this.walletClient);
      const account = this.walletClient.account!.address;

      const tx = await fwLensRouter.write.claimAllRewardTokens([account], { account, chain: this.walletClient.chain });

      return tx;
    }
  };
}
