import { BigNumber, BigNumberish, Contract, ContractFactory } from "ethers";
import { Comptroller } from "../../typechain/Comptroller";
import { ERC20 } from "../../typechain/ERC20";
import { RewardsDistributorDelegate } from "../../typechain/RewardsDistributorDelegate";
import { FuseBaseConstructor } from "../Fuse/types";

export interface ClaimableReward {
  distributor: string;
  rewardToken: string;
  amount: BigNumber;
}

export interface Reward {
  distributor: string;
  rewardToken: string;
  speed: BigNumber;
}
export interface MarketReward {
  cToken: string;
  supplyRewards: Reward[];
  borrowRewards: Reward[];
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

    addRewardsDistributorToPool(rewardsDistributorAddress: string, poolAddress: string, options: { from: string }) {
      const comptrollerInstance = new Contract(
        poolAddress,
        this.artifacts.Comptroller.abi,
        this.provider.getSigner(options.from)
      ) as Comptroller;
      return comptrollerInstance.functions._addRewardsDistributor(rewardsDistributorAddress);
    }

    async fundRewardsDistributor(rewardsDistributorAddress: string, amount: BigNumberish, options: { from: string }) {
      const rewardsDistributorInstance = this.#getRewardsDistributor(rewardsDistributorAddress, options);

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
      const rewardsDistributorInstance = this.#getRewardsDistributor(rewardsDistributorAddress, options);
      return rewardsDistributorInstance.compSupplySpeeds(cTokenAddress);
    }

    getRewardsDistributorBorrowSpeed(
      rewardsDistributorAddress: string,
      cTokenAddress: string,
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributor(rewardsDistributorAddress, options);
      return rewardsDistributorInstance.compSupplySpeeds(cTokenAddress);
    }

    updateRewardsDistributorSupplySpeed(
      rewardsDistributorAddress: string,
      cTokenAddress: string,
      amount: BigNumberish,
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributor(rewardsDistributorAddress, options);

      return rewardsDistributorInstance._setCompSupplySpeed(cTokenAddress, amount);
    }

    updateRewardsDistributorBorrowSpeed(
      rewardsDistributorAddress: string,
      cTokenAddress: string,
      amount: BigNumberish,
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributor(rewardsDistributorAddress, options);

      return rewardsDistributorInstance._setCompBorrowSpeed(cTokenAddress, amount);
    }

    updateRewardsDistributorSpeeds(
      rewardsDistributorAddress: string,
      cTokenAddress: string[],
      amountSuppliers: BigNumberish[],
      amountBorrowers: BigNumberish[],
      options: { from: string }
    ) {
      const rewardsDistributorInstance = this.#getRewardsDistributor(rewardsDistributorAddress, options);

      return rewardsDistributorInstance._setCompSpeeds(cTokenAddress, amountSuppliers, amountBorrowers);
    }

    async getRewardsDistributorMarketRewardsByPool(pool: string, options: { from: string }): Promise<MarketReward[]> {
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
        marketRewards: MarketReward[];
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

    claimAllRewardsDistributorRewards(rewardsDistributorAddress: string, options: { from: string }) {
      const rewardsDistributorInstance = this.#getRewardsDistributor(rewardsDistributorAddress, options);
      return rewardsDistributorInstance.functions["claimRewards(address)"](options.from);
    }

    #getRewardsDistributor(rewardsDistributorAddress: string, options: { from: string }) {
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
    ): MarketReward[] {
      const marketRewards: MarketReward[] = allMarkets.map((market, marketIndex) => ({
        cToken: market,
        supplyRewards: supplySpeeds[marketIndex]
          .filter((speed) => speed.gt(0))
          .map((speed, speedIndex) => ({
            distributor: distributors[speedIndex],
            rewardToken: rewardTokens[speedIndex],
            speed,
          })),
        borrowRewards: borrowSpeeds[marketIndex]
          .filter((speed) => speed.gt(0))
          .map((speed, speedIndex) => ({
            distributor: distributors[speedIndex],
            rewardToken: rewardTokens[speedIndex],
            speed,
          })),
      }));

      return marketRewards;
    }
  };
}
