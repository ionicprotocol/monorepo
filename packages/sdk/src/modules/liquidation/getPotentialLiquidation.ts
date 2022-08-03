import { BigNumber, constants, utils } from "ethers";

import { LiquidationKind, LiquidationStrategy } from "../../enums";
import { MidasBase } from "../../MidasSdk";

import { ChainLiquidationConfig, getLiquidationKind } from "./config";
import encodeLiquidateTx from "./encodeLiquidateTx";
import { getStrategiesAndDatas } from "./redemptionStrategy";
import {
  EncodedLiquidationTx,
  FusePoolUserWithAssets,
  SCALE_FACTOR_ONE_18_WEI,
  SCALE_FACTOR_UNDERLYING_DECIMALS,
} from "./utils";

import { estimateGas } from "./index";

export default async function getPotentialLiquidation(
  fuse: MidasBase,
  borrower: FusePoolUserWithAssets,
  closeFactor: BigNumber,
  liquidationIncentive: BigNumber,
  chainLiquidationConfig: ChainLiquidationConfig
): Promise<EncodedLiquidationTx | null> {
  // Get debt and collateral
  borrower = { ...borrower };

  for (let asset of borrower.assets!) {
    asset = { ...asset };
    asset.borrowBalanceWei = asset.borrowBalance.mul(asset.underlyingPrice).div(SCALE_FACTOR_ONE_18_WEI);
    asset.supplyBalanceWei = asset.supplyBalance.mul(asset.underlyingPrice).div(SCALE_FACTOR_ONE_18_WEI);
    if (asset.borrowBalance.gt(0)) borrower.debt.push(asset);
    if (asset.membership && asset.supplyBalance.gt(0)) borrower.collateral.push(asset);
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

  let outputPrice: BigNumber;
  let outputDecimals: BigNumber;
  let exchangeToTokenAddress: string;

  // Check SUPPORTED_OUTPUT_CURRENCIES: replace EXCHANGE_TO_TOKEN_ADDRESS with underlying collateral if underlying collateral is in SUPPORTED_OUTPUT_CURRENCIES
  if (chainLiquidationConfig.SUPPORTED_OUTPUT_CURRENCIES.indexOf(borrower.collateral[0].underlyingToken) >= 0) {
    exchangeToTokenAddress = borrower.collateral[0].underlyingToken;
    outputPrice = borrower.collateral[0].underlyingPrice;
    outputDecimals = borrower.collateral[0].underlyingDecimals;
  } else {
    exchangeToTokenAddress = constants.AddressZero;
    outputPrice = utils.parseEther("1");
    outputDecimals = BigNumber.from(18);
  }

  // Get debt and collateral prices
  const underlyingDebtPrice = borrower.debt[0].underlyingPrice.div(SCALE_FACTOR_UNDERLYING_DECIMALS(borrower.debt[0]));
  const underlyingCollateralPrice = borrower.collateral[0].underlyingPrice.div(
    SCALE_FACTOR_UNDERLYING_DECIMALS(borrower.collateral[0])
  );

  // Get liquidation amount
  let liquidationAmount = borrower.debt[0].borrowBalance
    .mul(closeFactor)
    .div(BigNumber.from(10).pow(borrower.debt[0].underlyingDecimals.toNumber()));

  let liquidationValueWei = liquidationAmount.mul(underlyingDebtPrice).div(SCALE_FACTOR_ONE_18_WEI);

  // Get seize amount
  let seizeAmountWei = liquidationValueWei.mul(liquidationIncentive).div(SCALE_FACTOR_ONE_18_WEI);
  let seizeAmount = seizeAmountWei.mul(SCALE_FACTOR_ONE_18_WEI).div(underlyingCollateralPrice);

  // Check if actual collateral is too low to seize seizeAmount; if so, recalculate liquidation amount
  const actualCollateral = borrower.collateral[0].supplyBalance.div(
    SCALE_FACTOR_UNDERLYING_DECIMALS(borrower.collateral[0])
  );

  if (seizeAmount.gt(actualCollateral)) {
    seizeAmount = actualCollateral;
    seizeAmountWei = seizeAmount.mul(underlyingCollateralPrice);
    liquidationValueWei = seizeAmountWei.div(liquidationIncentive);
    liquidationAmount = liquidationValueWei.mul(SCALE_FACTOR_ONE_18_WEI).div(underlyingDebtPrice);
  }

  if (liquidationAmount.lte(BigNumber.from(0))) {
    console.log("Liquidation amount is zero, doing nothing");
    return null;
  }
  // Depending on liquidation strategy
  const liquidationKind = getLiquidationKind(
    chainLiquidationConfig.LIQUIDATION_STRATEGY,
    borrower.debt[0].underlyingToken
  );
  const expectedOutputToken =
    chainLiquidationConfig.LIQUIDATION_STRATEGY == LiquidationKind.UNISWAP_NATIVE_BORROW
      ? borrower.debt[0].underlyingToken
      : null;
  const strategyAndData = await getStrategiesAndDatas(fuse, borrower.collateral[0].underlyingToken, null);

  let expectedGasAmount: BigNumber;
  try {
    expectedGasAmount = await estimateGas(
      fuse,
      borrower,
      exchangeToTokenAddress,
      liquidationAmount,
      strategyAndData,
      liquidationKind
    );
  } catch {
    expectedGasAmount = BigNumber.from(750000);
  }
  // Get gas fee
  const gasPrice = await fuse.provider.getGasPrice();
  const expectedGasFee = gasPrice.mul(expectedGasAmount);

  // calculate min profits
  const minProfitAmountEth = expectedGasFee.add(chainLiquidationConfig.MINIMUM_PROFIT_NATIVE);
  // const minSeizeAmount = liquidationValueWei.add(minProfitAmountEth).mul(SCALE_FACTOR_ONE_18_WEI).div(outputPrice);

  if (seizeAmountWei.lt(minProfitAmountEth)) {
    console.log(
      `Seize amount of ${utils.formatEther(seizeAmountWei)} less than min break even of ${utils.formatEther(
        minProfitAmountEth
      )}, doing nothing`
    );
    return null;
  }
  return await encodeLiquidateTx(
    fuse,
    liquidationKind,
    borrower,
    exchangeToTokenAddress,
    strategyAndData,
    liquidationAmount,
    minProfitAmountEth.div(outputPrice).mul(BigNumber.from(10).pow(outputDecimals))
  );
}
