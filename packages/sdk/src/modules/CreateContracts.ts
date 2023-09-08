import { Contract, ContractInterface } from "ethers";

import { IonicBaseConstructor } from "..";
import { abi as AuthoritiesRegistryABI } from "../../artifacts/AuthoritiesRegistry.sol/AuthoritiesRegistry.json";
import { abi as CompoundMarketERC4626ABI } from "../../artifacts/CompoundMarketERC4626.sol/CompoundMarketERC4626.json";
import { abi as IonicComptrollerABI } from "../../artifacts/ComptrollerInterface.sol/IonicComptroller.json";
import { abi as ICErc20PluginRewardsABI } from "../../artifacts/CTokenInterfaces.sol/CErc20PluginRewardsInterface.json";
import { abi as FlywheelStaticRewardsABI } from "../../artifacts/FlywheelStaticRewards.sol/FlywheelStaticRewards.json";
import { abi as ICErc20ABI } from "../../artifacts/ICErc20.sol/ICErc20.json";
import { abi as ILeveredPositionFactoryABI } from "../../artifacts/ILeveredPositionFactory.sol/ILeveredPositionFactory.json";
import { abi as ILiquidatorsRegistryABI } from "../../artifacts/ILiquidatorsRegistry.sol/ILiquidatorsRegistry.json";
import { abi as IonicFlywheelABI } from "../../artifacts/IonicFlywheel.sol/IonicFlywheel.json";
import { abi as IonicFlywheelLensRouterABI } from "../../artifacts/IonicFlywheelLensRouter.sol/IonicFlywheelLensRouter.json";
import { abi as JumpRateModelABI } from "../../artifacts/JumpRateModel.sol/JumpRateModel.json";
import { abi as LeveredPositionABI } from "../../artifacts/LeveredPosition.sol/LeveredPosition.json";
import { abi as LeveredPositionsLensABI } from "../../artifacts/LeveredPositionsLens.sol/LeveredPositionsLens.json";
import { abi as MasterPriceOracleABI } from "../../artifacts/MasterPriceOracle.sol/MasterPriceOracle.json";
import { abi as OptimizedAPRVaultFirstExtensionABI } from "../../artifacts/OptimizedAPRVaultFirstExtension.sol/OptimizedAPRVaultFirstExtension.json";
import { abi as OptimizedAPRVaultSecondExtensionABI } from "../../artifacts/OptimizedAPRVaultSecondExtension.sol/OptimizedAPRVaultSecondExtension.json";
import { abi as OptimizedVaultsRegistryABI } from "../../artifacts/OptimizedVaultsRegistry.sol/OptimizedVaultsRegistry.json";
import { abi as PoolLensSecondaryABI } from "../../artifacts/PoolLensSecondary.sol/PoolLensSecondary.json";
import { abi as PoolRolesAuthorityABI } from "../../artifacts/PoolRolesAuthority.sol/PoolRolesAuthority.json";
import { abi as UnitrollerABI } from "../../artifacts/Unitroller.sol/Unitroller.json";
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
import { PoolLensSecondary } from "../../typechain/PoolLensSecondary.sol/PoolLensSecondary";
import { PoolRolesAuthority } from "../../typechain/PoolRolesAuthority";
import { Unitroller } from "../../typechain/Unitroller";
import { SignerOrProvider } from "../IonicSdk";

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
        return new Contract(comptrollerAddress, [...IonicComptrollerABI], signerOrProvider) as IonicComptroller;
      }

      return new Contract(comptrollerAddress, IonicComptrollerABI, signerOrProvider) as IonicComptroller;
    }

    createICErc20(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(address, ICErc20ABI, signerOrProvider) as ICErc20;
    }

    createICErc20PluginRewards(cTokenAddress: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(cTokenAddress, ICErc20PluginRewardsABI, signerOrProvider) as ICErc20PluginRewards;
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
        this.chainDeployment.IonicFlywheelLensRouter.address,
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

    createPoolLensSecondary(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.PoolLensSecondary.address,
        PoolLensSecondaryABI,
        signerOrProvider
      ) as PoolLensSecondary;
    }

    createILiquidatorsRegistry(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.LiquidatorsRegistry.address,
        ILiquidatorsRegistryABI,
        signerOrProvider
      ) as ILiquidatorsRegistry;
    }

    createAuthoritiesRegistry(signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(
        this.chainDeployment.AuthoritiesRegistry.address,
        AuthoritiesRegistryABI,
        signerOrProvider
      ) as AuthoritiesRegistry;
    }

    createPoolRolesAuthority(poolAuthAddress: string, signerOrProvider: SignerOrProvider = this.provider) {
      return new Contract(poolAuthAddress, PoolRolesAuthorityABI, signerOrProvider) as PoolRolesAuthority;
    }
  };
}

export type CreateContractsModule = ReturnType<typeof withCreateContracts<IonicBaseConstructor>>;
