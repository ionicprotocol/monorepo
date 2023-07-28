import { PythAssetConfig } from '../types';

import { pythConfig as commonPythConfig } from './common';

export const pythConfig: PythAssetConfig[] = [
  ...commonPythConfig,
  {
    // NEON/USD
    priceId: '0xd82183dd487bef3208a227bb25d748930db58862c5121198e723ed0976eb92b7',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hours
    deviationThresholdBps: 100, // 1%
  },
];
