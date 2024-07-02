import { LiquidationStrategy } from "@ionicprotocol/types";
import { Address } from "viem";

import { IonicSdk } from "../../IonicSdk";

import { StrategiesAndDatas } from "./redemptionStrategy";
import { PoolUserWithAssets } from "./utils";

const estimateGas = async (
  sdk: IonicSdk,
  borrower: PoolUserWithAssets,
  liquidationAmount: bigint,
  strategiesAndDatas: StrategiesAndDatas,
  flashSwapPair: Address,
  liquidationStrategy: LiquidationStrategy,
  debtFundingStrategies: any[],
  debtFundingStrategiesData: any[]
) => {
  switch (liquidationStrategy) {
    case LiquidationStrategy.DEFAULT:
      return await sdk.contracts.IonicLiquidator.estimateGas.safeLiquidate(
        [borrower.account, liquidationAmount, borrower.debt[0].cToken, borrower.collateral[0].cToken, 0n],
        {
          gas: BigInt(1e9),
          account: process.env.ETHEREUM_ADMIN_ACCOUNT! as Address
        }
      );
    case LiquidationStrategy.UNISWAP:
      return await sdk.contracts.IonicLiquidator.estimateGas.safeLiquidateToTokensWithFlashLoan(
        [
          {
            borrower: borrower.account,
            repayAmount: liquidationAmount,
            cErc20: borrower.debt[0].cToken,
            cTokenCollateral: borrower.collateral[0].cToken,
            minProfitAmount: 0n,
            redemptionStrategies: strategiesAndDatas.strategies,
            strategyData: strategiesAndDatas.datas,
            flashSwapContract: flashSwapPair,
            debtFundingStrategies,
            debtFundingStrategiesData
          }
        ],
        {
          gas: BigInt(1e9),
          account: process.env.ETHEREUM_ADMIN_ACCOUNT! as Address
        }
      );
  }
};

export default estimateGas;
