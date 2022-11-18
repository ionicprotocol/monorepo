import { MidasSdk } from '@midas-capital/sdk';
import { Contract } from 'ethers';

import { aBNBcContractABI, aBNBcContractAddress } from '@ui/constants/index';

export const getABNBcContract = (sdk: MidasSdk) => {
  return new Contract(aBNBcContractAddress, aBNBcContractABI, sdk.provider);
};
