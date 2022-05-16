import { Contract } from '@ethersproject/contracts';
import { Fuse } from '@midas-capital/sdk';
import { Comptroller } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/Comptroller';
import { FlywheelStaticRewards } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FlywheelStaticRewards';
import { FuseFlywheelCore } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FuseFlywheelCore';

export const createComptroller = (comptrollerAddress: string, fuse: Fuse) =>
  new Contract(
    comptrollerAddress,
    fuse.chainDeployment.Comptroller.abi,
    fuse.provider.getSigner()
  ) as Comptroller;

export const createUnitroller = (comptrollerAddress: string, fuse: Fuse) =>
  new Contract(comptrollerAddress, fuse.artifacts.Unitroller.abi, fuse.provider.getSigner());

export const createRewardsDistributor = (distributorAddress: string, fuse: Fuse) => {
  return new Contract(
    distributorAddress,
    fuse.chainDeployment.RewardsDistributorDelegate.abi,
    fuse.provider.getSigner()
  );
};

export const createFuseFlywheelCore = (flywheelCoreAddress: string, fuse: Fuse) => {
  return new Contract(
    flywheelCoreAddress,
    fuse.artifacts.FuseFlywheelCore.abi,
    fuse.provider.getSigner()
  ) as FuseFlywheelCore;
};
export const createFlywheelStaticRewards = (staticRewardsAddress: string, fuse: Fuse) => {
  return new Contract(
    staticRewardsAddress,
    fuse.artifacts.FlywheelStaticRewards.abi,
    fuse.provider.getSigner()
  ) as FlywheelStaticRewards;
};

export const createOracle = (oracleAddress: string, fuse: Fuse, type: string) => {
  return new Contract(oracleAddress, fuse.chainDeployment[type].abi, fuse.provider.getSigner());
};

export const createCToken = (cTokenAddress: string, fuse: Fuse) =>
  new Contract(cTokenAddress, fuse.chainDeployment.CErc20Delegate.abi, fuse.provider.getSigner());

export const createMasterPriceOracle = (fuse: Fuse) =>
  new Contract(
    fuse.chainDeployment.MasterPriceOracle.address!,
    fuse.chainDeployment.MasterPriceOracle.abi,
    fuse.provider.getSigner()
  );
