import { createPublicClient, createWalletClient, fallback, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BotType } from "@ionicprotocol/sdk";

import config from "./config";
import { liquidatePositions } from "./liquidatePositions";
import { setUpSdk } from "./utils";
import { logger } from "./logger";

export const account = privateKeyToAccount(config.adminPrivateKey as Hex);

export const client = createPublicClient({
  transport: fallback(config.rpcUrls.map((url) => http(url))),
  batch: { multicall: { wait: 10 } },
});

export const walletClient = createWalletClient({
  account,
  transport: fallback(config.rpcUrls.map((url) => http(url))),
});

export const sdk = setUpSdk(config.chainId, client as any, walletClient);

const run = async () => {
  logger.info(`Starting liquidation bot on chain: ${config.chainId}`);
  logger.info(
    `Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config, adminPrivateKey: "***********" })}`
  );
  await liquidatePositions(BotType.Standard);
};

run();
