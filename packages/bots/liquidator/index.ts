import { JsonRpcProvider } from "@ethersproject/providers";
import dotenv from "dotenv";

import { config, liquidatePositions, logger } from "./src";
import { Liquidator } from "./src/services";
import { setUpSdk } from "./src/utils";

dotenv.config();

(async function runBot() {
  const provider = new JsonRpcProvider({ url: config.rpcUrl, throttleLimit: 1000, throttleSlotInterval: 1000 });
  try {
    await provider.getNetwork();
  } catch (e) {
    logger.error(`Error (${e}) fetching network, timing out and restarting...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await runBot();
  }

  logger.info(`Starting liquidation bot on chain: ${config.chainId}`);

  const midasSdk = setUpSdk(config.chainId, provider);
  const liquidator = new Liquidator(midasSdk);

  midasSdk.logger.info(`Config for bot: ${JSON.stringify({ ...midasSdk.chainLiquidationConfig, ...config })}`);
  liquidatePositions(liquidator);
})();
