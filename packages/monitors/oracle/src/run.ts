import { MidasSdk } from "@midas-capital/sdk";

import { Verifier } from "./services/verifier";

import { logger } from ".";

export async function runVerifier(midasSdk: MidasSdk) {
  const supportedAssets = midasSdk.supportedAssets.filter((a) => a.disabled === undefined || !a.disabled);

  for (const asset of supportedAssets.slice(0, 5)) {
    logger.debug(`Operating on asset: ${asset.symbol} (${asset.underlying})`);
    const verifierService = await new Verifier(midasSdk, asset).init();

    const result = await verifierService.verify();
    if (result !== null) {
      const poolsWithAsset = await verifierService.poolService.getPoolsWithAsset();
      console.log(poolsWithAsset);

      // Take action on the pools with the asset
      // TODO: make this safer -- we don't want to brick pools

      //   const action = await verifierService.adminService.pauseAllPools(poolsWithAsset);
    } else {
      logger.debug("No invalidity found");
    }
  }
}
