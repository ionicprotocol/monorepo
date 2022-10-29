import { MidasSdk } from "@midas-capital/sdk";

import { SupportedAssetPriceFeed, verifyPriceFeed } from "../index";

import { verifyPriceValue } from "./verifyPriceValue";

export default async function verify(midasSdk: MidasSdk): Promise<SupportedAssetPriceFeed[]> {
  const supportedAssets = midasSdk.supportedAssets.filter((a) => a.disabled === undefined || !a.disabled);
  let result: SupportedAssetPriceFeed;
  const results: SupportedAssetPriceFeed[] = [];

  for (const asset of supportedAssets.slice(0, 5)) {
    console.log("Operating on asset", asset.symbol);

    result = await verifyPriceFeed(midasSdk, asset);
    results.push(result);
    await verifyPriceValue(midasSdk, asset, result.priceBN);
  }
  for (const result of results) {
    console.log(result);
  }
  return results;
}
