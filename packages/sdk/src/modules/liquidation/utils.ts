import { TransactionRequest } from "@ethersproject/providers";
import { FuseAsset, LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber, BigNumberish, utils } from "ethers";

import { FusePoolLens } from "../../../typechain/FusePoolLens";
import { IonicBase } from "../../IonicSdk";

export const SCALE_FACTOR_ONE_18_WEI = BigNumber.from(10).pow(18);
export const SCALE_FACTOR_UNDERLYING_DECIMALS = (asset: FuseAsset) =>
  BigNumber.from(10).pow(18 - asset.underlyingDecimals.toNumber());

export type ExtendedFusePoolAssetStructOutput = FusePoolLens.FusePoolAssetStructOutput & {
  borrowBalanceWei?: BigNumber;
  supplyBalanceWei?: BigNumber;
};

export type EncodedLiquidationTx = {
  method: string;
  args: Array<any>;
  value: BigNumber;
};

export type FusePoolUserWithAssets = {
  assets: ExtendedFusePoolAssetStructOutput[];
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

export type ErroredPool = {
  comptroller: string;
  msg: string;
  error?: any;
};

export type FusePoolUserStruct = {
  account: string;
  totalBorrow: BigNumberish;
  totalCollateral: BigNumberish;
  health: BigNumberish;
};

export type PublicPoolUserWithData = {
  comptroller: string;
  users: FusePoolUserStruct[];
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

export const logLiquidation = (
  sdk: IonicBase,
  borrower: FusePoolUserWithAssets,
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
