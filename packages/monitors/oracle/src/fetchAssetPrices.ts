import { Fuse } from "@midas-capital/sdk";

import { SupportedAssetPriceFeed, verifyPriceFeed } from "./index";

export default async function fetchAssetPrices(fuse: Fuse): Promise<SupportedAssetPriceFeed[]> {
  const supportedAssets = fuse.supportedAssets;
  const results = await Promise.all(
    supportedAssets.map(async (a): Promise<SupportedAssetPriceFeed> => {
      return await verifyPriceFeed(fuse, a);
    })
  );
  return results;
}
