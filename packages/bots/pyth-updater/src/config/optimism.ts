import { PythAssetConfig } from '../types';

import { pythConfig as commonPythConfig } from './common';

export const pythConfig: PythAssetConfig[] = [
  ...commonPythConfig,
  {
    // price feed for WBTC
    priceId: '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for SNX
    priceId: '0x39d020f60982ed892abbcd4a06a276a9f9b7bfbce003204c110b6e488f502da3',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
];
