import { Contract, Signer } from "ethers";

import { Artifacts, MidasBaseConstructor } from "..";
import { AnkrBNBInterestRateModel } from "@typechain/AnkrBNBInterestRateModel";
import { CErc20Delegate } from "@typechain/CErc20Delegate";
import { CErc20PluginRewardsDelegate } from "@typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "@typechain/Comptroller";
import { FlywheelStaticRewards } from "@typechain/FlywheelStaticRewards";
import { JumpRateModel } from "@typechain/JumpRateModel";
import { MasterPriceOracle } from "@typechain/MasterPriceOracle";
import { MidasFlywheel } from "@typechain/MidasFlywheel";
import { RewardsDistributorDelegate } from "@typechain/RewardsDistributorDelegate";
import { Unitroller } from "@typechain/Unitroller";
import { SignerOrProvider, SupportedProvider } from "../MidasSdk";

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
      return new Contract(comptrollerAddress, this.chainDeployment.Comptroller.abi, signerOrProvider) as Comptroller;
    }

    createOracle(oracleAddress: string, type: string, signerOrProvider: SignerOrProvider = this.signer) {
      return new Contract(oracleAddress, this.chainDeployment[type].abi, signerOrProvider);
    }

    createCToken(cTokenAddress: string, signerOrProvider: SignerOrProvider = this.signer) {
      return new Contract(cTokenAddress, this.chainDeployment.CErc20Delegate.abi, signerOrProvider) as CErc20Delegate;
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
