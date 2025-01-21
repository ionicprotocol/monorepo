import { LiquidationStrategy } from "@ionicprotocol/types";
import { Address, formatEther, getContract, GetContractReturnType, Hex, PublicClient, zeroAddress } from "viem";
import { mode } from "viem/chains";

import { iAlgebraFactoryAbi, icErc20Abi, iUniswapV2FactoryAbi } from "../../generated";
import { IonicSdk } from "../../IonicSdk";

import { ChainLiquidationConfig } from "./config";
import { getFundingStrategiesAndDatas } from "./fundingStrategy";
import { getRedemptionStrategiesAndDatas } from "./redemptionStrategy";
import {
  FlashSwapLiquidationTxParams,
  PoolUserWithAssets,
  SCALE_FACTOR_ONE_18_WEI,
  SCALE_FACTOR_UNDERLYING_DECIMALS
} from "./utils";

import { estimateGas } from "./index";
async function getLiquidationPenalty(
  collateralCToken: GetContractReturnType<typeof icErc20Abi, PublicClient>,
  liquidationIncentive: bigint
) {
  const protocolSeizeShareMantissa = await collateralCToken.read.protocolSeizeShareMantissa();
  const feeSeizeShareMantissa = await collateralCToken.read.feeSeizeShareMantissa();
  return liquidationIncentive + protocolSeizeShareMantissa + feeSeizeShareMantissa;
}
export default async function getPotentialLiquidation(
  sdk: IonicSdk,
  borrower: PoolUserWithAssets,
  closeFactor: bigint,
  liquidationIncentive: bigint,
  chainLiquidationConfig: ChainLiquidationConfig
): Promise<FlashSwapLiquidationTxParams | null> {
  // Get debt and collateral
  borrower = { ...borrower };
  for (let asset of borrower.assets!) {
    asset = { ...asset };
    asset.borrowBalanceWei = (asset.borrowBalance * asset.underlyingPrice) / SCALE_FACTOR_ONE_18_WEI;
    asset.supplyBalanceWei = (asset.supplyBalance * asset.underlyingPrice) / SCALE_FACTOR_ONE_18_WEI;
    if (asset.borrowBalance > 0n) borrower.debt.push(asset);
    if (asset.membership && asset.supplyBalance > 0) borrower.collateral.push(asset);
  }
  if (!borrower.collateral!.length) {
    sdk.logger.error(`Borrower has no collateral ${borrower.account}`);
    return null;
  }
  // Sort debt and collateral from highest to lowest ETH value
  borrower.debt.sort((a, b) => (b!.borrowBalanceWei! > a!.borrowBalanceWei! ? 1 : -1));
  borrower.collateral.sort((a, b) => (b!.supplyBalanceWei! > a!.supplyBalanceWei! ? 1 : -1));
  // Check SUPPORTED_INPUT_CURRENCIES (if LIQUIDATION_STRATEGY === "")
  if (
    chainLiquidationConfig.LIQUIDATION_STRATEGY === LiquidationStrategy.DEFAULT &&
    chainLiquidationConfig.SUPPORTED_INPUT_CURRENCIES.indexOf(borrower.debt[0].underlyingToken) < 0
  )
    return null;
  let exchangeToTokenAddress: Address;
  // Check SUPPORTED_OUTPUT_CURRENCIES: replace EXCHANGE_TO_TOKEN_ADDRESS with underlying collateral if underlying collateral is in SUPPORTED_OUTPUT_CURRENCIES
  if (chainLiquidationConfig.SUPPORTED_OUTPUT_CURRENCIES.indexOf(borrower.collateral[0].underlyingToken) >= 0) {
    exchangeToTokenAddress = borrower.collateral[0].underlyingToken;
  } else {
    exchangeToTokenAddress = sdk.chainSpecificAddresses.W_TOKEN as Address;
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
  let repayAmount = (debtAsset.borrowBalance * closeFactor) / SCALE_FACTOR_ONE_18_WEI;
  const penalty = await getLiquidationPenalty(sdk.createICErc20(collateralAsset.cToken) as any, liquidationIncentive);
  // Scale to 18 decimals
  let liquidationValue = (repayAmount * debtAssetUnderlyingPrice) / 10n ** BigInt(debtAssetDecimals);
  // 18 decimals
  let seizeValue = (liquidationValue * penalty) / SCALE_FACTOR_ONE_18_WEI;
  // xcDOT: 10 decimals
  let seizeAmount =
    (seizeValue * // 18 decimals
      SCALE_FACTOR_ONE_18_WEI) /
    collateralAssetUnderlyingPrice / // -> 36 decimals // -> 18 decimals
    SCALE_FACTOR_UNDERLYING_DECIMALS(collateralAsset); // -> decimals
  // Check if actual collateral is too low to seize seizeAmount; if so, recalculate liquidation amount
  if (seizeAmount > actualCollateral) {
    // 10 decimals
    seizeAmount = actualCollateral;
    // 18 decimals
    seizeValue =
      (seizeAmount *
        // 28 decimals
        collateralAssetUnderlyingPrice) /
      // 18 decimals
      10n ** BigInt(collateralAssetDecimals);
    // 18 decimals
    liquidationValue = (seizeValue * SCALE_FACTOR_ONE_18_WEI) / penalty;
    // 18 decimals
    repayAmount =
      (liquidationValue * SCALE_FACTOR_ONE_18_WEI) /
      debtAssetUnderlyingPrice /
      SCALE_FACTOR_UNDERLYING_DECIMALS(debtAsset);
  }
  if (repayAmount <= 0n) {
    sdk.logger.info("Liquidation amount is zero, doing nothing");
    return null;
  }
  // Depending on liquidation strategy
  let debtFundingStrategies: Address[] = [];
  let debtFundingStrategiesData: Hex[] = [];
  let flashSwapFundingToken: Address = zeroAddress;
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
  let flashSwapPair: Address;
  let tokenA: Address;
  let tokenB: Address;
  if (sdk.chainId == mode.id) {
    const algebraFactory = getContract({
      address: sdk.chainSpecificAddresses.UNISWAP_V3?.FACTORY as Address,
      abi: iAlgebraFactoryAbi,
      client: sdk.publicClient
    });
    if (flashSwapFundingToken != sdk.chainConfig.chainAddresses.W_TOKEN) {
      tokenA = flashSwapFundingToken;
      tokenB = sdk.chainConfig.chainAddresses.W_TOKEN as Address;
    } else {
      // flashSwapFundingToken is the W_TOKEN
      tokenA = flashSwapFundingToken;
      tokenB = sdk.chainConfig.chainAddresses.STABLE_TOKEN as Address;
    }
    flashSwapPair = await algebraFactory.read.poolByPair([tokenA, tokenB]);
    if (flashSwapPair == zeroAddress || tokenPath.indexOf(flashSwapPair) > 0) {
      // in case the Uniswap pair LP token is on the path of redemptions, we should use
      // another pair because reentrancy checks prevent us from using the pair
      // when inside the execution of a flash swap from the same pair
      tokenA = flashSwapFundingToken;
      tokenB = sdk.chainConfig.chainAddresses.W_BTC_TOKEN as Address;
      flashSwapPair = await algebraFactory.read.poolByPair([tokenA, tokenB]);
    } else {
      sdk.logger.info(`flash swap pair ${flashSwapPair} is not on the token path ${tokenPath}`);
    }
  } else {
    const uniswapV2Factory = getContract({
      address: sdk.chainSpecificAddresses.UNISWAP_V2_FACTORY as Address,
      abi: iUniswapV2FactoryAbi,
      client: sdk.publicClient
    });
    if (flashSwapFundingToken != sdk.chainConfig.chainAddresses.W_TOKEN) {
      flashSwapPair = await uniswapV2Factory.read.getPair([
        flashSwapFundingToken,
        sdk.chainConfig.chainAddresses.W_TOKEN as Address
      ]);
    } else {
      // flashSwapFundingToken is the W_TOKEN
      flashSwapPair = await uniswapV2Factory.read.getPair([
        flashSwapFundingToken,
        sdk.chainConfig.chainAddresses.STABLE_TOKEN as Address
      ]);
      if (tokenPath.indexOf(flashSwapPair) > 0) {
        // in case the Uniswap pair LP token is on the path of redemptions, we should use
        // another pair because reentrancy checks prevent us from using the pair
        // when inside the execution of a flash swap from the same pair
        flashSwapPair = await uniswapV2Factory.read.getPair([
          flashSwapFundingToken,
          sdk.chainConfig.chainAddresses.W_BTC_TOKEN as Address
        ]);
      } else {
        sdk.logger.info(`flash swap pair ${flashSwapPair} is not on the token path ${tokenPath}`);
      }
    }
  }
  if (flashSwapPair === zeroAddress || tokenPath.indexOf(flashSwapPair) > 0) {
    sdk.logger.error(`No good source for flash loan ${flashSwapPair}`);
    return null;
  }
  let expectedGasAmount: bigint;
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
    expectedGasAmount = 100000000000000n;
  }
  // Get gas fee
  // const gasPrice = await sdk.publicClient.getGasPrice();
  // const expectedGasFee = gasPrice * expectedGasAmount;
  // calculate min profits
  // const minProfitAmountEth = expectedGasFee;
  const minProfitAmountEth = 100000000000000n + expectedGasAmount;
  // console.log("minimum", minProfitAmountEth)
  // console.log("expectedGasAmount", expectedGasAmount)
  // console.log("gasprice", gasPrice)
  // const minSeizeAmount = liquidationValueWei.add(minProfitAmountEth)*(SCALE_FACTOR_ONE_18_WEI)/(outputPrice);
  if (seizeValue < minProfitAmountEth) {
    sdk.logger.info(
      `Seize amount of ${formatEther(seizeValue)} less than min break even of ${formatEther(
        minProfitAmountEth
      )}, doing nothing`
    );
    return null;
  }
  return {
    borrower: borrower.account,
    repayAmount,
    cErc20: borrower.debt[0].cToken,
    cTokenCollateral: borrower.collateral[0].cToken,
    minProfitAmount: 0n,
    flashSwapContract: flashSwapPair,
    redemptionStrategies: strategyAndData.strategies,
    strategyData: strategyAndData.datas,
    debtFundingStrategies,
    debtFundingStrategiesData
  };
}
