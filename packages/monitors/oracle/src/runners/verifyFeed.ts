import { MidasSdk } from "@midas-capital/sdk";

import { logger } from "../";
import { FeedVerifier } from "../services";
import { SupportedAssetPriceFeed } from "../types";

export default async function verify(midasSdk: MidasSdk): Promise<SupportedAssetPriceFeed[]> {
  const supportedAssets = midasSdk.supportedAssets.filter((a) => a.disabled === undefined || !a.disabled);
  const results: SupportedAssetPriceFeed[] = [];

  for (const asset of supportedAssets.slice(0, 5)) {
    logger.debug(`Operating on asset: ${asset.symbol} (${asset.underlying})`);

    const oracleVerifier = await new FeedVerifier(midasSdk, asset).init();
    if (oracleVerifier !== null) {
      const result = await oracleVerifier.verify();
      if (result !== null) {
        results.push({ feedValidity: result, asset });
      }
    }
  }
  for (const result of results) {
    console.log(result);
  }
  return results;
}
