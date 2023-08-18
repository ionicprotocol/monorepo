export interface PythAssetConfig {
  priceId: string;
  configRefreshRateInSeconds: number;
  validTimePeriodSeconds: number;
  deviationThresholdBps: number;
}

export enum EXCLUDED_ERROR_CODES {
  NETWORK_ERROR,
  SERVER_ERROR,
}
