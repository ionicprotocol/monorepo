import {
  Adapter,
  FlywheelRewardsInfoForVault,
  FundOperationMode,
  SupportedChains,
  VaultData
} from "@ionicprotocol/types";
import { Address, erc20Abi, formatUnits, getContract, Hex, maxUint256 } from "viem";

import { CreateContractsModule } from "./CreateContracts";
import { ChainSupportedAssets } from "./Pools";

export interface IVaults {
  getAllVaults(): Promise<VaultData[]>;
  getClaimableRewardsForVaults(account: Address): Promise<FlywheelRewardsInfoForVault[]>;
  vaultApprove(vault: Address, asset: Address): Promise<Hex>;
  vaultDeposit(vault: Address, amount: bigint): Promise<{ tx: Hex }>;
  vaultWithdraw(vault: Address, amount: bigint): Promise<{ tx: Hex }>;
  getUpdatedVault(mode: FundOperationMode, vault: VaultData, amount: bigint): Promise<VaultData>;
  getMaxWithdrawVault(vault: Address): Promise<bigint>;
  getMaxDepositVault(vault: Address): Promise<bigint>;
  claimRewardsForVault(vault: Address): Promise<{ tx: Hex }>;
}

export function withVaults<TBase extends CreateContractsModule = CreateContractsModule>(
  Base: TBase
): {
  new (...args: any[]): IVaults;
} & TBase {
  return class Vaults extends Base {
    async getAllVaults(): Promise<VaultData[]> {
      if (this.chainId === SupportedChains.chapel || this.chainId === SupportedChains.polygon) {
        try {
          const optimizedVaultsRegistry = this.createOptimizedVaultsRegistry();
          const vaultsData = await optimizedVaultsRegistry.read.getVaultsData();
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

              const underlyingPrice = await mpo.read.price([data.asset]);
              const totalSupplyNative =
                Number(formatUnits(data.estimatedTotalAssets, data.assetDecimals)) *
                Number(formatUnits(underlyingPrice, 18));

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
                adapters: data.adaptersData as Adapter[],
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

    async getClaimableRewardsForVaults(account: Address): Promise<FlywheelRewardsInfoForVault[]> {
      if (this.chainId === SupportedChains.chapel || this.chainId === SupportedChains.polygon) {
        try {
          const rewardsInfoForVaults: FlywheelRewardsInfoForVault[] = [];
          const optimizedVaultsRegistry = this.createOptimizedVaultsRegistry();
          const claimableRewards = await optimizedVaultsRegistry.simulate.getClaimableRewards([account], { account });

          claimableRewards.result.map((reward) => {
            if (reward.rewards > 0n) {
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

    async vaultApprove(vault: Address, asset: Address) {
      const token = getContract({ address: asset, abi: erc20Abi, client: this.walletClient });
      const tx = await token.write.approve([vault, maxUint256], {
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });

      return tx;
    }

    async vaultDeposit(vault: Address, amount: bigint) {
      const tx = await this.walletClient.writeContract({
        address: vault,
        abi: ["function deposit(uint256)"],
        functionName: "deposit",
        args: [amount],
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });

      return { tx };
    }

    async vaultWithdraw(vault: Address, amount: bigint) {
      const tx = await this.walletClient.writeContract({
        address: vault,
        abi: ["function withdraw(uint256)"],
        functionName: "deposit",
        args: [amount],
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });

      return { tx };
    }

    async getUpdatedVault(mode: FundOperationMode, vault: VaultData, amount: bigint) {
      let updatedVault: VaultData = vault;
      const optimizedAPRVault = this.createOptimizedAPRVaultSecond(vault.vault);

      if (mode === FundOperationMode.SUPPLY) {
        const totalSupply = vault.totalSupply + amount;
        const totalSupplyNative =
          Number(formatUnits(totalSupply, vault.decimals)) * Number(formatUnits(vault.underlyingPrice, 18));
        const supplyApy = await optimizedAPRVault.read.supplyAPY([amount]);
        updatedVault = {
          ...vault,
          totalSupply,
          totalSupplyNative,
          supplyApy
        };
      } else if (mode === FundOperationMode.WITHDRAW) {
        const totalSupply = vault.totalSupply - amount;
        const totalSupplyNative =
          Number(formatUnits(totalSupply, vault.decimals)) * Number(formatUnits(vault.underlyingPrice, 18));
        const supplyApy = await optimizedAPRVault.read.supplyAPY([amount]);
        updatedVault = {
          ...vault,
          totalSupply,
          totalSupplyNative,
          supplyApy
        };
      }

      return updatedVault;
    }

    async getMaxWithdrawVault(vault: Address) {
      const optimizedAPRVault = this.createOptimizedAPRVaultSecond(vault, this.publicClient, this.walletClient);

      return await optimizedAPRVault.read.maxWithdraw([this.walletClient.account!.address]);
    }

    async getMaxDepositVault(vault: Address) {
      const optimizedAPRVault = this.createOptimizedAPRVaultSecond(vault, this.publicClient, this.walletClient);

      return await optimizedAPRVault.read.maxDeposit([this.walletClient.account!.address]);
    }

    async claimRewardsForVault(vault: Address) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.publicClient, this.walletClient);
      const tx = await optimizedAPRVault.write.claimRewards({
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });

      return { tx };
    }
  };
}
