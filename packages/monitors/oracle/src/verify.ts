import { Fuse } from "@midas-capital/sdk";

import { SupportedAssetPriceFeed, verifyPriceFeed } from "./index";

export default async function verify(fuse: Fuse): Promise<SupportedAssetPriceFeed[]> {
  const supportedAssets = fuse.supportedAssets.filter((a) => a.disabled === undefined || !a.disabled);
  let result: SupportedAssetPriceFeed;
  const results: SupportedAssetPriceFeed[] = [];

  for (const asset of supportedAssets) {
    result = await verifyPriceFeed(fuse, asset);
    results.push(result);
  }
  return results;
}
