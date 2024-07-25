import { Abi, Address, GetContractReturnType, PublicClient, WalletClient } from "viem";

import { IonicBaseConstructor } from "..";
import {
  authoritiesRegistryAbi,
  flywheelStaticRewardsAbi,
  flywheelDynamicRewardsAbi,
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
  poolLensAbi,
  poolLensSecondaryAbi,
  poolRolesAuthorityAbi,
  unitrollerAbi
} from "../generated";
import { getContract } from "../IonicSdk/utils";

export interface ICreateContracts {
  createContractInstance<T extends Abi>(
    abi: T
  ): (address: Address, publicClient?: PublicClient) => GetContractReturnType<T, WalletClient>;
  createUnitroller: (
    address: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof unitrollerAbi, WalletClient>;
  createIonicFlywheel: (
    address: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof ionicFlywheelAbi, WalletClient>;
  createFlywheelDynamicRewards: (
    address: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof flywheelDynamicRewardsAbi, WalletClient>;
  createFlywheelStaticRewards: (
    address: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof flywheelStaticRewardsAbi, WalletClient>;
  createJumpRateModel: (
    address: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof jumpRateModelAbi, WalletClient>;
  createComptroller: (
    comptrollerAddress: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof ionicComptrollerAbi, WalletClient>;
  createICErc20: (
    address: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof icErc20Abi, WalletClient>;
  createICErc20PluginRewards: (
    cTokenAddress: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof icErc20PluginRewardsAbi, WalletClient>;
  createMasterPriceOracle: (
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof masterPriceOracleAbi, WalletClient>;
  createIonicFlywheelLensRouter: (
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof ionicFlywheelLensRouterAbi, WalletClient>;
  createLeveredPositionFactory: (
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof iLeveredPositionFactoryAbi, WalletClient>;
  createLeveredPosition: (
    address: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof leveredPositionAbi, WalletClient>;
  createLeveredPositionLens: (
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof leveredPositionsLensAbi, WalletClient>;
  createPoolLens: (publicClient?: PublicClient) => GetContractReturnType<typeof poolLensAbi, WalletClient>;
  createPoolLensSecondary: (
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof poolLensSecondaryAbi, WalletClient>;
  createILiquidatorsRegistry: (
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof iLiquidatorsRegistryAbi, WalletClient>;
  createAuthoritiesRegistry: (
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof authoritiesRegistryAbi, WalletClient>;
  createPoolRolesAuthority: (
    poolAuthAddress: Address,
    publicClient?: PublicClient,
    walletClient?: WalletClient
  ) => GetContractReturnType<typeof poolRolesAuthorityAbi, WalletClient>;
}

export function withCreateContracts<TBase extends IonicBaseConstructor>(
  Base: TBase
): {
  new (...args: any[]): ICreateContracts;
} & TBase {
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
          client: walletClient ?? publicClient
        }) as unknown as GetContractReturnType<T, WalletClient>;
    }

    createUnitroller = this.createContractInstance<typeof unitrollerAbi>(unitrollerAbi);
    createIonicFlywheel = this.createContractInstance<typeof ionicFlywheelAbi>(ionicFlywheelAbi);
    createFlywheelStaticRewards =
      this.createContractInstance<typeof flywheelStaticRewardsAbi>(flywheelStaticRewardsAbi);
    createFlywheelDynamicRewards =
      this.createContractInstance<typeof flywheelDynamicRewardsAbi>(flywheelDynamicRewardsAbi);
    createJumpRateModel = this.createContractInstance<typeof jumpRateModelAbi>(jumpRateModelAbi);

    createComptroller(comptrollerAddress: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: comptrollerAddress,
        abi: ionicComptrollerAbi,
        client: walletClient ?? publicClient
      });
    }

    createICErc20(address: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address,
        abi: icErc20Abi,
        client: walletClient ?? publicClient
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
        client: walletClient ?? publicClient
      });
    }

    createMasterPriceOracle(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.MasterPriceOracle.address as Address,
        abi: masterPriceOracleAbi,
        client: walletClient ?? publicClient
      });
    }

    createIonicFlywheelLensRouter(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.IonicFlywheelLensRouter.address as Address,
        abi: ionicFlywheelLensRouterAbi,
        client: walletClient ?? publicClient
      });
    }

    createLeveredPositionFactory(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.LeveredPositionFactory.address as Address,
        abi: iLeveredPositionFactoryAbi,
        client: walletClient ?? publicClient
      });
    }

    createLeveredPosition(address: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address,
        abi: leveredPositionAbi,
        client: walletClient ?? publicClient
      });
    }

    createLeveredPositionLens(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.LeveredPositionsLens.address as Address,
        abi: leveredPositionsLensAbi,
        client: walletClient ?? publicClient
      });
    }

    createPoolLens(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.PoolLens.address as Address,
        abi: poolLensAbi,
        client: walletClient ?? publicClient
      });
    }

    createPoolLensSecondary(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.PoolLensSecondary.address as Address,
        abi: poolLensSecondaryAbi,
        client: walletClient ?? publicClient
      });
    }

    createILiquidatorsRegistry(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.LiquidatorsRegistry.address as Address,
        abi: iLiquidatorsRegistryAbi,
        client: walletClient ?? publicClient
      });
    }

    createAuthoritiesRegistry(publicClient = this.publicClient, walletClient = this.walletClient) {
      return getContract({
        address: this.chainDeployment.AuthoritiesRegistry.address as Address,
        abi: authoritiesRegistryAbi,
        client: walletClient ?? publicClient
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
        client: walletClient ?? publicClient
      });
    }
  };
}

export type CreateContractsModule = ReturnType<typeof withCreateContracts<IonicBaseConstructor>>;
