import { MidasSdk } from "@midas-capital/sdk";

import { logger, SupportedAssetPriceFeed } from ".";

import { OracleVerifier } from "./verifier";

export default async function verify(midasSdk: MidasSdk): Promise<SupportedAssetPriceFeed[]> {
  const supportedAssets = midasSdk.supportedAssets.filter((a) => a.disabled === undefined || !a.disabled);
  const results: SupportedAssetPriceFeed[] = [];

  for (const asset of supportedAssets.slice(0, 5)) {
    logger.debug(`Operating on asset: ${asset.symbol} (${asset.underlying})`);

    const oracleVerifier = new OracleVerifier(midasSdk, asset);
    const result = await oracleVerifier.verify();
    if (result !== null) {
      const { mpoPrice, priceValidity, feedValidity } = result;
      results.push({ asset, mpoPrice, priceValidity, feedValidity });
    }
  }
  for (const result of results) {
    console.log(result);
  }
  return results;
}
