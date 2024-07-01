import { FlywheelRewardsInfoForVault, FundOperationMode, VaultData } from "@ionicprotocol/types";
import { Address, erc20Abi, formatUnits, getContract, Hex, maxUint256 } from "viem";

import { CreateContractsModule } from "./CreateContracts";

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
      return [];
    }

    async getClaimableRewardsForVaults(): Promise<FlywheelRewardsInfoForVault[]> {
      return [];
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
