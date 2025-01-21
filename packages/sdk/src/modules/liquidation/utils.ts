import { LiquidationStrategy } from "@ionicprotocol/types";
import { Address, formatEther, Hex, TransactionRequest } from "viem";

import { IonicBase } from "../../IonicSdk";

export const SCALE_FACTOR_ONE_18_WEI = 10n ** 18n;
export const SCALE_FACTOR_UNDERLYING_DECIMALS = (asset: { underlyingDecimals: bigint }) =>
  10n ** BigInt(18n - asset.underlyingDecimals);

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

export type FlashSwapLiquidationTxParams = {
  borrower: Address;
  repayAmount: bigint;
  cErc20: Address;
  cTokenCollateral: Address;
  flashSwapContract: Address;
  minProfitAmount: bigint;
  redemptionStrategies: Address[];
  strategyData: Hex[];
  debtFundingStrategies: Address[];
  debtFundingStrategiesData: Hex[];
};

export enum BotType {
  Standard,
  Pyth
}

export type PythEncodedLiquidationTx = {
  method: string;
  args: Array<any>;
  value: bigint;
  buyTokenAmount: bigint;
  sellTokenAmount: bigint;
  buyTokenUnderlying: string;
  sellTokenUnderlying: string;
};

export type PoolUserWithAssets = {
  assets: ExtendedPoolAssetStructOutput[];
  account: Address;
  health: bigint;
  debt: Array<ExtendedPoolAssetStructOutput>;
  collateral: Array<ExtendedPoolAssetStructOutput>;
};

export type LiquidatablePool = {
  comptroller: string;
  liquidations: FlashSwapLiquidationTxParams[];
};

export type PythLiquidatablePool = {
  comptroller: string;
  liquidations: PythEncodedLiquidationTx[];
};

export type ErroredPool = {
  comptroller: string;
  msg: string;
  error?: any;
};

export type PoolUserStruct = {
  account: Address;
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
