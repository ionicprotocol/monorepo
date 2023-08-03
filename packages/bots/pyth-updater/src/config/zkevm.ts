import { PythAssetConfig } from '../types';

export const pythConfig: PythAssetConfig[] = [
  {
    // ETH/USD
    priceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hours
    deviationThresholdBps: 200, // 1%
  },
];
