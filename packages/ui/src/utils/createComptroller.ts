import { Contract } from '@ethersproject/contracts';
import { Fuse } from '@midas-capital/sdk';

export const createComptroller = (comptrollerAddress: string, fuse: Fuse) => {
  return new Contract(
    comptrollerAddress,
    fuse.chainDeployment.Comptroller.abi,
    fuse.provider.getSigner()
  );
};

export const createRewardsDistributor = (distributorAddress: string, fuse: Fuse) => {
  return new Contract(
    distributorAddress,
    fuse.chainDeployment.RewardsDistributorDelegate.abi,
    fuse.provider.getSigner()
  );
};

export const createOracle = (oracleAddress: string, fuse: Fuse, type: string) => {
  return new Contract(oracleAddress, fuse.chainDeployment[type].abi, fuse.provider.getSigner());
};

export const createCToken = (fuse: Fuse, cTokenAddress: string) => {
  return new Contract(
    cTokenAddress,
    fuse.chainDeployment.CErc20Delegate.abi,
    fuse.provider.getSigner()
  );
};

export const createMasterPriceOracle = (fuse: Fuse) => {
  return new Contract(
    fuse.chainDeployment.MasterPriceOracle.address!,
    fuse.chainDeployment.MasterPriceOracle.abi,
    fuse.provider.getSigner()
  );
};
