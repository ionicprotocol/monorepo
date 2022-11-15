import { MidasSdk } from "@midas-capital/sdk";
import { SupportedAsset } from "@midas-capital/types";

import { assets, configs, verifiers } from "./config";
import { BatchVerifier } from "./services/verifier";
import { Services } from "./types";

import { logger } from ".";

export async function runVerifier(sdk: MidasSdk, service: Services, assetsOverride?: SupportedAsset[]) {
  logger.info(`RUNNING SERVICE: ${service}`);
  const assetsToVerify = assetsOverride ? assetsOverride : assets[service];
  const verifier = new BatchVerifier(sdk, assetsToVerify);
  await verifier.batchVerify(verifiers[service], configs[service]);
}

export async function runVerifiers(midasSdk: MidasSdk) {
  const feedVerifierConfig = configs[Services.FeedVerifier];
  const priceVerifierConfig = configs[Services.PriceVerifier];

  setInterval(runVerifier, feedVerifierConfig.runInterval, midasSdk, Services.FeedVerifier);
  setInterval(runVerifier, priceVerifierConfig.runInterval, midasSdk, Services.PriceVerifier);
}
