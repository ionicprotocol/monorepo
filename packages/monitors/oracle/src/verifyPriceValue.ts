import { Fuse } from "@midas-capital/sdk";
import { BigNumber, utils } from "ethers";

import { getCgPrice, logger } from "./index";

export default async function verifyPriceValue(fuse: Fuse, price: BigNumber) {
  const nativeTokenPriceUSD = await getCgPrice(fuse.chainSpecificParams.cgId);
  const assetPriceUSD = parseFloat(utils.formatEther(price)) * nativeTokenPriceUSD;
  logger.info(assetPriceUSD);
}
