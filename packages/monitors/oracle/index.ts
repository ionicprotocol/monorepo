import { JsonRpcProvider } from "@ethersproject/providers";

import { fetchPricesAndRepeat, logger } from "./src";
import { config } from "./src/config";

(async function runBot() {
  const provider = new JsonRpcProvider(config.rpcUrl);

  try {
    await provider.getNetwork();
  } catch (e) {
    logger.error(`Error (${e}) fetching network, timing out and restarting...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await runBot();
  }
  fetchPricesAndRepeat(config.chainId, provider);
})();
