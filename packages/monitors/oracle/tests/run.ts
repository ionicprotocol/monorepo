import { JsonRpcProvider } from "@ethersproject/providers";
import { IonicSdk } from "@ionicprotocol/sdk";
import { SupportedChains } from "@ionicprotocol/types";
import { Wallet } from "ethers";

import { assets, configs, verifiers } from "../src/config";
import { baseConfig } from "../src/config/variables";
import { logger, setUpSdk } from "../src/logger";
import { BatchVerifier } from "../src/services/verifier";
import { OracleVerifierAsset, Services } from "../src/types";

export async function runVerifier(sdk: IonicSdk, service: Services, assetsOverride?: OracleVerifierAsset[]) {
  logger.info(`RUNNING SERVICE: ${service}`);
  const assetsToVerify = assetsOverride ? assetsOverride : assets[service];
  const verifier = new BatchVerifier(sdk, assetsToVerify);
  await verifier.batchVerify(verifiers[service], configs[service]);
}

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);
  const signer = new Wallet(baseConfig.adminPrivateKey, provider);
  const ionicSdk = setUpSdk(chainId, signer);

  runVerifier(ionicSdk, baseConfig.service);
})();
