import { PythAssetConfig } from '../types';

import { pythConfig as commonPythConfig } from './common';

export const pythConfig: PythAssetConfig[] = [
  ...commonPythConfig,
  {
    // price feed for oUSDT
    priceId: '0x2dc7f272d3010abe4de48755a50fcf5bd9eefd3b4af01d8f39f6c80ae51544fe',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
];
