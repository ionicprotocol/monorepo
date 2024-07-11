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
    asset.borrowBalanceWei = (asset.borrowBalance * asset.underlyingPrice) / SCALE_FACTOR_ONE_18_WEI;
    asset.supplyBalanceWei = (asset.supplyBalance * asset.underlyingPrice) / SCALE_FACTOR_ONE_18_WEI;
    if (asset.borrowBalance > 0) borrower.debt.push(asset);
    if (asset.membership && asset.supplyBalance > 0) borrower.collateral.push(asset);
  }

  if (!borrower.collateral!.length) {
    sdk.logger.error(`Borrower has no collateral ${borrower.account}`);
    return null;
  }

  // Sort debt and collateral from highest to lowest ETH value
  borrower.debt.sort((a, b) => (b.borrowBalanceWei.gt(a.borrowBalanceWei) ? 1 : -1));
  borrower.collateral.sort((a, b) => (b.supplyBalanceWei.gt(a.supplyBalanceWei) ? 1 : -1));
  // Check SUPPORTED_INPUT_CURRENCIES (if LIQUIDATION_STRATEGY === "")
  if (
    chainLiquidationConfig.LIQUIDATION_STRATEGY === LiquidationStrategy.DEFAULT &&
    chainLiquidationConfig.SUPPORTED_INPUT_CURRENCIES.indexOf(borrower.debt[0].underlyingToken) < 0
  )
    return null;

  const debtAsset = borrower.debt[0];
  const collateralAsset = borrower.collateral[0];

  // Get debt and collateral prices
  const debtAssetUnderlyingPrice = debtAsset.underlyingPrice;
  const collateralAssetUnderlyingPrice = collateralAsset.underlyingPrice;
  const debtAssetDecimals = debtAsset.underlyingDecimals;

  const repayAmount = (debtAsset.borrowBalance * closeFactor) / SCALE_FACTOR_ONE_18_WEI;

  const liquidationValue = (repayAmount * debtAssetUnderlyingPrice) / 10n ** debtAssetDecimals;

  const pool = sdk.createComptroller(comptroller);
  const collateralCToken = sdk.createICErc20(collateralAsset.cToken);

  const seizeTokens = await pool.read.liquidateCalculateSeizeTokens([
    debtAsset.cToken,
    collateralAsset.cToken,
    repayAmount
  ]);
  const seizeTokenAmount = seizeTokens[1];
  const protocolSeizeShareMantissa = await collateralCToken.read.protocolSeizeShareMantissa();
  const feeSeizeShareMantissa = await collateralCToken.read.feeSeizeShareMantissa();
  const exchangeRate = await collateralCToken.read.exchangeRateCurrent();

  const protocolFee = (seizeTokenAmount * protocolSeizeShareMantissa) / SCALE_FACTOR_ONE_18_WEI;
  const seizeFee = (seizeTokenAmount * feeSeizeShareMantissa) / SCALE_FACTOR_ONE_18_WEI;

  const actualAmountSeized = seizeTokenAmount - protocolFee - seizeFee;
  const underlyingAmountSeized = (actualAmountSeized * exchangeRate) / SCALE_FACTOR_ONE_18_WEI;

  const underlyingAmountSeizedValue =
    (underlyingAmountSeized * collateralAssetUnderlyingPrice) / SCALE_FACTOR_ONE_18_WEI;

  sdk.logger.info(`Calculated repay amount: ${repayAmount.toString()}`);
  sdk.logger.info(`Seize Token Info ${seizeTokens[1].toString()}`);
  sdk.logger.info(`collateral exchange rate ${formatEther(exchangeRate)}`);
  sdk.logger.info(`liquidation incentive ${formatEther(liquidationIncentive)}`);
  sdk.logger.info(`protocol seize  share ${formatEther(protocolSeizeShareMantissa)}`);
  sdk.logger.info(`fee seize share ${formatEther(feeSeizeShareMantissa)}`);
  sdk.logger.info(`protocol fee ${protocolFee.toString()}`);
  sdk.logger.info(`size fee ${seizeFee.toString()}`);
  sdk.logger.info(`actual amount seized ${actualAmountSeized.toString()}`);
  sdk.logger.info(`underlying amount siezed ${underlyingAmountSeized.toString()}`);

  sdk.logger.info(
    `Transaction Details: Repay Token: ${debtAsset.underlyingToken}, Collateral Token: ${collateralAsset.underlyingToken}, ` +
      `Repay Amount: ${formatEther(repayAmount)}, Seized Collateral Amount: ${formatEther(underlyingAmountSeized)}, ` +
      `Repay Value: ${formatEther(liquidationValue)} , Seized Collateral Value: ${formatEther(
        underlyingAmountSeizedValue
      )} `
  );

  return await encodeLiquidatePythTx(borrower, repayAmount, underlyingAmountSeized);
}
