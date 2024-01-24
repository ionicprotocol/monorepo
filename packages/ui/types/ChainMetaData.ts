import { mode } from '@ionicprotocol/chains';
import type { IonicPoolData } from '@ionicprotocol/types';

import { config } from '@ui/config/index';

export const supportedChainIdToConfig: {
  [chainId: number]: { enabled: boolean; supported: boolean };
} = {
  [mode.chainId]: {
    enabled: config.isModeEnabled,
    supported: config.isModeEnabled
  }
};

export interface FusePoolsPerChain {
  [chainId: string]: IonicPoolData[];
}
