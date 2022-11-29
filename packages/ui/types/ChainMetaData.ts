import {
  arbitrum,
  bsc,
  chapel,
  evmos,
  fantom,
  ganache,
  moonbeam,
  neondevnet,
  polygon,
} from '@midas-capital/chains';
import { ChainConfig, FusePoolData } from '@midas-capital/types';

import { config } from '@ui/config/index';

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
  [arbitrum.chainId]: arbitrum,
  [fantom.chainId]: fantom,
  [evmos.chainId]: evmos,
};

export const supportedChainIdToConfig: {
  [chainId: number]: { supported: boolean; enabled: boolean };
} = {
  [bsc.chainId]: { enabled: config.isBscEnabled, supported: config.isBscEnabled },
  [polygon.chainId]: { supported: true, enabled: config.isBscEnabled },
  [moonbeam.chainId]: { enabled: config.isMoonbeamEnabled, supported: config.isMoonbeamEnabled },
  [arbitrum.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled,
  },
  [neondevnet.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled,
  },
  [chapel.chainId]: { enabled: true, supported: config.isDevelopment || config.isTestnetEnabled },
  [ganache.chainId]: { enabled: config.isDevelopment, supported: config.isDevelopment },
  [fantom.chainId]: { enabled: true, supported: config.isDevelopment || config.isTestnetEnabled },
  [evmos.chainId]: { enabled: true, supported: config.isDevelopment || config.isTestnetEnabled },
};

export interface FusePoolsPerChain {
  [chainId: string]: FusePoolData[];
}
