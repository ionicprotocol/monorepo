import { Contract, Signer } from "ethers";

import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { FlywheelStaticRewards } from "../../lib/contracts/typechain/FlywheelStaticRewards";
import { FuseFlywheelCore } from "../../lib/contracts/typechain/FuseFlywheelCore";
import { JumpRateModel } from "../../lib/contracts/typechain/JumpRateModel";
import { MasterPriceOracle } from "../../lib/contracts/typechain/MasterPriceOracle";
import { RewardsDistributorDelegate } from "../../lib/contracts/typechain/RewardsDistributorDelegate";
import { Unitroller } from "../../lib/contracts/typechain/Unitroller";
import { Artifacts, FuseBaseConstructor } from "../types";

export function withCreateContracts<TBase extends FuseBaseConstructor>(Base: TBase) {
  return class CreateContracts extends Base {
    createContractInstance<T extends Contract>(contract: keyof Artifacts, signer: Signer = this.provider.getSigner()) {
      return (address: string) => new Contract(address, this.artifacts[contract].abi, signer) as T;
    }

    createUnitroller = this.createContractInstance<Unitroller>("Unitroller");
    createFuseFlywheelCore = this.createContractInstance<FuseFlywheelCore>("FuseFlywheelCore");
    createFlywheelStaticRewards = this.createContractInstance<FlywheelStaticRewards>("FlywheelStaticRewards");
    createJumpRateModel = this.createContractInstance<JumpRateModel>("JumpRateModel");

    createRewardsDistributor(distributorAddress: string, signer: Signer = this.provider.getSigner()) {
      return new Contract(
        distributorAddress,
        this.chainDeployment.RewardsDistributorDelegate.abi,
        signer
      ) as RewardsDistributorDelegate;
    }
    createComptroller(comptrollerAddress: string, signer: Signer = this.provider.getSigner()) {
      return new Contract(comptrollerAddress, this.chainDeployment.Comptroller.abi, signer) as Comptroller;
    }

    createOracle(oracleAddress: string, type: string, signer: Signer = this.provider.getSigner()) {
      return new Contract(oracleAddress, this.chainDeployment[type].abi, signer);
    }

    createCToken(cTokenAddress: string, signer: Signer = this.provider.getSigner()) {
      return new Contract(cTokenAddress, this.chainDeployment.CErc20Delegate.abi, signer) as CErc20Delegate;
    }

    createMasterPriceOracle(signer: Signer = this.provider.getSigner()) {
      return new Contract(
        this.chainDeployment.MasterPriceOracle.address!,
        this.chainDeployment.MasterPriceOracle.abi,
        signer
      ) as MasterPriceOracle;
    }
  };
}
