export const ABILLY = 1e9;

export enum FusePoolMetric {
  totalLiquidityNative,
  totalSuppliedNative,
  totalBorrowedNative,
}

export enum UserAction {
  NO_ACTION,
  WAITING_FOR_TRANSACTIONS,
}

export const URL_MIDAS_DOCS = 'https://docs.midascapital.xyz/';

export default {
  UserAction,
  FusePoolMetric,
  URL_MIDAS_DOCS,
};
