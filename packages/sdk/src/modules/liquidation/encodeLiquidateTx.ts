import { EncodedLiquidationTx, FusePoolUserWithAssets, logLiquidation } from "./utils";
import { StrategyAndData } from "./redemptionStrategy";
import { BigNumber } from "ethers";
import { FuseBase } from "../../Fuse";
import { LiquidationKind } from "../../enums";

export default async function encodeLiquidateTx(
  fuse: FuseBase,
  liquidationKind: LiquidationKind,
  borrower: FusePoolUserWithAssets,
  exchangeToTokenAddress: string,
  strategyAndData: StrategyAndData,
  liquidationAmount: BigNumber,
  minProfitAmountScaled: BigNumber
): Promise<EncodedLiquidationTx> {
  logLiquidation(borrower, exchangeToTokenAddress, liquidationAmount, borrower.debt[0].underlyingSymbol);

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
          strategyAndData.strategyAddress,
          strategyAndData.strategyData,
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
          strategyAndData.strategyAddress,
          strategyAndData.strategyData,
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
          strategyAndData.strategyAddress,
          strategyAndData.strategyData,
          0,
        ],
        value: BigNumber.from(0),
      };
    case LiquidationKind.UNISWAP_TOKEN_BORROW:
      return {
        method: "safeLiquidateToTokensWithFlashLoan",
        args: [
          borrower.account,
          liquidationAmount,
          borrower.debt[0].cToken,
          borrower.collateral[0].cToken,
          0,
          exchangeToTokenAddress,
          fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER,
          fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER,
          strategyAndData.strategyAddress,
          strategyAndData.strategyData,
          0,
        ],
        value: BigNumber.from(0),
      };
  }
}
