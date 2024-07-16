import { FlywheelRewardsInfoForVault, VaultData } from "@ionicprotocol/types";
import { Address, erc20Abi, getContract, Hex, maxUint256 } from "viem";

import { CreateContractsModule } from "./CreateContracts";

export interface IVaults {
  getAllVaults(): Promise<VaultData[]>;
  getClaimableRewardsForVaults(account: Address): Promise<FlywheelRewardsInfoForVault[]>;
  vaultApprove(vault: Address, asset: Address): Promise<Hex>;
  vaultDeposit(vault: Address, amount: bigint): Promise<{ tx: Hex }>;
  vaultWithdraw(vault: Address, amount: bigint): Promise<{ tx: Hex }>;
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
      const token = getContract({ address: asset, abi: erc20Abi, client: this.publicClient });
      const tx = await token.write.approve([vault, maxUint256], {
        account: this.walletClient!.account!.address,
        chain: this.walletClient!.chain
      });

      return tx;
    }

    async vaultDeposit(vault: Address, amount: bigint) {
      const tx = await this.walletClient!.writeContract({
        address: vault,
        abi: ["function deposit(uint256)"],
        functionName: "deposit",
        args: [amount],
        account: this.walletClient!.account!.address,
        chain: this.walletClient!.chain
      });

      return { tx };
    }

    async vaultWithdraw(vault: Address, amount: bigint) {
      const tx = await this.walletClient!.writeContract({
        address: vault,
        abi: ["function withdraw(uint256)"],
        functionName: "deposit",
        args: [amount],
        account: this.walletClient!.account!.address,
        chain: this.walletClient!.chain
      });

      return { tx };
    }
  };
}
