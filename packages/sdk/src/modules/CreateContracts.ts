import { Contract, ContractInterface } from "ethers";
import { Fragment } from "ethers/lib/utils";

import { MidasBaseConstructor } from "..";
import FlywheelStaticRewardsABI from "../../abis/FlywheelStaticRewards";
import JumpRateModelABI from "../../abis/JumpRateModel";
import MidasFlywheelABI from "../../abis/MidasFlywheel";
import UnitrollerABI from "../../abis/Unitroller";
import { CErc20Delegate } from "../../typechain/CErc20Delegate";
import { CErc20PluginRewardsDelegate } from "../../typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { FlywheelStaticRewards } from "../../typechain/FlywheelStaticRewards";
import { JumpRateModel } from "../../typechain/JumpRateModel";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { MidasFlywheel } from "../../typechain/MidasFlywheel";
import { RewardsDistributorDelegate } from "../../typechain/RewardsDistributorDelegate";
import { Unitroller } from "../../typechain/Unitroller";
import { SignerOrProvider } from "../MidasSdk";

type ComptrollerWithExtensions = Comptroller & ComptrollerFirstExtension;
type CTokenWithExtensions = CErc20Delegate & CTokenFirstExtension;

export function withCreateContracts<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class CreateContracts extends Base {
    createContractInstance<T extends Contract>(abi: ContractInterface) {
      return (address: string, signerOrProvider: SignerOrProvider = this.signer) =>
        new Contract(address, abi, signerOrProvider) as T;
    }

    createUnitroller = this.createContractInstance<Unitroller>(UnitrollerABI);
    createMidasFlywheel = this.createContractInstance<MidasFlywheel>(MidasFlywheelABI);
    createFlywheelStaticRewards = this.createContractInstance<FlywheelStaticRewards>(FlywheelStaticRewardsABI);
    createJumpRateModel = this.createContractInstance<JumpRateModel>(JumpRateModelABI);

    createRewardsDistributor(distributorAddress: string, signerOrProvider: SignerOrProvider = this.signer) {
      return new Contract(
        distributorAddress,
        this.chainDeployment.RewardsDistributorDelegate.abi,
        signerOrProvider
      ) as RewardsDistributorDelegate;
    }

    createComptroller(comptrollerAddress: string, signerOrProvider: SignerOrProvider = this.signer) {
      const comptrollerABI: Array<Fragment> = this.chainDeployment.Comptroller.abi;

      if (this.chainDeployment.ComptrollerFirstExtension) {
        comptrollerABI.push(...this.chainDeployment.ComptrollerFirstExtension.abi);
      }

      return new Contract(comptrollerAddress, comptrollerABI, signerOrProvider) as ComptrollerWithExtensions;
    }

    createOracle(oracleAddress: string, type: string, signerOrProvider: SignerOrProvider = this.signer) {
      return new Contract(oracleAddress, this.chainDeployment[type].abi, signerOrProvider);
    }

    createCTokenWithExtensions(address: string, signerOrProvider: SignerOrProvider = this.provider) {
      const cTokenABI: Array<Fragment> = this.chainDeployment.CErc20Delegate.abi;
      if (this.chainDeployment.CTokenFirstExtension) {
        cTokenABI.push(...this.chainDeployment.CTokenFirstExtension.abi);
      }

      return new Contract(address, cTokenABI, signerOrProvider) as CTokenWithExtensions;
    }

    createCErc20PluginRewardsDelegate(cTokenAddress: string, signerOrProvider: SignerOrProvider = this.signer) {
      return new Contract(
        cTokenAddress,
        this.chainDeployment.CErc20PluginRewardsDelegate.abi,
        signerOrProvider
      ) as CErc20PluginRewardsDelegate;
    }

    createMasterPriceOracle(signerOrProvider: SignerOrProvider = this.signer) {
      return new Contract(
        this.chainDeployment.MasterPriceOracle.address!,
        this.chainDeployment.MasterPriceOracle.abi,
        signerOrProvider
      ) as MasterPriceOracle;
    }
  };
}
