import { MidasSdk } from "@midas-capital/sdk";
import { logger } from "ethers";

import { Verifier } from "./services/verifier";

export async function run(midasSdk: MidasSdk) {
  const supportedAssets = midasSdk.supportedAssets.filter((a) => a.disabled === undefined || !a.disabled);

  for (const asset of supportedAssets.slice(0, 5)) {
    logger.debug(`Operating on asset: ${asset.symbol} (${asset.underlying})`);
    const verifierService = new Verifier(midasSdk, asset);
    const result = await verifierService.verify();
    if (result !== null) {
      const poolsWithAsset = await verifierService.poolService.getPoolsWithAsset();
      console.log(poolsWithAsset);
      //   const action = await verifierService.adminService.pauseAllPools(poolsWithAsset);
    }
  }
}
