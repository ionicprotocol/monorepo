import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";

import config from "./config";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

export const run = async (): Promise<void> => {
  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);

  const sdk = setUpSdk(config.chainId, signer);

  sdk.logger.info(`Starting liquidation bot on chain: ${config.chainId}`);
  sdk.logger.info(`Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config })}`);

  const liquidator = await new Liquidator(sdk);

  const liquidations = liquidator.fetchLiquidations();

  for (const liquidation of liquidations) {
    await liquidator.liquidate(liquidation);
  }
};

run();
