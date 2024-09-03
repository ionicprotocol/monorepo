import { LiquidationStrategy } from "@ionicprotocol/types";
import { Address, formatEther } from "viem";

import { IonicSdk } from "../../IonicSdk";

import { ChainLiquidationConfig } from "./config";
import encodeLiquidatePythTx from "./encodeLiquidatePythTx";
import { PoolUserWithAssets, PythEncodedLiquidationTx, SCALE_FACTOR_ONE_18_WEI } from "./utils";

export default async function getPotentialLiquidation(
  sdk: IonicSdk,
  borrower: PoolUserWithAssets,
  closeFactor: bigint,
  liquidationIncentive: bigint,
  comptroller: Address,
  chainLiquidationConfig: ChainLiquidationConfig
): Promise<PythEncodedLiquidationTx | null> {
  // Get debt and collateral
  borrower = { ...borrower };

  for (let asset of borrower.assets!) {
    asset = { ...asset };
    const scaleFactor = 10n ** (18n - asset.underlyingDecimals);
    asset.borrowBalanceWei = (asset.borrowBalance * asset.underlyingPrice * scaleFactor) / SCALE_FACTOR_ONE_18_WEI;
    asset.supplyBalanceWei = (asset.supplyBalance * asset.underlyingPrice * scaleFactor) / SCALE_FACTOR_ONE_18_WEI;
    if (asset.borrowBalance > 0) borrower.debt.push(asset);
    if (asset.membership && asset.supplyBalance > 0) borrower.collateral.push(asset);
  }

  if (!borrower.collateral!.length) {
    sdk.logger.error(`Borrower has no collateral ${borrower.account}`);
    return null;
  }

  // Sort debt and collateral from highest to lowest ETH value
  borrower.debt.sort((a, b) => (b.borrowBalanceWei > a.borrowBalanceWei ? 1 : -1));
  borrower.collateral.sort((a, b) => (b.supplyBalanceWei > a.supplyBalanceWei ? 1 : -1));

  // Check SUPPORTED_INPUT_CURRENCIES (if LIQUIDATION_STRATEGY === "")
  if (
    chainLiquidationConfig.LIQUIDATION_STRATEGY === LiquidationStrategy.DEFAULT &&
    chainLiquidationConfig.SUPPORTED_INPUT_CURRENCIES.indexOf(borrower.debt[0].underlyingToken) < 0
  )
    return null;

  const debtAsset = borrower.debt[0];
  const collateralAsset = borrower.collateral[0];

  if (debtAsset.borrowBalanceWei < 3877938057596160n) {
    sdk.logger.info(`Borrow too small, skipping liquidation. Vault: ${borrower.account}`);
    return null;
  } else {
    sdk.logger.info(`Sufficiently Large Borrow, processing liquidation. Vault: ${borrower.account}`);
  }

  // Calculate the maximum repayable amount based on available collateral
  const pool = sdk.createComptroller(comptroller);
  const collateralCToken = sdk.createICErc20(collateralAsset.cToken);

  const seizeTokens = await pool.read.liquidateCalculateSeizeTokens([
    debtAsset.cToken,
    collateralAsset.cToken,
    debtAsset.borrowBalanceWei
  ]);
  const seizeTokenAmount = seizeTokens[1];
  const protocolSeizeShareMantissa = await collateralCToken.read.protocolSeizeShareMantissa();
  const feeSeizeShareMantissa = await collateralCToken.read.feeSeizeShareMantissa();
  const exchangeRate = await collateralCToken.read.exchangeRateCurrent();

  const protocolFee = (seizeTokenAmount * protocolSeizeShareMantissa) / SCALE_FACTOR_ONE_18_WEI;
  const seizeFee = (seizeTokenAmount * feeSeizeShareMantissa) / SCALE_FACTOR_ONE_18_WEI;

  const actualAmountSeized = seizeTokenAmount - protocolFee - seizeFee;

  const BUY_TOKENS_SCALE_FACTOR = 1000n;
  const BUY_TOKENS_OFFSET = 999n;
  const underlyingAmountSeized =
    (actualAmountSeized * exchangeRate * BUY_TOKENS_OFFSET) / (BUY_TOKENS_SCALE_FACTOR * SCALE_FACTOR_ONE_18_WEI);

  // Calculate how much of the debt can be repaid based on the available collateral
  const maxRepayAmount = (underlyingAmountSeized * SCALE_FACTOR_ONE_18_WEI) / (liquidationIncentive * exchangeRate);
  const repayAmount = maxRepayAmount < debtAsset.borrowBalanceWei
    ? maxRepayAmount
    : (debtAsset.borrowBalance * closeFactor) / SCALE_FACTOR_ONE_18_WEI;

  // Send the liquidation opportunity even if the full close factor cannot be repaid
  return await encodeLiquidatePythTx(borrower, repayAmount, underlyingAmountSeized);
}
