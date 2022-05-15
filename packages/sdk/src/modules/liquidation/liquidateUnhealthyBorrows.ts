import { sendTransactionToSafeLiquidator } from "./index";
import { FuseBase } from "../../Fuse";
import { LiquidatablePool } from "./utils";

export default async function liquidateUnhealthyBorrows(
  fuse: FuseBase,
  liquidations: Array<LiquidatablePool>
) {
  for (const liquidatablePool of liquidations) {
    for (const liquidation of liquidatablePool.liquidations) {
      const { method, args, value } = liquidation;
      console.log(
        `Sending liquidation for:\n comptroller: ${liquidatablePool.comptroller}\n method: ${method}\n params: ${args}\n value: ${value}\n`
      );
      try {
        await sendTransactionToSafeLiquidator(fuse, method, args, value);
      } catch (error) {
        throw (
          "Error sending sendTransactionToSafeLiquidator transaction: " + error
        );
      }
    }
  }
}
