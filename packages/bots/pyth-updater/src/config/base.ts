import { PythAssetConfig } from '../types';

import { pythConfig as commonPythConfig } from './common';

export const pythConfig: PythAssetConfig[] = [
  ...commonPythConfig,
  {
    // price feed for SOL
    priceId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for SUI
    priceId: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for XRP
    priceId: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
];
