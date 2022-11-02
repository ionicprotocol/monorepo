import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";

import { logger, runVerifier, setUpSdk } from "./src";
import { getConfig } from "./src/config";

(async function runBot() {
  const config = getConfig();
  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);
  try {
    await provider.getNetwork();
  } catch (e) {
    logger.error(`Error (${e}) fetching network, timing out and restarting...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await runBot();
  }
  const sdk = setUpSdk(config.chainId, signer);
  const results = await runVerifier(sdk);
  // await updateOracleMonitorData(results);
  console.log({ results });
  await setTimeout(runBot, config.runInterval);
})();
