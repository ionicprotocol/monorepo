import {
  arbitrum,
  bsc,
  chapel,
  ethereum,
  ganache,
  lineagoerli,
  neondevnet,
  polygon,
} from '@ionicprotocol/chains';
import type { FusePoolData } from '@ionicprotocol/types';

import { config } from '@ui/config/index';

export const supportedChainIdToConfig: {
  [chainId: number]: { enabled: boolean; supported: boolean };
} = {
  [bsc.chainId]: { enabled: config.isBscEnabled, supported: config.isBscEnabled },
  [polygon.chainId]: { enabled: config.isBscEnabled, supported: true },
  [arbitrum.chainId]: {
    enabled: true,
    supported: config.isArbitrumEnabled,
  },
  [neondevnet.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled,
  },
  [lineagoerli.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled,
  },
  [chapel.chainId]: { enabled: true, supported: config.isDevelopment || config.isTestnetEnabled },
  [ganache.chainId]: { enabled: config.isDevelopment, supported: config.isDevelopment },
  [ethereum.chainId]: { enabled: true, supported: config.isEthereumEnabled },
};

export interface FusePoolsPerChain {
  [chainId: string]: FusePoolData[];
}
