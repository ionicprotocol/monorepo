export const ABILLY = 1e9;

export const URL_MIDAS_DOCS = 'https://docs.midascapital.xyz/';

export const CLOSE_FACTOR = {
  MIN: 5,
  MAX: 90,
};

export const LIQUIDATION_INCENTIVE = {
  MIN: 0,
  MAX: 50,
};

export const COLLATERAL_FACTOR = {
  MIN: 5,
  MAX: 90,
};

export const RESERVE_FACTOR = {
  MIN: 0,
  MAX: 50,
};

export const ADMIN_FEE = {
  MIN: 0,
  MAX: 30,
};

export const POOLS_PER_PAGE = 5;

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
