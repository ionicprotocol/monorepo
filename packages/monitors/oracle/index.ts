import { JsonRpcProvider } from "@ethersproject/providers";
import { SupportedChains } from "@midas-capital/sdk";
import dotenv from "dotenv";

import { fetchPricesAndRepeat, logger } from "./src";

dotenv.config();

(async function runBot() {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);

  try {
    await provider.getNetwork();
  } catch (e) {
    logger.error(`Error (${e}) fetching network, timing out and restarting...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await runBot();
  }
  fetchPricesAndRepeat(chainId, provider);
})();
