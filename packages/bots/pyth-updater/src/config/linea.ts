import { PythAssetConfig } from '../types';

import { pythConfig as commonPythConfig } from './common';

export const pythConfig: PythAssetConfig[] = [
  ...commonPythConfig,
  {
    // BUSD/USD
    priceId: '0x5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hours
    deviationThresholdBps: 100, // 2%
  },
  {
    // BNB/USD
    priceId: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hours
    deviationThresholdBps: 250, // 2%
  },
  {
    // MATIC/USD
    priceId: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hours
    deviationThresholdBps: 250, // 2%
  },
];
