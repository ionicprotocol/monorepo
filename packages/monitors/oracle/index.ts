import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";

import { logger, verifyAndRepeat } from "./src";
import { config } from "./src/config";

(async function runBot() {
  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);
  try {
    await provider.getNetwork();
  } catch (e) {
    logger.error(`Error (${e}) fetching network, timing out and restarting...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await runBot();
  }
  verifyAndRepeat(config.chainId, signer);
})();
