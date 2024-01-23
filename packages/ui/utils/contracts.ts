import type { MidasSdk } from '@ionicprotocol/sdk';
import { Contract } from 'ethers';

import {
  ankrBNBContractABI,
  ankrBNBContractAddress
} from '@ui/constants/index';

export const getAnkrBNBContract = (sdk: MidasSdk) => {
  return new Contract(ankrBNBContractAddress, ankrBNBContractABI, sdk.provider);
};
