import { Contract, ContractInterface } from "ethers";

import { IonicBaseConstructor } from "..";
import CErc20DelegateABI from "../../abis/CErc20Delegate";
import CErc20PluginRewardsDelegateABI from "../../abis/CErc20PluginRewardsDelegate";
import CompoundMarketERC4626ABI from "../../abis/CompoundMarketERC4626";
import ComptrollerABI from "../../abis/Comptroller";
import ComptrollerFirstExtensionABI from "../../abis/ComptrollerFirstExtension";
import CTokenFirstExtensionABI from "../../abis/CTokenFirstExtension";
import FlywheelStaticRewardsABI from "../../abis/FlywheelStaticRewards";
import FusePoolLensSecondaryABI from "../../abis/FusePoolLensSecondary";
import ILeveredPositionFactoryABI from "../../abis/ILeveredPositionFactory";
import ILiquidatorsRegistryABI from "../../abis/ILiquidatorsRegistry";
import JumpRateModelABI from "../../abis/JumpRateModel";
import LeveredPositionABI from "../../abis/LeveredPosition";
import LeveredPositionsLensABI from "../../abis/LeveredPositionsLens";
import MasterPriceOracleABI from "../../abis/MasterPriceOracle";
import IonicFlywheelABI from "../../abis/MidasFlywheel";
import IonicFlywheelLensRouterABI from "../../abis/MidasFlywheelLensRouter";
import OptimizedAPRVaultFirstExtensionABI from "../../abis/OptimizedAPRVaultFirstExtension";
import OptimizedAPRVaultSecondExtensionABI from "../../abis/OptimizedAPRVaultSecondExtension";
import OptimizedVaultsRegistryABI from "../../abis/OptimizedVaultsRegistry";
import UnitrollerABI from "../../abis/Unitroller";
import { CErc20Delegate } from "../../typechain/CErc20Delegate";
import { CErc20PluginRewardsDelegate } from "../../typechain/CErc20PluginRewardsDelegate";
import { CompoundMarketERC4626 } from "../../typechain/CompoundMarketERC4626";
import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { FlywheelStaticRewards } from "../../typechain/FlywheelStaticRewards";
import { FusePoolLensSecondary } from "../../typechain/FusePoolLensSecondary";
import { ILeveredPositionFactory } from "../../typechain/ILeveredPositionFactory";
import { ILiquidatorsRegistry } from "../../typechain/ILiquidatorsRegistry";
import { JumpRateModel } from "../../typechain/JumpRateModel";
import { LeveredPosition } from "../../typechain/LeveredPosition";
import { LeveredPositionsLens } from "../../typechain/LeveredPositionsLens";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { MidasFlywheel as IonicFlywheel } from "../../typechain/MidasFlywheel";
import { MidasFlywheelLensRouter as IonicFlywheelLensRouter } from "../../typechain/MidasFlywheelLensRouter";
import { OptimizedAPRVaultFirstExtension } from "../../typechain/OptimizedAPRVaultFirstExtension";
import { OptimizedAPRVaultSecondExtension } from "../../typechain/OptimizedAPRVaultSecondExtension";
import { OptimizedVaultsRegistry } from "../../typechain/OptimizedVaultsRegistry";
import { Unitroller } from "../../typechain/Unitroller";
import { SignerOrProvider } from "../IonicSdk";

type ComptrollerWithExtensions = Comptroller & ComptrollerFirstExtension;
type CTokenWithExtensions = CErc20Delegate & CTokenFirstExtension;
type OptimizedAPRVaultWithExtensions = OptimizedAPRVaultFirstExtension & OptimizedAPRVaultSecondExtension;

export function withCreateContracts<TBase extends IonicBaseConstructor>(Base: TBase) {
  return class CreateContracts extends Base {
    createContractInstance<T extends Contract>(abi: ContractInterface) {
      return (address: string, signerOrProvider: SignerOrProvider = this.signer) =>
        new Contract(address, abi, signerOrProvider) as T;
    }

    createUnitroller = this.createContractInstance<Unitroller>(UnitrollerABI);
    createIonicFlywheel = this.createContractInstance<IonicFlywheel>(IonicFlywheelABI);
    createFlywheelStaticRewards = this.createContractInstance<FlywheelStaticRewards>(FlywheelStaticRewardsABI);
    createJumpRateModel = this.createContractInstance<JumpRateModel>(JumpRateModelABI);

    createComptroller(comptrollerAddress: string, signerOrProvider: SignerOrProvider = this.provider) {
      if (this.chainDeployment.ComptrollerFirstExtension) {
        return new Contract(
          comptrollerAddress,
          [...ComptrollerABI, ...ComptrollerFirstExtensionABI],
          signerOrProvider
        ) as ComptrollerWithExtensions;
      }

      return new Contract(comptrollerAddress, ComptrollerABI, signerOrProvider) as ComptrollerWithExtensions;
    }

    createCTokenWithExtensions(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      if (this.chainDeployment.CTokenFirstExtension) {
        return new Contract(
          address,
          [...CErc20DelegateABI, ...CTokenFirstExtensionABI],
          signerOrProvider
        ) as CTokenWithExtensions;
      }

      return new Contract(address, CErc20DelegateABI, signerOrProvider) as CTokenWithExtensions;
    }

    createCErc20PluginRewardsDelegate(cTokenAddress: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        cTokenAddress,
        CErc20PluginRewardsDelegateABI,
        signerOrProvider
      ) as CErc20PluginRewardsDelegate;
    }

    createMasterPriceOracle(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.MasterPriceOracle.address,
        MasterPriceOracleABI,
        signerOrProvider
      ) as MasterPriceOracle;
    }

    createCompoundMarketERC4626(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(address, CompoundMarketERC4626ABI, signerOrProvider) as CompoundMarketERC4626;
    }

    createOptimizedAPRVault(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        address,
        [...OptimizedAPRVaultFirstExtensionABI, ...OptimizedAPRVaultSecondExtensionABI],
        signerOrProvider
      ) as OptimizedAPRVaultWithExtensions;
    }

    createOptimizedVaultsRegistry(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.OptimizedVaultsRegistry.address,
        OptimizedVaultsRegistryABI,
        signerOrProvider
      ) as OptimizedVaultsRegistry;
    }

    createIonicFlywheelLensRouter(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.MidasFlywheelLensRouter.address,
        IonicFlywheelLensRouterABI,
        signerOrProvider
      ) as IonicFlywheelLensRouter;
    }

    createLeveredPositionFactory(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.LeveredPositionFactory.address,
        ILeveredPositionFactoryABI,
        signerOrProvider
      ) as ILeveredPositionFactory;
    }

    createLeveredPosition(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(address, LeveredPositionABI, signerOrProvider) as LeveredPosition;
    }

    createLeveredPositionLens(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.LeveredPositionsLens.address,
        LeveredPositionsLensABI,
        signerOrProvider
      ) as LeveredPositionsLens;
    }

    createFusePoolLensSecondary(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.FusePoolLensSecondary.address,
        FusePoolLensSecondaryABI,
        signerOrProvider
      ) as FusePoolLensSecondary;
    }

    createILiquidatorsRegistry(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.LiquidatorsRegistry.address,
        ILiquidatorsRegistryABI,
        signerOrProvider
      ) as ILiquidatorsRegistry;
    }
  };
}

export type CreateContractsModule = ReturnType<typeof withCreateContracts<IonicBaseConstructor>>;
