import { Contract } from "ethers";
import { Fragment } from "ethers/lib/utils";

import { Artifacts, MidasBaseConstructor } from "..";
import { AnkrBNBInterestRateModel } from "../../lib/contracts/typechain/AnkrBNBInterestRateModel.sol";
import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { CErc20PluginRewardsDelegate } from "../../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../lib/contracts/typechain/ComptrollerFirstExtension";
import { CTokenFirstExtension } from "../../lib/contracts/typechain/CTokenFirstExtension";
import { FlywheelStaticRewards } from "../../lib/contracts/typechain/FlywheelStaticRewards";
import { JumpRateModel } from "../../lib/contracts/typechain/JumpRateModel";
import { MasterPriceOracle } from "../../lib/contracts/typechain/MasterPriceOracle";
import { MidasFlywheel } from "../../lib/contracts/typechain/MidasFlywheel";
import { RewardsDistributorDelegate } from "../../lib/contracts/typechain/RewardsDistributorDelegate";
import { Unitroller } from "../../lib/contracts/typechain/Unitroller";
import { SignerOrProvider } from "../MidasSdk";

type ComptrollerWithExtensions = Comptroller & ComptrollerFirstExtension;
type CTokenWithExtensions = CErc20Delegate & CTokenFirstExtension;

export function withCreateContracts<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class CreateContracts extends Base {
    createContractInstance<T extends Contract>(contract: keyof Artifacts) {
      return (address: string, signerOrProvider: SignerOrProvider = this.signer) =>
        new Contract(address, this.artifacts[contract].abi, signerOrProvider) as T;
    }

    createUnitroller = this.createContractInstance<Unitroller>("Unitroller");
    createMidasFlywheel = this.createContractInstance<MidasFlywheel>("MidasFlywheel");
    createFlywheelStaticRewards = this.createContractInstance<FlywheelStaticRewards>("FlywheelStaticRewards");
    createJumpRateModel = this.createContractInstance<JumpRateModel>("JumpRateModel");
    createAnkrBNBInterestRateModel = this.createContractInstance<AnkrBNBInterestRateModel>("AnkrBNBInterestRateModel");

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
      // if (this.chainDeployment.ComptrollerSecondExtension) {
      //   comptrollerABI.push(...this.chainDeployment.ComptrollerSecondExtension.abi);
      // }

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
