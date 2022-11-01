import { SupportedChains } from "@midas-capital/types";
import { utils } from "ethers";

import { logger } from "../../..";
import { getConfig } from "../../../config";
import { InvalidReason, PriceFeedInvalidity, PriceVerifierConfig, VerifyPriceParams } from "../../../types";
import { getDefiLlamaPrice } from "../../../utils";

export async function verifyPriceValue({
  midasSdk,
  asset,
  mpoPrice,
}: VerifyPriceParams): Promise<PriceFeedInvalidity | null> {
  const chainName = SupportedChains[midasSdk.chainId];

  const wrappedNativeId = `${chainName}:${midasSdk.chainSpecificAddresses.W_TOKEN}`;
  const assetId = `${chainName}:${asset.underlying}`;
  const wrappedNativeTokenPriceUSD = await getDefiLlamaPrice(wrappedNativeId);
  const tokenPriceUSD = await getDefiLlamaPrice(assetId);

  const assetPriceUSD = parseFloat(utils.formatEther(mpoPrice)) * wrappedNativeTokenPriceUSD;
  const priceDiff = Math.abs(assetPriceUSD - tokenPriceUSD);
  const priceDiffPercent = (priceDiff / assetPriceUSD) * 100;
  logger.info(`Price difference for asset is ${priceDiffPercent}%`);

  const config = getConfig() as PriceVerifierConfig;
  if (priceDiffPercent > config.maxPriceDeviation) {
    return {
      message: `Price difference for asset is ${priceDiffPercent}%, larger than max allowed ${config.maxPriceDeviation}%`,
      invalidReason: InvalidReason.DEVIATION_ABOVE_THRESHOLD,
    };
  }
  return null;
}
