import { LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber, BytesLike, constants, utils } from "ethers";

import { ICErc20 } from "../../../typechain/CTokenInterfaces.sol/ICErc20";
import { LiquidatorsRegistry } from "../../../typechain/LiquidatorsRegistry";
import { IUniswapV2Factory__factory } from "../../../typechain/factories/IUniswapV2Factory__factory";
import { IUniswapV3Factory__factory } from "../../../typechain/factories/IUniswapV3Factory__factory";
import { LiquidatorsRegistry__factory } from "../../../typechain/factories/LiquidatorsRegistry__factory";
import { IonicSdk } from "../../IonicSdk";

import { ChainLiquidationConfig } from "./config";
import encodeLiquidateTx from "./encodeLiquidateTx";
import { getFundingStrategiesAndDatas } from "./fundingStrategy";
import { getRedemptionStrategiesAndDatas } from "./redemptionStrategy";
import {
  EncodedLiquidationTx,
  PoolUserWithAssets,
  SCALE_FACTOR_ONE_18_WEI,
  SCALE_FACTOR_UNDERLYING_DECIMALS
} from "./utils";

import { estimateGas } from "./index";

async function getLiquidationPenalty(collateralCToken: ICErc20, liquidationIncentive: BigNumber) {
  const protocolSeizeShareMantissa = await collateralCToken.callStatic.protocolSeizeShareMantissa();
  const feeSeizeShareMantissa = await collateralCToken.callStatic.feeSeizeShareMantissa();
  return liquidationIncentive.add(protocolSeizeShareMantissa).add(feeSeizeShareMantissa);
}

export default async function getPotentialLiquidation(
  sdk: IonicSdk,
  borrower: PoolUserWithAssets,
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

  let exchangeToTokenAddress: string;

  // Check SUPPORTED_OUTPUT_CURRENCIES: replace EXCHANGE_TO_TOKEN_ADDRESS with underlying collateral if underlying collateral is in SUPPORTED_OUTPUT_CURRENCIES
  if (chainLiquidationConfig.SUPPORTED_OUTPUT_CURRENCIES.indexOf(borrower.collateral[0].underlyingToken) >= 0) {
    exchangeToTokenAddress = borrower.collateral[0].underlyingToken;
  } else {
    exchangeToTokenAddress = sdk.chainSpecificAddresses.W_TOKEN;
  }

  const debtAsset = borrower.debt[0];
  const collateralAsset = borrower.collateral[0];

  // Get debt and collateral prices
  const debtAssetUnderlyingPrice = debtAsset.underlyingPrice;
  const collateralAssetUnderlyingPrice = collateralAsset.underlyingPrice;
  const debtAssetDecimals = debtAsset.underlyingDecimals;
  const collateralAssetDecimals = collateralAsset.underlyingDecimals;
  const debtAssetUnderlyingToken = debtAsset.underlyingToken;
  // xcDOT: 10 decimals
  const actualCollateral = collateralAsset.supplyBalance;

  // Get liquidation amount

  // USDC: 6 decimals
  let repayAmount = debtAsset.borrowBalance.mul(closeFactor).div(SCALE_FACTOR_ONE_18_WEI);
  const penalty = await getLiquidationPenalty(sdk.createICErc20(collateralAsset.cToken), liquidationIncentive);

  // Scale to 18 decimals
  let liquidationValue = repayAmount.mul(debtAssetUnderlyingPrice).div(BigNumber.from(10).pow(debtAssetDecimals));

  // 18 decimals
  let seizeValue = liquidationValue.mul(penalty).div(SCALE_FACTOR_ONE_18_WEI);

  // xcDOT: 10 decimals
  let seizeAmount = seizeValue // 18 decimals
    .mul(SCALE_FACTOR_ONE_18_WEI) // -> 36 decimals
    .div(collateralAssetUnderlyingPrice) // -> 18 decimals
    .div(SCALE_FACTOR_UNDERLYING_DECIMALS(collateralAsset)); // -> decimals

  // Check if actual collateral is too low to seize seizeAmount; if so, recalculate liquidation amount

  if (seizeAmount.gt(actualCollateral)) {
    // 10 decimals
    seizeAmount = actualCollateral;
    // 18 decimals
    seizeValue = seizeAmount
      // 28 decimals
      .mul(collateralAssetUnderlyingPrice)
      // 18 decimals
      .div(BigNumber.from(10).pow(collateralAssetDecimals));

    // 18 decimals
    liquidationValue = seizeValue.mul(SCALE_FACTOR_ONE_18_WEI).div(penalty);
    // 18 decimals
    repayAmount = liquidationValue
      .mul(SCALE_FACTOR_ONE_18_WEI)
      .div(debtAssetUnderlyingPrice)
      .div(SCALE_FACTOR_UNDERLYING_DECIMALS(debtAsset));
  }

  if (repayAmount.lte(BigNumber.from(0))) {
    sdk.logger.info("Liquidation amount is zero, doing nothing");
    return null;
  }
  // Depending on liquidation strategy
  let debtFundingStrategies: string[] = [];
  let debtFundingStrategiesData: BytesLike[] = [];
  let flashSwapFundingToken = constants.AddressZero;

  if (chainLiquidationConfig.LIQUIDATION_STRATEGY == LiquidationStrategy.UNISWAP) {
    // chain some liquidation funding strategies
    const fundingStrategiesAndDatas = await getFundingStrategiesAndDatas(sdk, debtAssetUnderlyingToken);
    debtFundingStrategies = fundingStrategiesAndDatas.strategies;
    debtFundingStrategiesData = fundingStrategiesAndDatas.datas;
    flashSwapFundingToken = fundingStrategiesAndDatas.flashSwapFundingToken;
  }

  //  chain some collateral redemption strategies
  const [strategyAndData, tokenPath] = await getRedemptionStrategiesAndDatas(
    sdk,
    borrower.collateral[0].underlyingToken,
    flashSwapFundingToken
  );

  let flashSwapPair;
  let tokenA, tokenB;
  if (sdk.chainId == 34443) {
    const uniV3Factory = IUniswapV3Factory__factory.connect(
      sdk.chainSpecificAddresses.UNISWAP_V3?.FACTORY || "0xC33Ce0058004d44E7e1F366E5797A578fDF38584",
      sdk.provider
    );

    if (flashSwapFundingToken != sdk.chainConfig.chainAddresses.W_TOKEN) {
      tokenA = flashSwapFundingToken;
      tokenB = sdk.chainConfig.chainAddresses.W_TOKEN;
    } else {
      // flashSwapFundingToken is the W_TOKEN
      tokenA = flashSwapFundingToken;
      tokenB = sdk.chainConfig.chainAddresses.STABLE_TOKEN;
    }
    // query the configured univ3 pool fee from the liquidators registry
    const lrAddress = await sdk.contracts.AddressesProvider.getAddress("LiquidatorsRegistry");
    const liquidatorsRegistry = LiquidatorsRegistry__factory.connect(lrAddress, sdk.provider) as LiquidatorsRegistry;
    const fee = await liquidatorsRegistry.callStatic.uniswapV3Fees(tokenA, tokenB)

    flashSwapPair = await uniV3Factory.callStatic.getPool(tokenA, tokenB, fee);
    if (tokenPath.indexOf(flashSwapPair) > 0) {
      // in case the Uniswap pair LP token is on the path of redemptions, we should use
      // another pair because reentrancy checks prevent us from using the pair
      // when inside the execution of a flash swap from the same pair
      tokenA = flashSwapFundingToken;
      tokenB = sdk.chainConfig.chainAddresses.W_BTC_TOKEN;
      flashSwapPair = await uniV3Factory.callStatic.getPool(tokenA, tokenB, fee);
    } else {
      sdk.logger.info(`flash swap pair ${flashSwapPair} is not on the token path ${tokenPath}`);
    }
  } else {
    const uniswapV2Factory = IUniswapV2Factory__factory.connect(
      sdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
      sdk.provider
    );

    if (flashSwapFundingToken != sdk.chainConfig.chainAddresses.W_TOKEN) {
      flashSwapPair = await uniswapV2Factory.callStatic.getPair(
        flashSwapFundingToken,
        sdk.chainConfig.chainAddresses.W_TOKEN
      );
    } else {
      // flashSwapFundingToken is the W_TOKEN
      flashSwapPair = await uniswapV2Factory.callStatic.getPair(
        flashSwapFundingToken,
        sdk.chainConfig.chainAddresses.STABLE_TOKEN
      );
      if (tokenPath.indexOf(flashSwapPair) > 0) {
        // in case the Uniswap pair LP token is on the path of redemptions, we should use
        // another pair because reentrancy checks prevent us from using the pair
        // when inside the execution of a flash swap from the same pair
        flashSwapPair = await uniswapV2Factory.callStatic.getPair(
          flashSwapFundingToken,
          sdk.chainConfig.chainAddresses.W_BTC_TOKEN
        );
      } else {
        sdk.logger.info(`flash swap pair ${flashSwapPair} is not on the token path ${tokenPath}`);
      }
    }
  }

  let expectedGasAmount: BigNumber;
  try {
    expectedGasAmount = await estimateGas(
      sdk,
      borrower,
      repayAmount,
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
  const gasPrice = await sdk.provider.getGasPrice();
  const expectedGasFee = gasPrice.mul(expectedGasAmount);

  // calculate min profits
  const minProfitAmountEth = expectedGasFee.add(chainLiquidationConfig.MINIMUM_PROFIT_NATIVE);

  // const minSeizeAmount = liquidationValueWei.add(minProfitAmountEth).mul(SCALE_FACTOR_ONE_18_WEI).div(outputPrice);

  if (seizeValue.lt(minProfitAmountEth)) {
    sdk.logger.info(
      `Seize amount of ${utils.formatEther(seizeValue)} less than min break even of ${utils.formatEther(
        minProfitAmountEth
      )}, doing nothing`
    );
    return null;
  }
  return await encodeLiquidateTx(
    sdk,
    chainLiquidationConfig.LIQUIDATION_STRATEGY,
    borrower,
    exchangeToTokenAddress,
    strategyAndData,
    repayAmount,
    flashSwapPair,
    debtFundingStrategies,
    debtFundingStrategiesData
  );
}
