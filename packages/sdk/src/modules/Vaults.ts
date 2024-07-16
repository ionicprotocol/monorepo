import { FlywheelRewardsInfoForVault, FundOperationMode, VaultData } from "@ionicprotocol/types";
import { BigNumber, constants, ContractTransaction, utils } from "ethers";

import EIP20InterfaceArtifact from "../../artifacts/EIP20Interface.sol/EIP20Interface.json";
import { getContract } from "../IonicSdk/utils";

import { CreateContractsModule } from "./CreateContracts";

export function withVaults<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Vaults extends Base {
    async getAllVaults(): Promise<VaultData[]> {
      return [];
    }

    async getClaimableRewardsForVaults(_: string): Promise<FlywheelRewardsInfoForVault[]> {
      return [];
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
