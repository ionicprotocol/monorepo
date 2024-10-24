import { base, mode } from '@ionicprotocol/chains';

import { pythConfig as basePythConfig } from './base';
import { pythConfig as modePythConfig } from './mode';

export const chainIdToConfig = {
  [mode.chainId]: modePythConfig,
  [base.chainId]: basePythConfig,
};
