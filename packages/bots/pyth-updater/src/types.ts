import { Hex } from 'viem';

export interface PythAssetConfig {
  priceId: Hex;
  configRefreshRateInSeconds: number;
  validTimePeriodSeconds: number;
  deviationThresholdBps: number;
}

export enum EXCLUDED_ERROR_CODES {
  NETWORK_ERROR,
  SERVER_ERROR,
}
