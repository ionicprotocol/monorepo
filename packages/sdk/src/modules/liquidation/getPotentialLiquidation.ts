import { LiquidationStrategy } from "@midas-capital/types";
import { BigNumber, BytesLike, constants, utils } from "ethers";

import { IUniswapV2Factory__factory } from "../../../lib/contracts/typechain/factories/IUniswapV2Factory__factory";
import { MidasBase } from "../../MidasSdk";

import { ChainLiquidationConfig } from "./config";
import encodeLiquidateTx from "./encodeLiquidateTx";
import { getFundingStrategiesAndDatas } from "./fundingStrategy";
import { getRedemptionStrategiesAndDatas } from "./redemptionStrategy";
import {
  EncodedLiquidationTx,
  FusePoolUserWithAssets,
  SCALE_FACTOR_ONE_18_WEI,
  SCALE_FACTOR_UNDERLYING_DECIMALS,
} from "./utils";

import { estimateGas } from "./index";

// 10 % of debt repaid
const PROTOCOL_FEE = BigNumber.from(100);

// 2.8 % of debt repaid
const MARKET_FEE = BigNumber.from(280);

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
    exchangeToTokenAddress = fuse.chainSpecificAddresses.W_TOKEN;
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

  const protocolFee = liquidationAmount.mul(PROTOCOL_FEE).div(1000);
  const marketFee = liquidationAmount.mul(MARKET_FEE).div(1000);

  liquidationAmount = liquidationAmount.add(protocolFee).add(marketFee);

  let liquidationValueWei = liquidationAmount.mul(underlyingDebtPrice).div(SCALE_FACTOR_ONE_18_WEI);

  /*
  it is + , not - for seize amount = repaid_debt + liquidation_penalty
  the liquidation penalty percentages are all against the amount repaid. if the debt repaid is 1000:
  - protocol fee is 100 (10% of debt repaid)
  -  market fee is 28 (2.8 % of debt repaid) 
  */

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
  let debtFundingStrategies: string[] = [];
  let debtFundingStrategiesData: BytesLike[] = [];
  let flashSwapFundingToken = constants.AddressZero;

  if (chainLiquidationConfig.LIQUIDATION_STRATEGY == LiquidationStrategy.UNISWAP) {
    // chain some liquidation funding strategies
    const fundingStrategiesAndDatas = await getFundingStrategiesAndDatas(fuse, borrower.debt[0].underlyingToken);
    debtFundingStrategies = fundingStrategiesAndDatas.strategies;
    debtFundingStrategiesData = fundingStrategiesAndDatas.datas;
    flashSwapFundingToken = fundingStrategiesAndDatas.flashSwapFundingToken;
  }

  //  chain some collateral redemption strategies
  const [strategyAndData, tokenPath] = await getRedemptionStrategiesAndDatas(
    fuse,
    borrower.collateral[0].underlyingToken,
    flashSwapFundingToken
  );

  let flashSwapPair;
  const uniswapV2Factory = IUniswapV2Factory__factory.connect(
    fuse.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    fuse.provider
  );

  if (flashSwapFundingToken != fuse.chainConfig.chainAddresses.W_TOKEN) {
    flashSwapPair = await uniswapV2Factory.callStatic.getPair(
      flashSwapFundingToken,
      fuse.chainConfig.chainAddresses.W_TOKEN
    );
  } else {
    // flashSwapFundingToken is the W_TOKEN
    flashSwapPair = await uniswapV2Factory.callStatic.getPair(
      flashSwapFundingToken,
      fuse.chainConfig.chainAddresses.STABLE_TOKEN
    );
    if (tokenPath.indexOf(flashSwapPair) > 0) {
      // in case the Uniswap pair LP token is on the path of redemptions, we should use
      // another pair because reentrancy checks prevent us from using the pair
      // when inside the execution of a flash swap from the same pair
      flashSwapPair = await uniswapV2Factory.callStatic.getPair(
        flashSwapFundingToken,
        fuse.chainConfig.chainAddresses.W_BTC_TOKEN
      );
    }
  }

  let expectedGasAmount: BigNumber;
  try {
    expectedGasAmount = await estimateGas(
      fuse,
      borrower,
      exchangeToTokenAddress,
      liquidationAmount,
      strategyAndData,
      flashSwapPair,
      chainLiquidationConfig.LIQUIDATION_STRATEGY,
      debtFundingStrategies,
      debtFundingStrategiesData
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
    chainLiquidationConfig.LIQUIDATION_STRATEGY,
    borrower,
    exchangeToTokenAddress,
    strategyAndData,
    liquidationAmount,
    flashSwapPair,
    debtFundingStrategies,
    debtFundingStrategiesData
  );
}
