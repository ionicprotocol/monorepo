import { FundOperationMode, SupportedChains, VaultData } from "@midas-capital/types";
import { BigNumber, constants, Contract, ContractTransaction, utils } from "ethers";

import EIP20InterfaceABI from "../../abis/EIP20Interface";
import OptimizedVaultsRegistryABI from "../../abis/OptimizedVaultsRegistry";
import { OptimizedVaultsRegistry } from "../../typechain/OptimizedVaultsRegistry";
import { getContract } from "../MidasSdk/utils";

import { CreateContractsModule } from "./CreateContracts";
import { ChainSupportedAssets } from "./FusePools";

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

              const [
                asset,
                totalSupply,
                supplyApy,
                adapterCount,
                emergencyExit,
                {
                  performance: performanceFee,
                  deposit: depositFee,
                  withdrawal: withdrawalFee,
                  management: managementFee,
                },
              ] = await Promise.all([
                optimizedAPRVault.callStatic.asset(),
                optimizedAPRVault.callStatic.estimatedTotalAssets(),
                optimizedAPRVault.callStatic.supplyAPY(0),
                optimizedAPRVault.callStatic.adapterCount(),
                optimizedAPRVault.callStatic.emergencyExit(),
                optimizedAPRVault.callStatic.fees(),
              ]);

              const cToken = this.createCTokenWithExtensions(asset);
              let [symbol, decimals] = await Promise.all([cToken.callStatic.symbol(), cToken.callStatic.decimals()]);

              const _asset = ChainSupportedAssets[this.chainId as SupportedChains].find(
                (ass) => ass.underlying === asset
              );

              let extraDocs: string | undefined;

              if (_asset) {
                symbol = _asset.symbol;
                decimals = _asset.decimals;
                extraDocs = _asset.extraDocs;
              }

              const _adapters =
                adapterCount > 0
                  ? await Promise.all(
                      Array.from(Array(adapterCount).keys()).map((i) => optimizedAPRVault.callStatic.adapters(i))
                    )
                  : [];

              const adapters = await Promise.all(
                _adapters.map(async (adapter) => {
                  const adapterInstance = this.createCompoundMarketERC4626(adapter.adapter);
                  const marketAddress = await adapterInstance.callStatic.market();
                  const cTokenInstance = this.createCTokenWithExtensions(marketAddress);
                  const comptrollerAddress = await cTokenInstance.callStatic.comptroller();

                  return {
                    adapter: adapter.adapter,
                    allocation: adapter.allocation,
                    market: marketAddress,
                    comptroller: comptrollerAddress,
                  };
                })
              );

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
                extraDocs,
                performanceFee,
                depositFee,
                withdrawalFee,
                managementFee,
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

    async getMaxWithdrawVault(vault: string) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);

      return await optimizedAPRVault.callStatic.maxWithdraw(await this.signer.getAddress());
    }

    async getMaxDepositVault(vault: string) {
      const optimizedAPRVault = this.createOptimizedAPRVault(vault, this.signer);

      return await optimizedAPRVault.callStatic.maxDeposit(await this.signer.getAddress());
    }
  };
}
