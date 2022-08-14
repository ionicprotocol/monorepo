import { MidasSdk } from "@midas-capital/sdk";
import { LiquidatablePool } from "@midas-capital/sdk/dist/cjs/src/modules/liquidation/utils";
import { Wallet } from "ethers";

import { config, logger, sendTransactionToSafeLiquidator } from "./index";

export default async function liquidateUnhealthyBorrows(midasSdk: MidasSdk, retries = 0) {
  if (retries >= 10) {
    throw "10 retries fetching liquidations, exiting";
  }
  const signer = new Wallet(config.adminPrivateKey, midasSdk.provider);
  let potentialLiquidations: Array<LiquidatablePool> = [];
  try {
    potentialLiquidations = await midasSdk.getPotentialLiquidations(signer);
  } catch (error) {
    const msg = "Error sending sendTransactionToSafeLiquidator transaction: " + error;
    logger.error(msg);
    retries += 1;
    await new Promise((resolve) => setTimeout(resolve, (retries + 1) * 5000));
    await liquidateUnhealthyBorrows(midasSdk, retries);
  }

  if (potentialLiquidations.length == 0) {
    logger.info("No liquidatable pools found. Timing out and restarting...");
  }
  for (const poolLiquidations of potentialLiquidations) {
    if (poolLiquidations.liquidations.length > 0) {
      for (const liquidation of poolLiquidations.liquidations) {
        try {
          await sendTransactionToSafeLiquidator(midasSdk, liquidation.method, liquidation.args, liquidation.value);
        } catch (error) {
          const msg = "Error sending sendTransactionToSafeLiquidator transaction: " + error;
          logger.error(msg);
          throw msg;
        }
      }
    }
  }
}
