import { TransactionReceipt } from "viem";

import { IonicBase } from "../../IonicSdk";

import { FlashSwapLiquidationTxParams, LiquidatablePool } from "./utils";

import { sendTransactionToSafeLiquidator } from "./index";

export default async function liquidateUnhealthyBorrows(
  sdk: IonicBase,
  liquidatablePool: LiquidatablePool
): Promise<[Array<{ tx: FlashSwapLiquidationTxParams; error: string }>, Array<TransactionReceipt>]> {
  const erroredLiquidations: Array<{ tx: FlashSwapLiquidationTxParams; error: string }> = [];
  const succeededLiquidations: Array<TransactionReceipt> = [];

  for (const liquidation of liquidatablePool.liquidations) {
    const params = liquidation;
    sdk.logger.info(
      `Sending liquidation for:\n comptroller: ${
        liquidatablePool.comptroller
      }\n method: safeLiquidateToTokensWithFlashLoan\n params: ${JSON.stringify(params)}\n value: 0n\n`
    );
    try {
      const transactionResponse = await sendTransactionToSafeLiquidator(sdk, params);
      succeededLiquidations.push(transactionResponse);
    } catch (error) {
      const msg = "Error sending sendTransactionToSafeLiquidator transaction: " + error;
      erroredLiquidations.push({ tx: liquidation, error: msg });
    }
  }
  return [erroredLiquidations, succeededLiquidations];
}
