import {
  arbitrum,
  bsc,
  chapel,
  ethereum,
  ganache,
  linea,
  neon,
  polygon,
  zkevm
} from '@ionicprotocol/chains';
import type { IonicPoolData } from '@ionicprotocol/types';

import { config } from '@ui/config/index';

export const supportedChainIdToConfig: {
  [chainId: number]: { enabled: boolean; supported: boolean };
} = {
  [bsc.chainId]: { enabled: config.isBscEnabled, supported: config.isBscEnabled },
  [polygon.chainId]: { enabled: config.isBscEnabled, supported: true },
  [arbitrum.chainId]: {
    enabled: true,
    supported: config.isArbitrumEnabled
  },
  [neon.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled || config.isNeonEnabled
  },
  [linea.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled || config.isLineaEnabled
  },
  [chapel.chainId]: { enabled: true, supported: config.isDevelopment || config.isTestnetEnabled },
  [ganache.chainId]: { enabled: config.isDevelopment, supported: config.isDevelopment },
  [ethereum.chainId]: { enabled: true, supported: config.isEthereumEnabled },
  [zkevm.chainId]: { enabled: true, supported: config.isZkevmEnabled }
};

export interface PoolsPerChain {
  [chainId: string]: IonicPoolData[];
}
