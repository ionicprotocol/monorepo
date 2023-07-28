import { linea, neon } from '@ionicprotocol/chains';

import { pythConfig as lineaPythConfig } from './linea';
import { pythConfig as neonPythConfig } from './neon';

export const chainIdToConfig = {
  [neon.chainId]: neonPythConfig,
  [linea.chainId]: lineaPythConfig,
};
