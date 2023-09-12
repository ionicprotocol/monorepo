import { FlywheelRewardsInfoForVault, FundOperationMode, SupportedChains, VaultData } from "@ionicprotocol/types";
import { BigNumber, constants, ContractTransaction, utils } from "ethers";

import EIP20InterfaceArtifact from "../../artifacts/EIP20Interface.sol/EIP20Interface.json";
import { getContract } from "../IonicSdk/utils";

import { CreateContractsModule } from "./CreateContracts";
import { ChainSupportedAssets } from "./Pools";

export function withVaults<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Vaults extends Base {
    async getAllVaults(): Promise<VaultData[]> {
      if (this.chainId === SupportedChains.chapel) {
        try {
          const optimizedVaultsRegistry = this.createOptimizedVaultsRegistry();
          const vaultsData = await optimizedVaultsRegistry.callStatic.getVaultsData();
          const mpo = this.createMasterPriceOracle();

          return await Promise.all(
            vaultsData.map(async (data) => {
              let symbol = data.assetSymbol;
              let extraDocs: string | undefined;

              const asset = ChainSupportedAssets[this.chainId as SupportedChains].find(
                (ass) => ass.underlying === data.asset
              );

              if (asset) {
                symbol = asset.symbol;
                extraDocs = asset.extraDocs;
              }

              const underlyingPrice = await mpo.callStatic.price(data.asset);
              const totalSupplyNative =
                Number(utils.formatUnits(data.estimatedTotalAssets, data.assetDecimals)) *
                Number(utils.formatUnits(underlyingPrice, 18));

              return {
                vault: data.vault,
                chainId: this.chainId,
                totalSupply: data.estimatedTotalAssets,
                totalSupplyNative,
                asset: data.asset,
                symbol,
                supplyApy: data.apr,
                adaptersCount: Number(data.adaptersCount),
                isEmergencyStopped: data.isEmergencyStopped,
                adapters: data.adaptersData,
                decimals: data.assetDecimals,
                underlyingPrice,
                extraDocs,
                performanceFee: data.performanceFee,
                depositFee: data.depositFee,
                withdrawalFee: data.withdrawalFee,
                managementFee: data.managementFee
              };
            })
          );
        } catch (error) {
          this.logger.error(`get vaults error in chain ${this.chainId}:  ${error}`);

          throw Error(
            `Getting vaults failed in chain ${this.chainId}: ` + (error instanceof Error ? error.message : error)
          );
        }
      } else {
        return [];
      }
    }

    async getClaimableRewardsForVaults(account: string): Promise<FlywheelRewardsInfoForVault[]> {
      if (this.chainId === SupportedChains.chapel) {
        try {
          const rewardsInfoForVaults: FlywheelRewardsInfoForVault[] = [];
          const optimizedVaultsRegistry = this.createOptimizedVaultsRegistry();
          const claimableRewards = await optimizedVaultsRegistry.callStatic.getClaimableRewards(account);

          claimableRewards.map((reward) => {
            if (reward.rewards.gt(0)) {
              const vault = reward.vault;
              const chainId = Number(this.chainId);

              // trying to get reward token symbol from defined assets list in sdk
              const asset = ChainSupportedAssets[this.chainId as SupportedChains].find(
                (ass) => ass.underlying === reward.rewardToken
              );
              const rewardTokenSymbol = asset ? asset.symbol : reward.rewardTokenSymbol;

              const rewardsInfo = {
                rewardToken: reward.rewardToken,
                flywheel: reward.flywheel,
                rewards: reward.rewards,
                rewardTokenDecimals: reward.rewardTokenDecimals,
                rewardTokenSymbol
              };

              const rewardsAdded = rewardsInfoForVaults.find((info) => info.vault === vault);
              if (rewardsAdded) {
                rewardsAdded.rewardsInfo.push(rewardsInfo);
              } else {
                rewardsInfoForVaults.push({ vault, chainId, rewardsInfo: [rewardsInfo] });
              }
            }
          });

          return rewardsInfoForVaults;
        } catch (error) {
          this.logger.error(
            `get claimable rewards of vaults error for account ${account} in chain ${this.chainId}:  ${error}`
          );

          throw Error(
            `get claimable rewards of vaults error for account ${account} in chain ${this.chainId}: ` +
              (error instanceof Error ? error.message : error)
          );
        }
      } else {
        return [];
      }
    }

    async vaultApprove(vault: string, asset: string) {
      const token = getContract(asset, EIP20InterfaceArtifact.abi, this.signer);
      const tx = await token.approve(vault, constants.MaxUint256);

      return tx;
    }

    async vaultDeposit(vault: string, amount: BigNumber) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);
      const tx: ContractTransaction = await optimizedAPRVault["deposit(uint256)"](amount);

      return { tx };
    }

    async vaultWithdraw(vault: string, amount: BigNumber) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);
      const tx: ContractTransaction = await optimizedAPRVault["withdraw(uint256)"](amount);

      return { tx };
    }

    async getUpdatedVault(mode: FundOperationMode, vault: VaultData, amount: BigNumber) {
      let updatedVault: VaultData = vault;
      const optimizedAPRVault = this.createOptimizedAPRVault(vault.vault);

      if (mode === FundOperationMode.SUPPLY) {
        const totalSupply = vault.totalSupply.add(amount);
        const totalSupplyNative =
          Number(utils.formatUnits(totalSupply, vault.decimals)) * Number(utils.formatUnits(vault.underlyingPrice, 18));
        const supplyApy = await optimizedAPRVault.callStatic.supplyAPY(amount);
        updatedVault = {
          ...vault,
          totalSupply,
          totalSupplyNative,
          supplyApy
        };
      } else if (mode === FundOperationMode.WITHDRAW) {
        const totalSupply = vault.totalSupply.sub(amount);
        const totalSupplyNative =
          Number(utils.formatUnits(totalSupply, vault.decimals)) * Number(utils.formatUnits(vault.underlyingPrice, 18));
        const supplyApy = await optimizedAPRVault.callStatic.supplyAPY(amount);
        updatedVault = {
          ...vault,
          totalSupply,
          totalSupplyNative,
          supplyApy
        };
      }

      return updatedVault;
    }

    async getMaxWithdrawVault(vault: string) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);

      return await optimizedAPRVault.callStatic.maxWithdraw(await this.signer.getAddress());
    }

    async getMaxDepositVault(vault: string) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);

      return await optimizedAPRVault.callStatic.maxDeposit(await this.signer.getAddress());
    }

    async claimRewardsForVault(vault: string) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);
      const tx: ContractTransaction = await optimizedAPRVault.claimRewards();

      return { tx };
    }
  };
}
