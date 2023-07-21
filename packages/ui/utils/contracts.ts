import type { IonicSdk } from '@ionicprotocol/sdk';
import { Contract } from 'ethers';

import { ankrBNBContractABI, ankrBNBContractAddress } from '@ui/constants/index';

export const getAnkrBNBContract = (sdk: IonicSdk) => {
  return new Contract(ankrBNBContractAddress, ankrBNBContractABI, sdk.provider);
};
