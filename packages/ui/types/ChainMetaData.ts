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
import { FusePoolData } from '@midas-capital/types';

import { config } from '@ui/config/index';

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
  [evmos.chainId]: { enabled: true, supported: config.isEvmosEnabled },
};

export interface FusePoolsPerChain {
  [chainId: string]: FusePoolData[];
}
