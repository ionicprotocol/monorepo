import { JsonRpcProvider } from "@ethersproject/providers";
import dotenv from "dotenv";

import { config, liquidatePositions, logger } from "./src";

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
  await liquidatePositions(config.chainId, provider);
  setTimeout(runBot, 2 * 1e9);
})();
