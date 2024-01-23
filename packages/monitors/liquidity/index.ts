import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";

import { logger, runVerifiers, setUpSdk } from "./src";
import { baseConfig } from "./src/config/variables";

(async function runBot() {
  const provider = new JsonRpcProvider(baseConfig.rpcUrl);
  const signer = new Wallet(baseConfig.adminPrivateKey, provider);
  try {
    await provider.getNetwork();
  } catch (e) {
    logger.error(`Error (${e}) fetching network, timing out and restarting...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await runBot();
  }
  const sdk = setUpSdk(baseConfig.chainId, signer);
  await runVerifiers(sdk);

  // TODO: implement persistence
  // await updateOracleMonitorData(results);
  setTimeout(runBot, 2 * 1e9);
})();
