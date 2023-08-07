import { PythAssetConfig } from '../types';

export const pythConfig: PythAssetConfig[] = [
  {
    // ETH/USD
    priceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hours
    deviationThresholdBps: 200, // 1%
  },
  {
    // USDC/USD
    priceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hours
    deviationThresholdBps: 100, // 1%
  },
];
