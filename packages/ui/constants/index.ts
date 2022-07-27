import { SupportedChainsArray } from '@midas-capital/sdk';

export const SUPPORTED_NETWORKS_REGEX = new RegExp(SupportedChainsArray.join('|'));
export const VALID_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const ABILLY = 1e9;

export const URL_MIDAS_DOCS = 'https://docs.midascapital.xyz/';

export const CLOSE_FACTOR = {
  DEFAULT: 50,
  MIN: 5,
  MAX: 90,
};

export const LIQUIDATION_INCENTIVE = {
  DEFAULT: 8,
  MIN: 0,
  MAX: 50,
};

export const COLLATERAL_FACTOR = {
  DEFAULT: 50,
  MIN: 5,
  MAX: 90,
};

export const RESERVE_FACTOR = {
  DEFAULT: 10,
  MIN: 0,
  MAX: 50,
};

export const ADMIN_FEE = {
  DEFAULT: 5,
  MIN: 0,
  MAX: 30,
};

export const POOLS_PER_PAGE = 6;

export const DEFAULT_DECIMALS = 18;

// enums

export enum FusePoolMetric {
  totalLiquidityNative,
  totalSuppliedNative,
  totalBorrowedNative,
}

export enum UserAction {
  NO_ACTION,
  WAITING_FOR_TRANSACTIONS,
}
