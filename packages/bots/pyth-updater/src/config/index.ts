import { neon, linea } from '@ionicprotocol/chains';
import { pythConfig as neonPythConfig } from './neon';
import { pythConfig as lineaPythConfig } from './linea';

export const chainIdToConfig = {
  [neon.chainId]: neonPythConfig,
  [linea.chainId]: lineaPythConfig,
};
