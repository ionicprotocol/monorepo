import { TransactionRequest } from "@ethersproject/providers";
import { IonicAsset, LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber, BigNumberish, utils } from "ethers";

import { PoolLens } from "../../../typechain/PoolLens";
import { IonicBase } from "../../IonicSdk";

export const SCALE_FACTOR_ONE_18_WEI = BigNumber.from(10).pow(18);
export const SCALE_FACTOR_UNDERLYING_DECIMALS = (asset: IonicAsset) =>
  BigNumber.from(10).pow(18 - asset.underlyingDecimals.toNumber());

export type ExtendedPoolAssetStructOutput = PoolLens.PoolAssetStructOutput & {
  borrowBalanceWei?: BigNumber;
  supplyBalanceWei?: BigNumber;
};

export type EncodedLiquidationTx = {
  method: string;
  args: Array<any>;
  value: BigNumber;
};

export enum BotType {
  Standard,
  Pyth
}

export type PythEncodedLiquidationTx = {
  method: string;
  args: Array<any>;
  value: BigNumber;
  buyTokenAmount: BigNumber;
  sellTokenAmount: BigNumber;
  buyTokenUnderlying: string;
  sellTokenUnderlying: string;
};

export type PoolUserWithAssets = {
  assets: ExtendedPoolAssetStructOutput[];
  account: string;
  totalBorrow: BigNumberish;
  totalCollateral: BigNumberish;
  health: BigNumberish;
  debt: Array<any>;
  collateral: Array<any>;
};

export type LiquidatablePool = {
  comptroller: string;
  liquidations: EncodedLiquidationTx[];
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
  account: string;
  totalBorrow: BigNumberish;
  totalCollateral: BigNumberish;
  health: BigNumberish;
};

export type PublicPoolUserWithData = {
  comptroller: string;
  users: PoolUserStruct[];
  closeFactor: BigNumber;
  liquidationIncentive: BigNumber;
};

export async function fetchGasLimitForTransaction(sdk: IonicBase, method: string, tx: TransactionRequest) {
  try {
    return (await sdk.provider.estimateGas(tx)).mul(11).div(10);
  } catch (error) {
    throw `Failed to estimate gas before signing and sending ${method} transaction: ${error}`;
  }
}

export async function fetchGasPrice(sdk: IonicBase, method: string, pctBump = 10) {
  try {
    return (await sdk.provider.getGasPrice()).mul(100 + pctBump).div(100);
  } catch (error) {
    throw `Failed to get gas price before signing and sending ${method} transaction: ${error}`;
  }
}

export const logLiquidation = (
  sdk: IonicBase,
  borrower: PoolUserWithAssets,
  exchangeToTokenAddress: string,
  liquidationAmount: BigNumber,
  liquidationTokenSymbol: string,
  liquidationStrategy: LiquidationStrategy,
  debtFundingStrategies: any[]
) => {
  sdk.logger.info(
    `Gathered transaction data for safeLiquidate a ${liquidationTokenSymbol} borrow of kind ${liquidationStrategy}:
         - Liquidation Amount: ${utils.formatEther(liquidationAmount)}
         - Underlying Collateral Token: ${borrower.collateral[0].underlyingSymbol} ${borrower.collateral[0].cToken}
         - Underlying Debt Token: ${borrower.debt[0].underlyingSymbol} ${borrower.debt[0].cToken}
         - Funding the liquidation with: ${debtFundingStrategies}
         - Exchanging liquidated tokens to: ${exchangeToTokenAddress}
         - Borrower: ${borrower.account}
         `
  );
};
