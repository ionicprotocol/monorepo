import { MidasSdk } from "@midas-capital/sdk";

import { assets, configs, verifiers } from "./config";
import { BatchVerifier } from "./services/verifier";
import { OracleVerifierAsset, Services } from "./types";

import { logger } from ".";

export async function runVerifier(sdk: MidasSdk, service: Services, assetsOverride?: OracleVerifierAsset[]) {
  logger.info(`RUNNING SERVICE: ${service}`);
  const assetsToVerify = assetsOverride ? assetsOverride : assets[service];
  const verifier = new BatchVerifier(sdk, assetsToVerify);
  await verifier.batchVerify(verifiers[service], configs[service]);
}

export async function runVerifiers(midasSdk: MidasSdk) {
  const feedVerifierConfig = configs[Services.FeedVerifier];
  const priceVerifierConfig = configs[Services.PriceVerifier];
  const priceChangeVerifierConfig = configs[Services.PriceChangeVerifier];

  setInterval(runVerifier, feedVerifierConfig.runInterval, midasSdk, Services.FeedVerifier);
  setInterval(runVerifier, priceVerifierConfig.runInterval, midasSdk, Services.PriceVerifier);
  setInterval(runVerifier, priceChangeVerifierConfig.runInterval, midasSdk, Services.PriceChangeVerifier);
}
