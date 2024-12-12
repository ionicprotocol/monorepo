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
  {
    // price feed for sUSDe
    priceId: '0xca3ba9a619a4b3755c10ac7d5e760275aa95e9823d38a84fedd416856cdba37c',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for USDe
    priceId: '0x6ec879b1e9963de5ee97e9c8710b742d6228252a5e2ca12d4ae81d7fe5ee8c5d',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for mBTC
    priceId: '0x6665073f5bc307b97e68654ff11f3d8875abd6181855814d23ab01b8085c0906',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for uSOL
    priceId: '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  {
    // price feed for USDe
    priceId: '0x6ec879b1e9963de5ee97e9c8710b742d6228252a5e2ca12d4ae81d7fe5ee8c5d',
    configRefreshRateInSeconds: 3600,
    validTimePeriodSeconds: 86400, // 24 hrs
    deviationThresholdBps: 100, // 1%
  },
  // {
  //   // price feed for UNI
  //   priceId: '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
  //   configRefreshRateInSeconds: 3600,
  //   validTimePeriodSeconds: 86400, // 24 hrs
  //   deviationThresholdBps: 100, // 1%
  // },
  // {
  //   // price feed for SNX
  //   priceId: '0x39d020f60982ed892abbcd4a06a276a9f9b7bfbce003204c110b6e488f502da3',
  //   configRefreshRateInSeconds: 3600,
  //   validTimePeriodSeconds: 86400, // 24 hrs
  //   deviationThresholdBps: 100, // 1%
  // },
  // {
  //   // price feed for LINK
  //   priceId: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
  //   configRefreshRateInSeconds: 3600,
  //   validTimePeriodSeconds: 86400, // 24 hrs
  //   deviationThresholdBps: 100, // 1%
  // },
  // {
  //   // price feed for DAI
  //   priceId: '0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd',
  //   configRefreshRateInSeconds: 3600,
  //   validTimePeriodSeconds: 86400, // 24 hrs
  //   deviationThresholdBps: 100, // 1%
  // },
  // {
  //   // price feed for BAL
  //   priceId: '0x07ad7b4a7662d19a6bc675f6b467172d2f3947fa653ca97555a9b20236406628',
  //   configRefreshRateInSeconds: 3600,
  //   validTimePeriodSeconds: 86400, // 24 hrs
  //   deviationThresholdBps: 100, // 1%
  // },
];
