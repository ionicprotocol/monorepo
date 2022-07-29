import { MidasSdk } from "@midas-capital/sdk";

import { SupportedAssetPriceFeed, verifyPriceFeed } from "./index";

export default async function verify(midasSdk: MidasSdk): Promise<SupportedAssetPriceFeed[]> {
  const supportedAssets = midasSdk.supportedAssets.filter((a) => a.disabled === undefined || !a.disabled);
  let result: SupportedAssetPriceFeed;
  const results: SupportedAssetPriceFeed[] = [];

  for (const asset of supportedAssets) {
    result = await verifyPriceFeed(midasSdk, asset);
    results.push(result);
  }
  return results;
}
