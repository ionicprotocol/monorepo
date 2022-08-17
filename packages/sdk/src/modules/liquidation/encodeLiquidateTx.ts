import { LiquidationKind } from "@midas-capital/types";
import { BigNumber } from "ethers";

import { MidasBase } from "../../MidasSdk";

import { StrategiesAndDatas } from "./redemptionStrategy";
import { EncodedLiquidationTx, FusePoolUserWithAssets, logLiquidation } from "./utils";

export default async function encodeLiquidateTx(
  fuse: MidasBase,
  liquidationKind: LiquidationKind,
  borrower: FusePoolUserWithAssets,
  exchangeToTokenAddress: string,
  strategiesAndDatas: StrategiesAndDatas,
  liquidationAmount: BigNumber,
  flashSwapPair: string,
  minProfitAmountScaled: BigNumber,
  debtFundingStrategies: any[],
  debtFundingStrategiesData: any[]
): Promise<EncodedLiquidationTx> {
  logLiquidation(
    borrower,
    exchangeToTokenAddress,
    liquidationAmount,
    borrower.debt[0].underlyingSymbol,
    liquidationKind,
    debtFundingStrategies
  );

  switch (liquidationKind) {
    case LiquidationKind.DEFAULT_NATIVE_BORROW:
      return {
        method: "safeLiquidate(address,address,address,uint256,address,address,address[],bytes[])",
        args: [
          borrower.account,
          borrower.debt[0].cToken,
          borrower.collateral[0].cToken,
          0,
          borrower.collateral[0].cToken,
          exchangeToTokenAddress,
          strategiesAndDatas.strategies,
          strategiesAndDatas.datas,
        ],
        value: liquidationAmount,
      };
    case LiquidationKind.DEFAULT_TOKEN_BORROW:
      return {
        method: "safeLiquidate(address,uint256,address,address,uint256,address,address,address[],bytes[])",
        args: [
          borrower.account,
          liquidationAmount,
          borrower.debt[0].cToken,
          borrower.collateral[0].cToken,
          0,
          borrower.collateral[0].cToken,
          exchangeToTokenAddress,
          strategiesAndDatas.strategies,
          strategiesAndDatas.datas,
        ],
        value: BigNumber.from(0),
      };
    case LiquidationKind.UNISWAP_NATIVE_BORROW:
      return {
        method: "safeLiquidateToEthWithFlashLoan",
        args: [
          borrower.account,
          // liquidationAmount.div(20),
          liquidationAmount,
          borrower.debt[0].cToken,
          borrower.collateral[0].cToken,
          minProfitAmountScaled,
          exchangeToTokenAddress,
          fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER,
          strategiesAndDatas.strategies,
          strategiesAndDatas.datas,
          0,
        ],
        value: BigNumber.from(0),
      };
    case LiquidationKind.UNISWAP_TOKEN_BORROW:
      return {
        method: "safeLiquidateToTokensWithFlashLoan",
        args: [
          {
            borrower: borrower.account,
            repayAmount: liquidationAmount,
            cErc20: borrower.debt[0].cToken,
            cTokenCollateral: borrower.collateral[0].cToken,
            minProfitAmount: 0,
            flashSwapPair,
            exchangeProfitTo: exchangeToTokenAddress,
            uniswapV2RouterForBorrow: fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER,
            uniswapV2RouterForCollateral: fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER,
            redemptionStrategies: strategiesAndDatas.strategies,
            strategyData: strategiesAndDatas.datas,
            ethToCoinbase: 0,
            debtFundingStrategies,
            debtFundingStrategiesData,
          },
        ],
        value: BigNumber.from(0),
      };
  }
}
