import { FundOperationMode, SupportedChains, VaultData } from "@midas-capital/types";
import { BigNumber, constants, Contract, ContractTransaction, utils } from "ethers";

import EIP20InterfaceABI from "../../abis/EIP20Interface";
import OptimizedVaultsRegistryABI from "../../abis/OptimizedVaultsRegistry";
import { OptimizedVaultsRegistry } from "../../typechain/OptimizedVaultsRegistry";
import { getContract } from "../MidasSdk/utils";

import { CreateContractsModule } from "./CreateContracts";

export function withVaults<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Vaults extends Base {
    async getAllVaults(): Promise<VaultData[]> {
      if (this.chainId === SupportedChains.chapel) {
        try {
          const optimizedVaultsRegistry = new Contract(
            this.chainDeployment.OptimizedVaultsRegistry.address,
            OptimizedVaultsRegistryABI,
            this.provider
          ) as OptimizedVaultsRegistry;

          const vaults = await optimizedVaultsRegistry.callStatic.getAllVaults();

          return await Promise.all(
            vaults.map(async (vault) => {
              const optimizedAPRVault = this.createOptimizedAPRVault(vault);
              const mpo = this.createMasterPriceOracle();

              const [asset, symbol, totalSupply, supplyApy, adapterCount, emergencyExit, decimals] = await Promise.all([
                optimizedAPRVault.callStatic.asset(),
                optimizedAPRVault.callStatic.symbol(),
                optimizedAPRVault.callStatic.estimatedTotalAssets(),
                optimizedAPRVault.callStatic["estimatedAPR()"](), // TODO: replace supplyAPY()
                optimizedAPRVault.callStatic.adapterCount(),
                optimizedAPRVault.callStatic.emergencyExit(),
                optimizedAPRVault.callStatic.decimals(),
              ]);

              const adapters =
                adapterCount > 0
                  ? await Promise.all(
                      Array.from(Array(adapterCount).keys()).map((i) => optimizedAPRVault.callStatic.adapters(i))
                    )
                  : [];

              const underlyingPrice = await mpo.callStatic.price(asset);
              const totalSupplyNative =
                Number(utils.formatUnits(totalSupply, decimals)) * Number(utils.formatUnits(underlyingPrice, 18));

              return {
                vault,
                chainId: this.chainId,
                totalSupply,
                totalSupplyNative,
                asset,
                symbol,
                supplyApy,
                adapterCount,
                emergencyExit,
                adapters,
                decimals,
                underlyingPrice,
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

    async vaultApprove(vault: string, asset: string) {
      const token = getContract(asset, EIP20InterfaceABI, this.signer);
      const tx = await token.approve(vault, constants.MaxUint256);

      return tx;
    }

    async vaultDeposit(vault: string, amount: BigNumber) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);
      const response = await optimizedAPRVault.callStatic["deposit(uint256)"](amount);

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());

        return { errorCode };
      }

      const tx: ContractTransaction = await optimizedAPRVault["deposit(uint256)"](amount);

      return { tx, errorCode: null };
    }

    async vaultWithdraw(vault: string, amount: BigNumber) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);
      const response = await optimizedAPRVault.callStatic["withdraw(uint256)"](amount);

      if (response.toString() !== "0") {
        const errorCode = parseInt(response.toString());

        return { errorCode };
      }
      const tx: ContractTransaction = await optimizedAPRVault["withdraw(uint256)"](amount);

      return { tx, errorCode: null };
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
          supplyApy,
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
          supplyApy,
        };
      }

      return updatedVault;
    }
  };
}
