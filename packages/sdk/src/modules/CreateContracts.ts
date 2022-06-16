import { Contract } from "ethers";

import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { FlywheelStaticRewards } from "../../lib/contracts/typechain/FlywheelStaticRewards";
import { FuseFlywheelCore } from "../../lib/contracts/typechain/FuseFlywheelCore";
import { MasterPriceOracle } from "../../lib/contracts/typechain/MasterPriceOracle";
import { RewardsDistributorDelegate } from "../../lib/contracts/typechain/RewardsDistributorDelegate";
import { Unitroller } from "../../lib/contracts/typechain/Unitroller";
import { Artifacts, FuseBaseConstructor } from "../types";

export function withCreateContracts<TBase extends FuseBaseConstructor>(Base: TBase) {
  return class CreateContracts extends Base {
    createContractInstance<T extends Contract>(contract: keyof Artifacts) {
      return (address: string) => new Contract(address, this.artifacts[contract].abi, this.provider.getSigner()) as T;
    }

    createUnitroller = this.createContractInstance<Unitroller>("Unitroller");
    createFuseFlywheelCore = this.createContractInstance<FuseFlywheelCore>("FuseFlywheelCore");
    createFlywheelStaticRewards = this.createContractInstance<FlywheelStaticRewards>("FlywheelStaticRewards");

    createRewardsDistributor(distributorAddress: string) {
      return new Contract(
        distributorAddress,
        this.chainDeployment.RewardsDistributorDelegate.abi,
        this.provider.getSigner()
      ) as RewardsDistributorDelegate;
    }
    createComptroller(comptrollerAddress: string) {
      return new Contract(
        comptrollerAddress,
        this.chainDeployment.Comptroller.abi,
        this.provider.getSigner()
      ) as Comptroller;
    }

    createOracle(oracleAddress: string, type: string) {
      return new Contract(oracleAddress, this.chainDeployment[type].abi, this.provider.getSigner());
    }

    createCToken(cTokenAddress: string) {
      return new Contract(
        cTokenAddress,
        this.chainDeployment.CErc20Delegate.abi,
        this.provider.getSigner()
      ) as CErc20Delegate;
    }

    createMasterPriceOracle() {
      return new Contract(
        this.chainDeployment.MasterPriceOracle.address!,
        this.chainDeployment.MasterPriceOracle.abi,
        this.provider.getSigner()
      ) as MasterPriceOracle;
    }
  };
}
