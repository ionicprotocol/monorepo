import { IonicAsset, LiquidationStrategy } from "@ionicprotocol/types";
import { Address, formatEther, TransactionRequest } from "viem";

import { IonicBase } from "../../IonicSdk";

export const SCALE_FACTOR_ONE_18_WEI = 10n ** 18n;
export const SCALE_FACTOR_UNDERLYING_DECIMALS = (asset: IonicAsset) => 10n ** BigInt(18 - asset.underlyingDecimals);

export type ExtendedPoolAssetStructOutput = {
  cToken: Address;
  underlyingToken: Address;
  underlyingName: string;
  underlyingSymbol: string;
  underlyingDecimals: bigint;
  underlyingBalance: bigint;
  supplyRatePerBlock: bigint;
  borrowRatePerBlock: bigint;
  totalSupply: bigint;
  totalBorrow: bigint;
  supplyBalance: bigint;
  borrowBalance: bigint;
  liquidity: bigint;
  membership: boolean;
  exchangeRate: bigint;
  underlyingPrice: bigint;
  oracle: Address;
  collateralFactor: bigint;
  reserveFactor: bigint;
  adminFee: bigint;
  ionicFee: bigint;
  borrowGuardianPaused: boolean;
  mintGuardianPaused: boolean;
  borrowBalanceWei?: bigint;
  supplyBalanceWei?: bigint;
};

export type EncodedLiquidationTx = {
  method: string;
  args: Array<any>;
  value: bigint;
};

export type PoolUserWithAssets = {
  assets: ExtendedPoolAssetStructOutput[];
  account: Address;
  totalBorrow: bigint;
  totalCollateral: bigint;
  health: bigint;
  debt: Array<any>;
  collateral: Array<any>;
};

export type LiquidatablePool = {
  comptroller: string;
  liquidations: EncodedLiquidationTx[];
};

export type ErroredPool = {
  comptroller: string;
  msg: string;
  error?: any;
};

export type PoolUserStruct = {
  account: Address;
  totalBorrow: bigint;
  totalCollateral: bigint;
  health: bigint;
};

export type PublicPoolUserWithData = {
  comptroller: Address;
  users: PoolUserStruct[];
  closeFactor: bigint;
  liquidationIncentive: bigint;
};

export async function fetchGasLimitForTransaction(sdk: IonicBase, method: string, tx: TransactionRequest) {
  try {
    return ((await sdk.publicClient.estimateGas(tx)) * 11n) / 10n;
  } catch (error) {
    throw `Failed to estimate gas before signing and sending ${method} transaction: ${error}`;
  }
}

export async function fetchGasPrice(sdk: IonicBase, method: string, pctBump = 10) {
  try {
    return ((await sdk.publicClient.getGasPrice()) * BigInt(100 + pctBump)) / 100n;
  } catch (error) {
    throw `Failed to get gas price before signing and sending ${method} transaction: ${error}`;
  }
}

export const logLiquidation = (
  sdk: IonicBase,
  borrower: PoolUserWithAssets,
  exchangeToTokenAddress: Address,
  liquidationAmount: bigint,
  liquidationTokenSymbol: string,
  liquidationStrategy: LiquidationStrategy,
  debtFundingStrategies: any[]
) => {
  sdk.logger.info(
    `Gathered transaction data for safeLiquidate a ${liquidationTokenSymbol} borrow of kind ${liquidationStrategy}:
         - Liquidation Amount: ${formatEther(liquidationAmount)}
         - Underlying Collateral Token: ${borrower.collateral[0].underlyingSymbol} ${borrower.collateral[0].cToken}
         - Underlying Debt Token: ${borrower.debt[0].underlyingSymbol} ${borrower.debt[0].cToken}
         - Funding the liquidation with: ${debtFundingStrategies}
         - Exchanging liquidated tokens to: ${exchangeToTokenAddress}
         - Borrower: ${borrower.account}
         `
  );
};
