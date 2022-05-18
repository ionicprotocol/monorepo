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

export enum FundOperationMode {
  SUPPLY,
  WITHDRAW,
  BORROW,
  REPAY,
}
