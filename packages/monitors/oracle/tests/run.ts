import { JsonRpcProvider } from "@ethersproject/providers";
import { MidasSdk } from "@midas-capital/sdk";
import { SupportedChains } from "@midas-capital/types";
import { Wallet } from "ethers";

import { assets, configs, verifiers } from "../src/config";
import { baseConfig } from "../src/config/variables";
import { logger, setUpSdk } from "../src/logger";
import { BatchVerifier } from "../src/services/verifier";
import { OracleVerifierAsset, Services } from "../src/types";

export async function runVerifier(sdk: MidasSdk, service: Services, assetsOverride?: OracleVerifierAsset[]) {
  logger.info(`RUNNING SERVICE: ${service}`);
  const assetsToVerify = assetsOverride ? assetsOverride : assets[service];
  const verifier = new BatchVerifier(sdk, assetsToVerify);
  await verifier.batchVerify(verifiers[service], configs[service]);
}

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);
  const signer = new Wallet(baseConfig.adminPrivateKey, provider);
  const midasSdk = setUpSdk(chainId, signer);

  const assetsOverride = assets[Services.FeedVerifier];
  const priceChangeVerifierAssetsOverride = assets[Services.PriceChangeVerifier];

  switch (baseConfig.service) {
    case Services.FeedVerifier:
      runVerifier(midasSdk, Services.FeedVerifier, assetsOverride);
      break;
    case Services.PriceVerifier:
      runVerifier(midasSdk, Services.PriceVerifier, assetsOverride);
      break;
    case Services.PriceChangeVerifier:
      runVerifier(midasSdk, Services.PriceChangeVerifier, priceChangeVerifierAssetsOverride);
  }
})();
