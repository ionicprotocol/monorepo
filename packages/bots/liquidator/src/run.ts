import { createPublicClient, createWalletClient, fallback, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import config from "./config";
import liquidatePositions from "./liquidatePositions";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

const run = async () => {
  const account = privateKeyToAccount(config.adminPrivateKey as Hex);

  const client = createPublicClient({
    transport: fallback(config.rpcUrls.map((url) => http(url))),
  });

  const walletClient = createWalletClient({
    account,
    transport: fallback(config.rpcUrls.map((url) => http(url))),
  });

  const sdk = setUpSdk(config.chainId, client as any, walletClient);

  const liquidator = new Liquidator(sdk);

  sdk.logger.info(`Starting liquidation bot on chain: ${config.chainId}`);
  sdk.logger.info(
    `Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config, adminPrivateKey: "***********" })}`
  );
  await liquidatePositions(liquidator);
};

run();
