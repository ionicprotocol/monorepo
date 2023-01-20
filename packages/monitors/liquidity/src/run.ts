import { MidasSdk } from "@midas-capital/sdk";

import { configs, verifiers } from "./config";
import { MONITORED_CHAIN_ASSETS } from "./config/pools";
import { BatchVerifier } from "./services/verifier";
import { LiquidityPoolKind, MonitoredAssetsConfig, Services } from "./types";

import { logger } from ".";

export async function runVerifier(sdk: MidasSdk, service: Services, assetsOverride?: MonitoredAssetsConfig) {
  const assetsToVerify = assetsOverride ? assetsOverride : MONITORED_CHAIN_ASSETS[sdk.chainId];

  let msg: Array<string> = [];
  Object.values(LiquidityPoolKind).forEach((pk) => {
    msg = [...msg, ...assetsToVerify[pk].map((a) => a.identifier).filter((a) => a)];
  });

  logger.info(`RUNNING SERVICE: ${service} on assets: ${msg.join(", ")}`);

  const verifier = new BatchVerifier(sdk, assetsToVerify);
  await verifier.batchVerify(verifiers[service], configs[service]);
}

export async function runVerifiers(midasSdk: MidasSdk) {
  const liquidityDepthVerifierConfig = configs[Services.LiquidityDepthVerifier];
  setInterval(runVerifier, liquidityDepthVerifierConfig.runInterval, midasSdk, Services.LiquidityDepthVerifier);
}
