import { Contract, Signer } from "ethers";

import { Artifacts, MidasBaseConstructor } from "..";
import { AnkrBNBInterestRateModel } from "../../lib/contracts/typechain/AnkrBNBInterestRateModel.sol";
import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { CErc20PluginRewardsDelegate } from "../../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { FlywheelStaticRewards } from "../../lib/contracts/typechain/FlywheelStaticRewards";
import { JumpRateModel } from "../../lib/contracts/typechain/JumpRateModel";
import { MasterPriceOracle } from "../../lib/contracts/typechain/MasterPriceOracle";
import { MidasFlywheel } from "../../lib/contracts/typechain/MidasFlywheel";
import { RewardsDistributorDelegate } from "../../lib/contracts/typechain/RewardsDistributorDelegate";
import { Unitroller } from "../../lib/contracts/typechain/Unitroller";
import { SignerOrProvider, SupportedProvider } from "../MidasSdk";

export function withCreateContracts<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class CreateContracts extends Base {
    createContractInstance<T extends Contract>(contract: keyof Artifacts) {
      return (address: string, signerOrProvider: SignerOrProvider = this.provider) =>
        new Contract(address, this.artifacts[contract].abi, signerOrProvider) as T;
    }

    createUnitroller = this.createContractInstance<Unitroller>("Unitroller");
    createMidasFlywheel = this.createContractInstance<MidasFlywheel>("MidasFlywheel");
    createFlywheelStaticRewards = this.createContractInstance<FlywheelStaticRewards>("FlywheelStaticRewards");
    createJumpRateModel = this.createContractInstance<JumpRateModel>("JumpRateModel");
    createAnkrBNBInterestRateModel = this.createContractInstance<AnkrBNBInterestRateModel>("AnkrBNBInterestRateModel");

    createRewardsDistributor(distributorAddress: string, signer: Signer | SupportedProvider = this.provider) {
      return new Contract(
        distributorAddress,
        this.chainDeployment.RewardsDistributorDelegate.abi,
        signer
      ) as RewardsDistributorDelegate;
    }
    createComptroller(comptrollerAddress: string, signer: Signer | SupportedProvider = this.provider) {
      return new Contract(comptrollerAddress, this.chainDeployment.Comptroller.abi, signer) as Comptroller;
    }

    createOracle(oracleAddress: string, type: string, signer: Signer | SupportedProvider = this.provider) {
      return new Contract(oracleAddress, this.chainDeployment[type].abi, signer);
    }

    createCToken(cTokenAddress: string, signer: Signer | SupportedProvider = this.provider) {
      return new Contract(cTokenAddress, this.chainDeployment.CErc20Delegate.abi, signer) as CErc20Delegate;
    }
    createCErc20PluginRewardsDelegate(cTokenAddress: string, signer: Signer | SupportedProvider = this.provider) {
      return new Contract(
        cTokenAddress,
        this.chainDeployment.CErc20PluginRewardsDelegate.abi,
        signer
      ) as CErc20PluginRewardsDelegate;
    }

    createMasterPriceOracle(signer: Signer | SupportedProvider = this.provider) {
      return new Contract(
        this.chainDeployment.MasterPriceOracle.address!,
        this.chainDeployment.MasterPriceOracle.abi,
        signer
      ) as MasterPriceOracle;
    }
  };
}
