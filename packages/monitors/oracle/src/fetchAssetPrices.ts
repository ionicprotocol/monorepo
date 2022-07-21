import { Fuse } from "@midas-capital/sdk";

import { SupportedAssetPriceFeed, verifyPriceFeed } from "./index";

export default async function fetchAssetPrices(fuse: Fuse): Promise<SupportedAssetPriceFeed[]> {
  const skip = ["BUSD-USDT", "TUSD"];
  const supportedAssets = fuse.supportedAssets.filter((a) => skip.indexOf(a.symbol) === -1);

  let result: SupportedAssetPriceFeed;
  const results: SupportedAssetPriceFeed[] = [];
  for (const asset of supportedAssets) {
    result = await verifyPriceFeed(fuse, asset);
    results.push(result);
  }
  console.log(results);
  // const results = await Promise.all(
  //   supportedAssets.map(async (a): Promise<SupportedAssetPriceFeed> => {
  //     return await verifyPriceFeed(fuse, a);
  //   })
  // );

  // const results = await Promise.all(
  //   supportedAssets.map(async (a): Promise<SupportedAssetPriceFeed> => {
  //     return await verifyPriceFeed(fuse, a);
  //   })
  // );
  return results;
}
