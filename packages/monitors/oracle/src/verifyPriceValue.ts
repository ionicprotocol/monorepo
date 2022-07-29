import { MidasSdk } from "@midas-capital/sdk";
import { BigNumber, utils } from "ethers";

import { getCgPrice, logger } from "./index";

export default async function verifyPriceValue(midasSdk: MidasSdk, price: BigNumber) {
  const nativeTokenPriceUSD = await getCgPrice(midasSdk.chainSpecificParams.cgId);
  const assetPriceUSD = parseFloat(utils.formatEther(price)) * nativeTokenPriceUSD;
  logger.info(assetPriceUSD);
}
