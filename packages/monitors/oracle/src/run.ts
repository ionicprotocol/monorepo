import { MidasSdk } from "@midas-capital/sdk";

import { assets, configs, verifiers } from "./config";
import { Verifier } from "./services/verifier";
import { PriceFeedValidity, ServiceConfig, Services } from "./types";

import { logger } from ".";

async function runVerifier(sdk: MidasSdk, service: Services, config: ServiceConfig) {
  const results: Array<PriceFeedValidity> = [];
  logger.info(`RUNNING SERVICE: ${service}`);

  for (const asset of assets[service]) {
    logger.debug(`SERVICE ${service}: Operating on asset: ${asset.symbol} (${asset.underlying})`);

    const verifierClass = await new Verifier(sdk, verifiers[service], asset, config).init();
    if (verifierClass) {
      const result = await verifierClass.verify();
      if (result !== true) {
        results.push(result);
        logger.error(`SERVICE ${service}: INVALID REASON: ${result.invalidReason} MSG: ${result.message}`);
        //   const action = await verifierService.adminService.pauseAllPools(poolsWithAsset);
      } else {
        logger.debug(`SERVICE ${service}: Price feed for ${asset.symbol} is valid`);
      }
    } else {
      logger.error(`SERVICE ${service}: Could not initialize verifier for ${asset.symbol}`);
    }
  }
}

export async function runVerifiers(midasSdk: MidasSdk) {
  const feedVerifierConfig = configs[Services.FeedVerifier];
  const priceVerifierConfig = configs[Services.PriceVerifier];

  setInterval(runVerifier, feedVerifierConfig.runInterval, midasSdk, Services.FeedVerifier, feedVerifierConfig);
  setInterval(runVerifier, priceVerifierConfig.runInterval, midasSdk, Services.PriceVerifier, priceVerifierConfig);
}
