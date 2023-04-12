import {
  arbitrum,
  basegoerli,
  bsc,
  chapel,
  ethereum,
  evmos,
  fantom,
  ganache,
  moonbeam,
  neondevnet,
  polygon,
} from '@midas-capital/chains';
import type { FusePoolData } from '@midas-capital/types';

import { config } from '@ui/config/index';

export const supportedChainIdToConfig: {
  [chainId: number]: { enabled: boolean; supported: boolean };
} = {
  [bsc.chainId]: { enabled: config.isBscEnabled, supported: config.isBscEnabled },
  [polygon.chainId]: { enabled: config.isBscEnabled, supported: true },
  [moonbeam.chainId]: { enabled: config.isMoonbeamEnabled, supported: config.isMoonbeamEnabled },
  [arbitrum.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled,
  },
  [neondevnet.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled,
  },
  [basegoerli.chainId]: {
    enabled: true,
    supported: config.isDevelopment || config.isTestnetEnabled,
  },
  [chapel.chainId]: { enabled: true, supported: config.isDevelopment || config.isTestnetEnabled },
  [ganache.chainId]: { enabled: config.isDevelopment, supported: config.isDevelopment },
  [fantom.chainId]: { enabled: true, supported: config.isFantomEnabled },
  [evmos.chainId]: { enabled: true, supported: config.isEvmosEnabled },
  [ethereum.chainId]: { enabled: true, supported: config.isEthereumEnabled },
};

export interface FusePoolsPerChain {
  [chainId: string]: FusePoolData[];
}
