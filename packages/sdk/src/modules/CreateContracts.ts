import { Abi, Address, getContract, GetContractReturnType, WalletClient } from "viem";

import { IonicBaseConstructor } from "..";
import {
  authoritiesRegistryAbi,
  compoundMarketErc4626Abi,
  flywheelStaticRewardsAbi,
  icErc20Abi,
  icErc20PluginRewardsAbi,
  iLeveredPositionFactoryAbi,
  iLiquidatorsRegistryAbi,
  ionicComptrollerAbi,
  ionicFlywheelAbi,
  ionicFlywheelLensRouterAbi,
  jumpRateModelAbi,
  leveredPositionAbi,
  leveredPositionsLensAbi,
  masterPriceOracleAbi,
  optimizedAprVaultFirstExtensionAbi,
  optimizedVaultsRegistryAbi,
  poolLensAbi,
  poolLensSecondaryAbi,
  poolRolesAuthorityAbi,
  unitrollerAbi
} from "../generated";

export function withCreateContracts<TBase extends IonicBaseConstructor>(Base: TBase) {
  return class CreateContracts extends Base {
    createContractInstance<T extends Abi>(abi: Abi) {
      return (
        address: Address,
        publicClient = this.publicClient,
        walletClient = this.walletClient
      ): GetContractReturnType<T, WalletClient> =>
        getContract({
          address,
          abi,
          client: { public: publicClient, wallet: walletClient }
        }) as unknown as GetContractReturnType<T, WalletClient>;
    }

    createUnitroller = this.createContractInstance<typeof unitrollerAbi>(unitrollerAbi);
    createIonicFlywheel = this.createContractInstance<typeof ionicFlywheelAbi>(ionicFlywheelAbi);
    createFlywheelStaticRewards =
      this.createContractInstance<typeof flywheelStaticRewardsAbi>(flywheelStaticRewardsAbi);
    createJumpRateModel = this.createContractInstance<typeof jumpRateModelAbi>(jumpRateModelAbi);

    createComptroller(comptrollerAddress: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: comptrollerAddress,
        abi: ionicComptrollerAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createICErc20(address: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address,
        abi: icErc20Abi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createICErc20PluginRewards(
      cTokenAddress: Address,
      publicClient = this.publicClient,
      walletClient = this.walletClient
    ) {
      return getContract({
        address: cTokenAddress,
        abi: icErc20PluginRewardsAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createMasterPriceOracle(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.MasterPriceOracle.address as Address,
        abi: masterPriceOracleAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createCompoundMarketERC4626(address: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address,
        abi: compoundMarketErc4626Abi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createOptimizedAPRVault(address: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address,
        abi: optimizedAprVaultFirstExtensionAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createOptimizedVaultsRegistry(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.OptimizedVaultsRegistry.address as Address,
        abi: optimizedVaultsRegistryAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createIonicFlywheelLensRouter(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.IonicFlywheelLensRouter.address as Address,
        abi: ionicFlywheelLensRouterAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createLeveredPositionFactory(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.LeveredPositionFactory.address as Address,
        abi: iLeveredPositionFactoryAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createLeveredPosition(address: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address,
        abi: leveredPositionAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createLeveredPositionLens(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.LeveredPositionsLens.address as Address,
        abi: leveredPositionsLensAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createPoolLens(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.PoolLens.address as Address,
        abi: poolLensAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createPoolLensSecondary(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.PoolLensSecondary.address as Address,
        abi: poolLensSecondaryAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createILiquidatorsRegistry(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.LiquidatorsRegistry.address as Address,
        abi: iLiquidatorsRegistryAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createAuthoritiesRegistry(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.AuthoritiesRegistry.address as Address,
        abi: authoritiesRegistryAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }

    createPoolRolesAuthority(
      poolAuthAddress: Address,
      publicClient = this.publicClient,
      walletClient = this.walletClient
    ) {
      return getContract({
        address: poolAuthAddress,
        abi: poolRolesAuthorityAbi,
        client: {
          public: publicClient,
          wallet: walletClient
        }
      });
    }
  };
}

export type CreateContractsModule = ReturnType<typeof withCreateContracts<IonicBaseConstructor>>;
