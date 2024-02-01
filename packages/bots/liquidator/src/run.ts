import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";

import config from "./config";
import liquidatePositions from "./liquidatePositions";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

const run = async () => {
  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);

  const sdk = setUpSdk(config.chainId, signer);

  const liquidator = new Liquidator(sdk);

  sdk.logger.info(`Starting liquidation bot on chain: ${config.chainId}`);
  sdk.logger.info(
    `Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config, adminPrivateKey: "***********" })}`
  );
  await liquidatePositions(liquidator);
};

run();
