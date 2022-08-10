import { MidasSdk } from "@midas-capital/sdk";
import { LiquidatablePool } from "@midas-capital/sdk/dist/cjs/src/modules/liquidation/utils";
import { sendTransactionToSafeLiquidator } from "@midas-capital/sdk/dist/cjs/src/modules/liquidation";

import { Wallet } from "ethers";

import { logger } from "./index";

export default async function liquidateOrRetry(midasSdk: MidasSdk, retries = 0) {
  if (retries >= 10) {
    throw "10 retries fetching liquidations, exiting";
  }

  // console.log(`fns ${JSON.stringify(midasSdk.contracts.FuseSafeLiquidator.interface.functions)}`);
  //
  // const method = "justTesting";
  // const params: FuseSafeLiquidator.InputVarsStruct =
  //   {
  //     justAddress: "0xF436D47F962e4AcD96Eb6D87677db91D5f40A204",
  //   }
  // ;
  // const data = midasSdk.contracts.FuseSafeLiquidator.interface.encodeFunctionData(method, [params]);
  //
  // console.log(`GOT ENCODED DATA ${data}`);

  const signer = new Wallet(process.env.ETHEREUM_ADMIN_PRIVATE_KEY!, midasSdk.provider);
  let potentialLiquidations: Array<LiquidatablePool> = [];
  try {
    potentialLiquidations = await midasSdk.getPotentialLiquidations(signer);
  } catch (e) {
    console.log(`Error fetching potential liquidations, timing out and retrying`);
    console.error(e);
    retries += 1;
    await new Promise((resolve) => setTimeout(resolve, (retries + 1) * 5000));
    await liquidateOrRetry(midasSdk, retries);
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
