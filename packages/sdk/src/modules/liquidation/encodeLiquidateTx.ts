import { LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import { IonicBase } from "../../IonicSdk";

import { StrategiesAndDatas } from "./redemptionStrategy";
import { EncodedLiquidationTx, logLiquidation, PoolUserWithAssets } from "./utils";

export default async function encodeLiquidateTx(
  sdk: IonicBase,
  liquidationStrategy: LiquidationStrategy,
  borrower: PoolUserWithAssets,
  exchangeToTokenAddress: string,
  strategiesAndDatas: StrategiesAndDatas,
  liquidationAmount: BigNumber,
  flashSwapPair: string,
  debtFundingStrategies: any[],
  debtFundingStrategiesData: any[]
): Promise<EncodedLiquidationTx> {
  logLiquidation(
    sdk,
    borrower,
    exchangeToTokenAddress,
    liquidationAmount,
    borrower.debt[0].underlyingSymbol,
    liquidationStrategy,
    debtFundingStrategies
  );

  switch (liquidationStrategy) {
    case LiquidationStrategy.DEFAULT:
      return {
        method: "safeLiquidate(address,uint256,address,address,uint256,address,address,address[],bytes[])",
        args: [
          borrower.account,
          liquidationAmount,
          borrower.debt[0].cToken,
          borrower.collateral[0].cToken,
          0,
          exchangeToTokenAddress,
          sdk.chainSpecificAddresses.UNISWAP_V2_ROUTER,
          strategiesAndDatas.strategies,
          strategiesAndDatas.datas
        ],
        value: BigNumber.from(0)
      };
    case LiquidationStrategy.UNISWAP:
      return {
        method: "safeLiquidateToTokensWithFlashLoan",
        args: [
          {
            borrower: borrower.account,
            repayAmount: liquidationAmount,
            cErc20: borrower.debt[0].cToken,
            cTokenCollateral: borrower.collateral[0].cToken,
            minProfitAmount: 0,
            flashSwapContract: flashSwapPair,
            exchangeProfitTo: exchangeToTokenAddress,
            redemptionStrategies: strategiesAndDatas.strategies,
            strategyData: strategiesAndDatas.datas,
            ethToCoinbase: 0,
            debtFundingStrategies,
            debtFundingStrategiesData
          }
        ],
        value: BigNumber.from(0)
      };
  }
}
