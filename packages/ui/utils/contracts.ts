import { MidasSdk } from '@midas-capital/sdk';
import { Contract } from 'ethers';

import { aBNBcContractABI, aBNBcContractAddress } from '@ui/constants/index';

export const getComptrollerContract = (address: string, sdk: MidasSdk) => {
  return new Contract(address, sdk.artifacts.Comptroller.abi, sdk.provider);
};

export const getCTokenContract = (address: string, sdk: MidasSdk) => {
  return new Contract(address, sdk.artifacts.CErc20Delegate.abi, sdk.provider);
};

export const getRewardTokenContract = (address: string, sdkWithSigner: MidasSdk) => {
  return new Contract(address, sdkWithSigner.artifacts.EIP20Interface.abi, sdkWithSigner.signer);
};

export const getUnitrollerContract = (address: string, sdk: MidasSdk) => {
  return new Contract(address, sdk.artifacts.Unitroller.abi, sdk.provider);
};

export const getFPDContract = (sdkWithSigner: MidasSdk) => {
  return new Contract(
    sdkWithSigner.chainDeployment.FusePoolDirectory.address,
    sdkWithSigner.chainDeployment.FusePoolDirectory.abi,
    sdkWithSigner.signer
  );
};

export const getABNBcContract = (sdk: MidasSdk) => {
  return new Contract(aBNBcContractAddress, aBNBcContractABI, sdk.provider);
};
