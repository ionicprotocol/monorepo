import { base, bob, mode, optimism } from '@ionicprotocol/chains';
import type { IonicPoolData } from '@ionicprotocol/types';

import { config } from '@ui/config/index';

export const supportedChainIdToConfig: {
  [chainId: number]: { enabled: boolean; supported: boolean };
} = {
  [mode.chainId]: {
    enabled: config.isModeEnabled,
    supported: config.isModeEnabled
  },
  [base.chainId]: {
    enabled: config.isBaseEnabled,
    supported: config.isBaseEnabled
  },
  [optimism.chainId]: {
    enabled: config.isOptimismEnabled,
    supported: config.isOptimismEnabled
  },
  [bob.chainId]: {
    enabled: config.isBobEnabled,
    supported: config.isBobEnabled
  }
};

export interface FusePoolsPerChain {
  [chainId: string]: IonicPoolData[];
}
