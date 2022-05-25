import { BigNumber, BigNumberish, Contract, ContractFactory } from "ethers";

import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { ERC20 } from "../../lib/contracts/typechain/ERC20";
import { FuseFlywheelCore } from "../../lib/contracts/typechain/FuseFlywheelCore";
import { RewardsDistributorDelegate } from "../../lib/contracts/typechain/RewardsDistributorDelegate";
import { FuseBaseConstructor } from "../types";

export interface ClaimableReward {
  distributor: string;
  rewardToken: string;
  amount: BigNumber;
}

export interface RewardsDistributorReward {
  distributor: string;
  rewardToken: string;
  rewardsPerBlock: BigNumber;
}
export interface RewardsDistributorMarketReward {
  cToken: string;
  supplyRewards: RewardsDistributorReward[];
  borrowRewards: RewardsDistributorReward[];
}

export function withRewardsDistributor<TBase extends FuseBaseConstructor>(Base: TBase) {
  return class RewardsDistributor extends Base {
    async deployRewardsDistributor(rewardTokenAddress: string, options: { from: string }) {
      const rewardsDistributorFactory = new ContractFactory(
        this.artifacts.RewardsDistributorDelegator.abi,
        this.artifacts.RewardsDistributorDelegator.bytecode.object,
        this.provider.getSigner()
      );
      return (await rewardsDistributorFactory.deploy(
        options.from,
        rewardTokenAddress,
        this.chainDeployment.RewardsDistributorDelegate.address
      )) as RewardsDistributorDelegate;
    }

    async addRewardsDistributorToPool(
      rewardsDistributorAddress: string,
      poolAddress: string,
      options: { from: string }
    ) {
      const comptrollerInstance = new Contract(
        poolAddress,
        this.artifacts.Comptroller.abi,
        this.provider.getSigner(options.from)
      ) as Comptroller;
      return await comptrollerInstance.functions._addRewardsDistributor(rewardsDistributorAddress);
    }

    async fundRewardsDistributor(rewardsDistributorAddress: string, amount: BigNumberish, options: { from: string }) {
      const rewardsDistributorInstance = this.#getRewardsDistributorInstance(rewardsDistributorAddress, options);

      const rewardTokenAddress = await rewardsDistributorInstance.rewardToken();

      const tokenInstance = new Contract(
        rewardTokenAddress,
        this.artifacts.ERC20.abi,
        this.provider.getSigner(options.from)
      ) as ERC20;

      return tokenInstance.functions.transfer(rewardsDistributorAddress, amount);
    }

    getRewardsDistributorSupplySpeed(
      rewardsDistributorAddress: string,
      cTokenAddress: string,
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributorInstance(rewardsDistributorAddress, options);
      return rewardsDistributorInstance.compSupplySpeeds(cTokenAddress);
    }

    getRewardsDistributorBorrowSpeed(
      rewardsDistributorAddress: string,
      cTokenAddress: string,
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributorInstance(rewardsDistributorAddress, options);
      return rewardsDistributorInstance.compSupplySpeeds(cTokenAddress);
    }

    updateRewardsDistributorSupplySpeed(
      rewardsDistributorAddress: string,
      cTokenAddress: string,
      rewardsPerBlock: BigNumberish,
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributorInstance(rewardsDistributorAddress, options);

      return rewardsDistributorInstance._setCompSupplySpeed(cTokenAddress, rewardsPerBlock);
    }

    updateRewardsDistributorBorrowSpeed(
      rewardsDistributorAddress: string,
      cTokenAddress: string,
      rewardsPerBlock: BigNumberish,
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributorInstance(rewardsDistributorAddress, options);

      return rewardsDistributorInstance._setCompBorrowSpeed(cTokenAddress, rewardsPerBlock);
    }

    updateRewardsDistributorSpeeds(
      rewardsDistributorAddress: string,
      cTokenAddress: string[],
      rewardsPerBlockSuppliers: BigNumberish[],
      rewardsPerBlockBorrowers: BigNumberish[],
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributorInstance(rewardsDistributorAddress, options);

      return rewardsDistributorInstance._setCompSpeeds(
        cTokenAddress,
        rewardsPerBlockSuppliers,
        rewardsPerBlockBorrowers
      );
    }

    async getRewardsDistributorMarketRewardsByPool(
      pool: string,
      options: { from: string }
    ): Promise<RewardsDistributorMarketReward[]> {
      const rewardSpeedsByPoolResponse = await this.contracts.FusePoolLensSecondary.callStatic.getRewardSpeedsByPool(
        pool,
        options
      );
      return this.#createMarketRewards(...rewardSpeedsByPoolResponse);
    }

    async getRewardsDistributorMarketRewardsByPools(
      pools: string[],
      options: { from: string }
    ): Promise<
      {
        pool: string;
        marketRewards: RewardsDistributorMarketReward[];
      }[]
    > {
      const [allMarkets, distributors, rewardTokens, supplySpeeds, borrowSpeeds] =
        await this.contracts.FusePoolLensSecondary.callStatic.getRewardSpeedsByPools(pools, options);
      const poolsWithMarketRewards = pools.map((pool, index) => ({
        pool,
        marketRewards: this.#createMarketRewards(
          allMarkets[index],
          distributors[index],
          rewardTokens[index],
          supplySpeeds[index],
          borrowSpeeds[index]
        ),
      }));

      return poolsWithMarketRewards;
    }

    async getRewardsDistributorClaimableRewards(account: string, options: { from: string }) {
      const [comptrollerIndexes, comptrollers, rewardsDistributors] =
        await this.contracts.FusePoolLensSecondary.callStatic.getRewardsDistributorsBySupplier(account, options);

      const uniqueRewardsDistributors = rewardsDistributors
        .reduce((acc, curr) => [...acc, ...curr], []) // Flatten Array
        .filter((value, index, self) => self.indexOf(value) === index); // Unique Array

      const [rewardTokens, compUnclaimedTotal, allMarkets, rewardsUnaccrued, distributorFunds] =
        await this.contracts.FusePoolLensSecondary.callStatic.getUnclaimedRewardsByDistributors(
          account,
          uniqueRewardsDistributors,
          options
        );

      const claimableRewards: ClaimableReward[] = uniqueRewardsDistributors
        .filter((_, index) => compUnclaimedTotal[index].gt(0)) // Filter out Distributors without Rewards
        .map((distributor, index) => ({
          distributor,
          rewardToken: rewardTokens[index],
          amount: compUnclaimedTotal[index],
        }));
      return claimableRewards;
    }

    async getRewardsDistributorsBySupplier(account: string, options: { from: string }) {
      return await this.contracts.FusePoolLensSecondary.callStatic.getRewardsDistributorsBySupplier(account, options);
    }

    async getRewardsDistributorsByPool(poolAddress: string, options: { from: string }) {
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
            return !(await instance.isFlywheel());
          } catch (error) {
            return true;
          }
        })
      );

      const rdInstances = allRewardDistributors
        .filter((_, index) => filterList[index])
        .map((address) => this.#getRewardsDistributorInstance(address, options));

      return rdInstances;
    }

    claimAllRewardsDistributorRewards(rewardsDistributorAddress: string, options: { from: string }) {
      const rewardsDistributorInstance = this.#getRewardsDistributorInstance(rewardsDistributorAddress, options);
      return rewardsDistributorInstance.functions["claimRewards(address)"](options.from);
    }

    #getRewardsDistributorInstance(rewardsDistributorAddress: string, options: { from: string }) {
      return new Contract(
        rewardsDistributorAddress,
        this.chainDeployment.RewardsDistributorDelegate.abi,
        this.provider.getSigner(options.from)
      ) as RewardsDistributorDelegate;
    }

    #createMarketRewards(
      allMarkets: string[],
      distributors: string[],
      rewardTokens: string[],
      supplySpeeds: BigNumber[][],
      borrowSpeeds: BigNumber[][]
    ): RewardsDistributorMarketReward[] {
      const marketRewards: RewardsDistributorMarketReward[] = allMarkets.map((market, marketIndex) => ({
        cToken: market,
        supplyRewards: supplySpeeds[marketIndex]
          .filter((speed) => speed.gt(0))
          .map((speed, speedIndex) => ({
            distributor: distributors[speedIndex],
            rewardToken: rewardTokens[speedIndex],
            rewardsPerBlock: speed,
          })),
        borrowRewards: borrowSpeeds[marketIndex]
          .filter((speed) => speed.gt(0))
          .map((speed, speedIndex) => ({
            distributor: distributors[speedIndex],
            rewardToken: rewardTokens[speedIndex],
            rewardsPerBlock: speed,
          })),
      }));

      return marketRewards;
    }
  };
}
