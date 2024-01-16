import { LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import { IonicSdk } from "../../IonicSdk";

import { getUniswapV2Router, StrategiesAndDatas } from "./redemptionStrategy";
import { PoolUserWithAssets } from "./utils";

const estimateGas = async (
  sdk: IonicSdk,
  borrower: PoolUserWithAssets,
  liquidationAmount: BigNumber,
  strategiesAndDatas: StrategiesAndDatas,
  flashSwapPair: string,
  liquidationStrategy: LiquidationStrategy,
  debtFundingStrategies: any[],
  debtFundingStrategiesData: any[]
) => {
  switch (liquidationStrategy) {
    case LiquidationStrategy.DEFAULT:
      return await sdk.contracts.IonicLiquidator.estimateGas.safeLiquidate(
        borrower.account,
        liquidationAmount,
        borrower.debt[0].cToken,
        borrower.collateral[0].cToken,
        0,
        {
          gasLimit: 1e9,
          from: process.env.ETHEREUM_ADMIN_ACCOUNT
        }
      );
    case LiquidationStrategy.UNISWAP:
      return await sdk.contracts.IonicLiquidator.estimateGas.safeLiquidateToTokensWithFlashLoan(
        {
          borrower: borrower.account,
          repayAmount: liquidationAmount,
          cErc20: borrower.debt[0].cToken,
          cTokenCollateral: borrower.collateral[0].cToken,
          minProfitAmount: 0,
          redemptionStrategies: strategiesAndDatas.strategies,
          strategyData: strategiesAndDatas.datas,
          flashSwapContract: flashSwapPair,
          debtFundingStrategies,
          debtFundingStrategiesData
        },
        {
          gasLimit: 1e9,
          from: process.env.ETHEREUM_ADMIN_ACCOUNT
        }
      );
  }
};

export default estimateGas;
