import { Contract, ContractInterface } from "ethers";
import { Abi, Address, getContract, GetContractReturnType, PublicClient, WalletClient } from "viem";

import { IonicBaseConstructor } from "..";
import AuthoritiesRegistryArtifact from "../../artifacts/AuthoritiesRegistry.sol/AuthoritiesRegistry.json";
import CompoundMarketERC4626Artifact from "../../artifacts/CompoundMarketERC4626.sol/CompoundMarketERC4626.json";
import IonicComptrollerArtifact from "../../artifacts/ComptrollerInterface.sol/IonicComptroller.json";
import ICErc20PluginRewardsArtifact from "../../artifacts/CTokenInterfaces.sol/CErc20PluginRewardsInterface.json";
import ICErc20Artifact from "../../artifacts/CTokenInterfaces.sol/ICErc20.json";
import FlywheelStaticRewardsArtifact from "../../artifacts/FlywheelStaticRewards.sol/FlywheelStaticRewards.json";
import ILeveredPositionFactoryArtifact from "../../artifacts/ILeveredPositionFactory.sol/ILeveredPositionFactory.json";
import ILiquidatorsRegistryArtifact from "../../artifacts/ILiquidatorsRegistry.sol/ILiquidatorsRegistry.json";
import IonicFlywheelArtifact from "../../artifacts/IonicFlywheel.sol/IonicFlywheel.json";
import IonicFlywheelLensRouterArtifact from "../../artifacts/IonicFlywheelLensRouter.sol/IonicFlywheelLensRouter.json";
import JumpRateModelArtifact from "../../artifacts/JumpRateModel.sol/JumpRateModel.json";
import LeveredPositionArtifact from "../../artifacts/LeveredPosition.sol/LeveredPosition.json";
import LeveredPositionsLensArtifact from "../../artifacts/LeveredPositionsLens.sol/LeveredPositionsLens.json";
import MasterPriceOracleArtifact from "../../artifacts/MasterPriceOracle.sol/MasterPriceOracle.json";
import OptimizedAPRVaultFirstExtensionArtifact from "../../artifacts/OptimizedAPRVaultFirstExtension.sol/OptimizedAPRVaultFirstExtension.json";
import OptimizedAPRVaultSecondExtensionArtifact from "../../artifacts/OptimizedAPRVaultSecondExtension.sol/OptimizedAPRVaultSecondExtension.json";
import OptimizedVaultsRegistryArtifact from "../../artifacts/OptimizedVaultsRegistry.sol/OptimizedVaultsRegistry.json";
import PoolLensArtifact from "../../artifacts/PoolLens.sol/PoolLens.json";
import PoolLensSecondaryArtifact from "../../artifacts/PoolLensSecondary.sol/PoolLensSecondary.json";
import PoolRolesAuthorityArtifact from "../../artifacts/PoolRolesAuthority.sol/PoolRolesAuthority.json";
import UnitrollerArtifact from "../../artifacts/Unitroller.sol/Unitroller.json";
import { AuthoritiesRegistry } from "../../typechain/AuthoritiesRegistry";
import { CompoundMarketERC4626 } from "../../typechain/CompoundMarketERC4626";
import { IonicComptroller } from "../../typechain/ComptrollerInterface.sol/IonicComptroller";
import { ICErc20 } from "../../typechain/CTokenInterfaces.sol/ICErc20";
import { ICErc20PluginRewards } from "../../typechain/CTokenInterfaces.sol/ICErc20PluginRewards";
import { FlywheelStaticRewards } from "../../typechain/FlywheelStaticRewards";
import { ILeveredPositionFactory } from "../../typechain/ILeveredPositionFactory.sol/ILeveredPositionFactory";
import { ILiquidatorsRegistry } from "../../typechain/ILiquidatorsRegistry.sol/ILiquidatorsRegistry";
import { IonicFlywheel } from "../../typechain/IonicFlywheel";
import { IonicFlywheelLensRouter } from "../../typechain/IonicFlywheelLensRouter.sol/IonicFlywheelLensRouter";
import { JumpRateModel } from "../../typechain/JumpRateModel";
import { LeveredPosition } from "../../typechain/LeveredPosition";
import { LeveredPositionsLens } from "../../typechain/LeveredPositionsLens";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { OptimizedAPRVaultFirstExtension } from "../../typechain/OptimizedAPRVaultFirstExtension";
import { OptimizedAPRVaultSecondExtension } from "../../typechain/OptimizedAPRVaultSecondExtension";
import { OptimizedVaultsRegistry } from "../../typechain/OptimizedVaultsRegistry";
import { PoolLens } from "../../typechain/PoolLens";
import { PoolLensSecondary } from "../../typechain/PoolLensSecondary.sol/PoolLensSecondary";
import { PoolRolesAuthority } from "../../typechain/PoolRolesAuthority";
import { Unitroller } from "../../typechain/Unitroller";
import { ionicComptrollerAbi, unitrollerAbi } from "../generated";

type OptimizedAPRVaultWithExtensions = OptimizedAPRVaultFirstExtension & OptimizedAPRVaultSecondExtension;

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
        });
    }

    createUnitroller = this.createContractInstance<typeof unitrollerAbi>(unitrollerAbi);
    createIonicFlywheel = this.createContractInstance<typeof ionicFlywheelAbi>(ionicFlywheelAbi);
    createFlywheelStaticRewards = this.createContractInstance<FlywheelStaticRewards>(FlywheelStaticRewardsArtifact.abi);
    createJumpRateModel = this.createContractInstance<JumpRateModel>(JumpRateModelArtifact.abi);

    createComptroller(comptrollerAddress: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
      if (this.chainDeployment.ComptrollerFirstExtension) {
        return getContract({
          address: comptrollerAddress,
          abi: ionicComptrollerAbi,
          client: {
            public: publicClient,
            wallet: walletClient
          }
        });
      }

      return new Contract(comptrollerAddress, IonicComptrollerArtifact.abi, signerOrProvider) as IonicComptroller;
    }

    createICErc20(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(address, ICErc20Artifact.abi, signerOrProvider) as ICErc20;
    }

    createICErc20PluginRewards(cTokenAddress: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(cTokenAddress, ICErc20PluginRewardsArtifact.abi, signerOrProvider) as ICErc20PluginRewards;
    }

    createMasterPriceOracle(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.MasterPriceOracle.address,
        MasterPriceOracleArtifact.abi,
        signerOrProvider
      ) as MasterPriceOracle;
    }

    createCompoundMarketERC4626(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(address, CompoundMarketERC4626Artifact.abi, signerOrProvider) as CompoundMarketERC4626;
    }

    createOptimizedAPRVault(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        address,
        [...OptimizedAPRVaultFirstExtensionArtifact.abi, ...OptimizedAPRVaultSecondExtensionArtifact.abi],
        signerOrProvider
      ) as OptimizedAPRVaultWithExtensions;
    }

    createOptimizedVaultsRegistry(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.OptimizedVaultsRegistry.address,
        OptimizedVaultsRegistryArtifact.abi,
        signerOrProvider
      ) as OptimizedVaultsRegistry;
    }

    createIonicFlywheelLensRouter(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.IonicFlywheelLensRouter.address,
        IonicFlywheelLensRouterArtifact.abi,
        signerOrProvider
      ) as IonicFlywheelLensRouter;
    }

    createLeveredPositionFactory(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.LeveredPositionFactory.address,
        ILeveredPositionFactoryArtifact.abi,
        signerOrProvider
      ) as ILeveredPositionFactory;
    }

    createLeveredPosition(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(address, LeveredPositionArtifact.abi, signerOrProvider) as LeveredPosition;
    }

    createLeveredPositionLens(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.LeveredPositionsLens.address,
        LeveredPositionsLensArtifact.abi,
        signerOrProvider
      ) as LeveredPositionsLens;
    }

    createPoolLens(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(this.chainDeployment.PoolLens.address, PoolLensArtifact.abi, signerOrProvider) as PoolLens;
    }

    createPoolLensSecondary(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.PoolLensSecondary.address,
        PoolLensSecondaryArtifact.abi,
        signerOrProvider
      ) as PoolLensSecondary;
    }

    createILiquidatorsRegistry(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.LiquidatorsRegistry.address,
        ILiquidatorsRegistryArtifact.abi,
        signerOrProvider
      ) as ILiquidatorsRegistry;
    }

    createAuthoritiesRegistry(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.AuthoritiesRegistry.address,
        AuthoritiesRegistryArtifact.abi,
        signerOrProvider
      ) as AuthoritiesRegistry;
    }

    createPoolRolesAuthority(poolAuthAddress: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(poolAuthAddress, PoolRolesAuthorityArtifact.abi, signerOrProvider) as PoolRolesAuthority;
    }
  };
}

export type CreateContractsModule = ReturnType<typeof withCreateContracts<IonicBaseConstructor>>;
