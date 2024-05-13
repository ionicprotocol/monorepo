import { PythAssetConfig } from '../types';

import { pythConfig as commonPythConfig } from './common';

export const pythConfig: PythAssetConfig[] = [
  ...commonPythConfig,
  {
    // price feed for WETH
    priceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for USDC
    priceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for USDT
    priceId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for WBTC
    priceId: '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
];
