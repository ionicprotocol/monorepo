import { mode } from '@ionicprotocol/chains';

import { pythConfig as modePythConfig } from './mode';

export const chainIdToConfig = {
  [mode.chainId]: modePythConfig,
};
