import { JsonRpcProvider } from "@ethersproject/providers";
import { Signer } from "ethers";

import { config } from "./config";

import { runVerifier, setUpSdk } from "./index";

export default async function verifyAndRepeat(chainId: number, provider: Signer | JsonRpcProvider) {
  const sdk = setUpSdk(chainId, provider);
  const results = await runVerifier(sdk);
  console.log(results);
  // await updateOracleMonitorData(results);
  await setTimeout(verifyAndRepeat, config.runInterval, chainId, provider);
}
