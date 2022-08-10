import { JsonRpcProvider } from "@ethersproject/providers";
import { SupportedChains } from "@midas-capital/types";
import dotenv from "dotenv";

import { approveTokensToSafeLiquidator, liquidateAndRepeat, logger } from "./src";

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

  logger.info(`Starting liquidation bot on chain: ${chainId}`);
  if (process.env.LIQUIDATION_STRATEGY === "") {
    for (const tokenAddress of process.env.SUPPORTED_OUTPUT_CURRENCIES!.split(",")) {
      // approve tokens
      await approveTokensToSafeLiquidator(chainId, provider, tokenAddress);
    }
  }
  await liquidateAndRepeat(chainId, provider);
})();
