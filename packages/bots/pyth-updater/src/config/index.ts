import { base, mode, optimism } from '@ionicprotocol/chains';

import { pythConfig as basePythConfig } from './base';
import { pythConfig as modePythConfig } from './mode';
import { pythConfig as optimismPythConfig } from './optimism';
export const chainIdToConfig = {
  [mode.chainId]: modePythConfig,
  [base.chainId]: basePythConfig,
  [optimism.chainId]: optimismPythConfig,
};
