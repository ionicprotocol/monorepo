import { config } from '@ui/config/index';

import {
  base,
  bob,
  mode,
  optimism,
  fraxtal,
  lisk,
  superseed
} from '@ionicprotocol/chains';
import type { IonicPoolData } from '@ionicprotocol/types';

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
  },
  [fraxtal.chainId]: {
    enabled: config.isFraxtalEnabled,
    supported: config.isFraxtalEnabled
  },
  [lisk.chainId]: {
    enabled: config.isLiskEnabled,
    supported: config.isLiskEnabled
  },
  [superseed.chainId]: {
    enabled: config.isSuperseedEnabled,
    supported: config.isSuperseedEnabled
  }
};

export interface FusePoolsPerChain {
  [chainId: string]: IonicPoolData[];
}
