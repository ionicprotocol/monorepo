import { JsonRpcProvider } from "@ethersproject/providers";
import { SupportedChains } from "@midas-capital/sdk";
import dotenv from "dotenv";

import { approveTokensToSafeLiquidator, liquidateAndRepeat, logger } from "./src";

dotenv.config();

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);

  logger.info(`Starting liquidation bot on chain: ${chainId}`);
  if (process.env.LIQUIDATION_STRATEGY === "") {
    for (const tokenAddress of process.env.SUPPORTED_OUTPUT_CURRENCIES!.split(",")) {
      // approve tokens
      await approveTokensToSafeLiquidator(chainId, provider, tokenAddress);
    }
  }
  liquidateAndRepeat(chainId, provider);
})();
