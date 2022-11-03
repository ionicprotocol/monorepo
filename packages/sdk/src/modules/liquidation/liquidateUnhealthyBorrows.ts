import { TransactionResponse } from "@ethersproject/providers";

import { MidasBase } from "../../MidasSdk";

import { EncodedLiquidationTx, LiquidatablePool } from "./utils";

import { sendTransactionToSafeLiquidator } from "./index";

export default async function liquidateUnhealthyBorrows(
  midasSdk: MidasBase,
  liquidatablePool: LiquidatablePool
): Promise<[Array<{ tx: EncodedLiquidationTx; error: string }>, Array<TransactionResponse>]> {
  const erroredLiquidations: Array<{ tx: EncodedLiquidationTx; error: string }> = [];
  const succeededLiquidations: Array<TransactionResponse> = [];

  for (const liquidation of liquidatablePool.liquidations) {
    const { method, args, value } = liquidation;
    console.log(
      `Sending liquidation for:\n comptroller: ${liquidatablePool.comptroller}\n method: ${method}\n params: ${args}\n value: ${value}\n`
    );
    try {
      const transactionResponse = await sendTransactionToSafeLiquidator(midasSdk, method, args, value);
      succeededLiquidations.push(transactionResponse);
    } catch (error) {
      const msg = "Error sending sendTransactionToSafeLiquidator transaction: " + error;
      erroredLiquidations.push({ tx: liquidation, error: msg });
    }
  }
  return [erroredLiquidations, succeededLiquidations];
}
