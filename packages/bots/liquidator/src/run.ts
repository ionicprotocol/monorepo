import { createPublicClient, createWalletClient, fallback, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BotType } from "@ionicprotocol/sdk";
import axios from "axios";

import config from "./config";
import { liquidatePositions } from "./liquidatePositions";
import { logger } from "./logger";
import { setUpSdk } from "./utils";

// Add heartbeat URL check
const HEARTBEAT_API_URL = process.env.UPTIME_LIQUIDATOR_API;

if (typeof HEARTBEAT_API_URL === "undefined") {
  logger.error("Error: UPTIME_LIQUIDATOR_API environment variable is undefined");
} else if (typeof HEARTBEAT_API_URL !== "string") {
  logger.error("Error: UPTIME_LIQUIDATOR_API environment variable is not a string");
} else {
  logger.info(`UPTIME_LIQUIDATOR_API is set to: ${HEARTBEAT_API_URL}`);
}

export const account = privateKeyToAccount(config.adminPrivateKey as Hex);

export const client = createPublicClient({
  transport: fallback(config.rpcUrls.map((url) => http(url))),
  batch: { multicall: { wait: 10 } },
});

export const walletClient = createWalletClient({
  account,
  transport: fallback(config.rpcUrls.map((url) => http(url))),
});

export const sdk = setUpSdk(config.chainId, client, walletClient);

export const run = async (): Promise<void> => {
  try {
    // Trigger heartbeat
    if (HEARTBEAT_API_URL) {
      await axios.get(HEARTBEAT_API_URL);
      logger.info("Heartbeat successfully sent");
    }

    sdk.logger.info(`Starting liquidation bot on chain: ${config.chainId}`);
    sdk.logger.info(`Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config })}`);
    
    await liquidatePositions(BotType.Standard);
  } catch (error) {
    logger.error(`Error in run: ${error}`);
    throw error;
  }
};

// Execute if this file is run directly
if (require.main === module) {
  run().catch((error) => {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
  });
}