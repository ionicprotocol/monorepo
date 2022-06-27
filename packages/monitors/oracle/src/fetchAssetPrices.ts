import { Fuse } from "@midas-capital/sdk";
import { BigNumber } from "ethers";

import { verifyPriceFeed } from "./index";

export default async function fetchAssetPrices(fuse: Fuse): Promise<BigNumber[]> {
  const supportedAssets = fuse.supportedAssets;
  const results: BigNumber[] = await Promise.all(
    supportedAssets.map(async (a): Promise<BigNumber> => {
      return await verifyPriceFeed(fuse, a);
    })
  );
  return results;
}
