import { LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber, BytesLike, constants, utils } from "ethers";

import { ICErc20 } from "../../../typechain/CTokenInterfaces.sol/ICErc20";
import { IonicSdk } from "../../IonicSdk";

import { ChainLiquidationConfig } from "./config";
import encodeLiquidatePythTx from "./encodeLiquidatePythTx";
import {
  PythEncodedLiquidationTx,
  PoolUserWithAssets,
  SCALE_FACTOR_ONE_18_WEI,
  SCALE_FACTOR_UNDERLYING_DECIMALS
} from "./utils";

export default async function getPotentialLiquidation(
  sdk: IonicSdk,
  borrower: PoolUserWithAssets,
  closeFactor: BigNumber,
  liquidationIncentive: BigNumber,
  comptroller: string,
  chainLiquidationConfig: ChainLiquidationConfig
): Promise<PythEncodedLiquidationTx | null> {
  // Get debt and collateral
  borrower = { ...borrower };

  for (let asset of borrower.assets!) {
    asset = { ...asset };
    asset.borrowBalanceWei = asset.borrowBalance.mul(asset.underlyingPrice).div(SCALE_FACTOR_ONE_18_WEI);
    asset.supplyBalanceWei = asset.supplyBalance.mul(asset.underlyingPrice).div(SCALE_FACTOR_ONE_18_WEI);
    if (asset.borrowBalance.gt(0)) borrower.debt.push(asset);
    if (asset.membership && asset.supplyBalance.gt(0)) borrower.collateral.push(asset);
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

  // USDC: 6 decimals
  let repayAmount = debtAsset.borrowBalance.mul(closeFactor).div(SCALE_FACTOR_ONE_18_WEI);
  // let repayAmount = BigNumber.from("3558550460587311386699");

  // Scale to 18 decimals
  let liquidationValue = repayAmount.mul(debtAssetUnderlyingPrice).div(BigNumber.from(10).pow(debtAssetDecimals));

  const pool = sdk.createComptroller(comptroller);
  const collateralCToken = sdk.createICErc20(collateralAsset.cToken);

  const seizeTokens = await pool.callStatic.liquidateCalculateSeizeTokens(
    debtAsset.cToken,
    collateralAsset.cToken,
    repayAmount
  );
  const seizeTokenAmount = seizeTokens[1];
  const protocolSeizeShareMantissa = await collateralCToken.callStatic.protocolSeizeShareMantissa();
  const feeSeizeShareMantissa = await collateralCToken.callStatic.feeSeizeShareMantissa();
  const exchangeRate = await collateralCToken.callStatic.exchangeRateCurrent();

  const protocolFee = seizeTokenAmount.mul(protocolSeizeShareMantissa).div(SCALE_FACTOR_ONE_18_WEI);
  const seizeFee = seizeTokenAmount.mul(feeSeizeShareMantissa).div(SCALE_FACTOR_ONE_18_WEI);

  const actualAmountSeized = seizeTokenAmount.sub(protocolFee).sub(seizeFee);
  const underlyingAmountSeized = actualAmountSeized.mul(exchangeRate).div(SCALE_FACTOR_ONE_18_WEI);

  const underlyingAmountSeizedValue = underlyingAmountSeized
    .mul(collateralAssetUnderlyingPrice)
    .div(SCALE_FACTOR_ONE_18_WEI);

  sdk.logger.info(`Calculated repay amount: ${repayAmount.toString()}`);
  sdk.logger.info(`Seize Token Info ${seizeTokens[1].toString()}`);
  sdk.logger.info(`collateral exchange rate ${utils.formatEther(exchangeRate)}`);
  sdk.logger.info(`liquidation incentive ${utils.formatEther(liquidationIncentive)}`);
  sdk.logger.info(`protocol seize  share ${utils.formatEther(protocolSeizeShareMantissa)}`);
  sdk.logger.info(`fee seize share ${utils.formatEther(feeSeizeShareMantissa)}`);
  sdk.logger.info(`protocol fee ${protocolFee.toString()}`);
  sdk.logger.info(`size fee ${seizeFee.toString()}`);
  sdk.logger.info(`actual amount seized ${actualAmountSeized.toString()}`);
  sdk.logger.info(`underlying amount siezed ${underlyingAmountSeized.toString()}`);

  sdk.logger.info(
    `Transaction Details: Repay Token: ${debtAsset.underlyingToken}, Collateral Token: ${collateralAsset.underlyingToken}, ` +
      `Repay Amount: ${utils.formatEther(repayAmount)}, Seized Collateral Amount: ${utils.formatEther(
        underlyingAmountSeized
      )}, ` +
      `Repay Value: ${utils.formatEther(liquidationValue)} , Seized Collateral Value: ${utils.formatEther(
        underlyingAmountSeizedValue
      )} `
  );

  return await encodeLiquidatePythTx(borrower, repayAmount, underlyingAmountSeized);
}
